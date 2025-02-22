import pandas as pd
from tqdm import tqdm
from dataclasses import dataclass
from typing import Dict
from enum import Enum
import numpy as np
from sqlalchemy import create_engine

class Strategy:
    """
    Base class for all strategies.
    """
    def __init__(self):
        self.data = None
        self.signal = 0  # -1, 0, 1 for sell, hold, buy

    def update(self, data):
        """Update indicators using data up to current time."""
        self.data = data

    def next(self):
        """Generate signal for the next period."""
        pass

class BollingerStrategy(Strategy):
    """
    A trading strategy based on Bollinger Bands.
    
    Parameters:
    - window: The moving average window (default: 20)
    - num_std: Number of standard deviations for the bands (default: 2)
    """
    def __init__(self, window=20, num_std=2):
        super().__init__()
        self.window = window
        self.num_std = num_std
        self.upper_band = None
        self.lower_band = None
        self.middle_band = None
        
    def update(self, data):
        """
        Update the Bollinger Bands indicators.
        
        Parameters:
        - data: pandas DataFrame with 'close_price' price column
        """
        self.data = data
        
        self.middle_band = self.data['close_price'].rolling(window=self.window).mean()
        
        rolling_std = self.data['close_price'].rolling(window=self.window).std()
        
        self.upper_band = self.middle_band + (rolling_std * self.num_std)
        self.lower_band = self.middle_band - (rolling_std * self.num_std)
        
    def next(self):
        """
        Generate trading signals based on Bollinger Bands.
        Returns: -1 (sell), 0 (hold), or 1 (buy)
        """
        if len(self.data) < self.window:
            return 0
        
        current_price = self.data['close_price'].iloc[-1]
        
        if current_price > self.upper_band.iloc[-1]:
            self.signal = -1  # Sell signal (overbought)
        elif current_price < self.lower_band.iloc[-1]:
            self.signal = 1   # Buy signal (oversold)
        else:
            self.signal = 0   # Hold
            
        return self.signal
    
    def get_bands(self):
        return {
            'upper': self.upper_band,
            'middle': self.middle_band,
            'lower': self.lower_band
        }
    
    
class Order:
    """
    Order to buy or sell a particular asset.
    """
    def __init__(self, symbol, quantity, action, price, date):
        self.symbol = symbol
        self.quantity = quantity
        self.action = action  # 'buy' or 'sell'
        self.price = price
        self.date = date

    def execute(self):
        return Trade(
            symbol=self.symbol,
            quantity=self.quantity,
            action=self.action,
            entry_price=self.price,
            entry_date=self.date
        )


class Trade:
    """
    Trade resulting from an order.
    """
    def __init__(self, symbol, quantity, action, entry_price, entry_date):
        self.symbol = symbol
        self.quantity = quantity
        self.action = action
        self.entry_price = entry_price
        self.exit_price = None
        self.entry_date = entry_date
        self.exit_date = None
        self.pnl = None
    
    def close(self, exit_price, exit_date):
        self.exit_price = exit_price
        self.exit_date = exit_date
        self.pnl = (self.exit_price - self.entry_price) * self.quantity
        if self.action == 'sell':
            self.pnl = -self.pnl

@dataclass
class BacktestConfig:
    initial_capital: float = 100000.0
    commission_rate: float = 0.001  # 0.1%
    slippage_rate: float = 0.001    # 0.1%
    position_size: float = 0.1      # 10% of capital per trade
    stop_loss_pct: float = 1.00     # 100% stop loss
    take_profit_pct: float = float('inf')   # 100% take profit


class Position(Enum):
    LONG = "long"
    SHORT = "short"
    FLAT = "flat"


class Backtest:
    """
    Backtest a particular (parameterized) strategy
    on particular data.
    """
    def __init__(self, data, strategy, config=BacktestConfig()):
        self.data = data
        self.strategy = strategy
        self.config = config

        # Account status
        self.capital = config.initial_capital
        self.equity = config.initial_capital
        self.cash = config.initial_capital

        # Trading records
        self.orders = []
        self.trades = []
        self.positions = {ticker: Position.FLAT for ticker in self.data["ticker"].unique()}
        self.current_trades: Dict[str, Trade] = {}

        # Performance tracking
        self.equity_curve = []
        self.drawdown_curve = []

    def calculate_position_size(self, price: float) -> int:
        """Calculate position size based on current capital and risk settings."""
        position_value = self.capital * self.config.position_size
        return int(position_value / price)

    def apply_slippage(self, price: float, action: str) -> float:
        """Apply slippage to execution price."""
        slippage = price * self.config.slippage_rate
        return price * (1 + slippage) if action == 'buy' else price * (1 - slippage)

    def calculate_commission(self, price: float, quantity: int) -> float:
        """Calculate trading commission."""
        return price * quantity * self.config.commission_rate

    def check_stop_loss(self, trade: Trade, current_price: float) -> bool:
        """Check if stop loss is triggered."""
        if trade.action == 'buy':
            loss_pct = (trade.entry_price - current_price) / trade.entry_price
        else:
            loss_pct = (current_price - trade.entry_price) / trade.entry_price
        return loss_pct > self.config.stop_loss_pct

    def check_take_profit(self, trade: Trade, current_price: float) -> bool:
        """Check if take profit is triggered."""
        if trade.action == 'buy':
            profit_pct = (current_price - trade.entry_price) / trade.entry_price
        else:
            profit_pct = (trade.entry_price - current_price) / trade.entry_price
        return profit_pct > self.config.take_profit_pct

    def execute_order(self, order: Order) -> Trade:
        """Execute order with slippage and commission."""
        execution_price = self.apply_slippage(order.price, order.action)
        commission = self.calculate_commission(execution_price, order.quantity)
        
        trade = order.execute()
        
        # Update account balance
        trade_value = execution_price * order.quantity
        if order.action == 'buy':
            self.cash -= (trade_value + commission)
        else:
            self.cash += (trade_value - commission)
            
        return trade

    def update_equity(self, current_price: float):
        """Update account equity based on current positions."""
        self.equity = self.cash
        for symbol, trade in self.current_trades.items():
            if trade.action == 'buy':
                self.equity += trade.quantity * current_price
            else:
                self.equity += trade.quantity * (trade.entry_price - current_price)
        
        self.equity_curve.append(self.equity)
        self.drawdown_curve.append(self.calculate_drawdown())

    def calculate_drawdown(self) -> float:
        """Calculate current drawdown percentage."""
        if not self.equity_curve:
            return 0.0
        peak = max(self.equity_curve)
        return (peak - self.equity) / peak if peak > self.equity else 0.0

    def run(self):
        """Run backtest with enhanced features."""
        for i in tqdm(range(len(self.data))):
            row = self.data.iloc[i]
            self.strategy.update(self.data.iloc[:i+1])
            signal = self.strategy.next()
            
            # Check stop loss and take profit for existing trades
            for symbol, trade in list(self.current_trades.items()):
                if self.check_stop_loss(trade, row['close_price']) or \
                   self.check_take_profit(trade, row['close_price']):
                    trade.close(row['close_price'], row['date'])
                    self.trades.append(trade)
                    del self.current_trades[symbol]
                    self.positions[symbol] = Position.FLAT

            # Process new signals
            for symbol in self.positions.keys():
                if signal == 1 and self.positions[symbol] == Position.FLAT:
                    quantity = self.calculate_position_size(row['close_price'])
                    if quantity > 0:
                        order = Order(symbol, quantity, 'buy', row['close_price'], row['date'])
                        trade = self.execute_order(order)
                        self.current_trades[symbol] = trade
                        self.positions[symbol] = Position.LONG
                        self.orders.append(order)
                
                elif signal == -1 and self.positions[symbol] == Position.LONG:
                    trade = self.current_trades[symbol]

                    order = Order(symbol, trade.quantity, 'sell', row['close_price'], row['date'])
                    self.execute_order(order)

                    trade.close(row['close_price'], row['date'])
                    self.trades.append(trade)
                    del self.current_trades[symbol]
                    self.positions[symbol] = Position.FLAT

            # Update equity and performance metrics
            self.update_equity(row['close_price'])
            
    def get_performance_metrics(self) -> Dict:
        """Calculate and return performance metrics."""
        if not self.trades:
            return {}
            
        profitable_trades = len([t for t in self.trades if t.pnl > 0])
        total_trades = len(self.trades)
        
        metrics = {
            'total_return': (self.equity - self.config.initial_capital) / self.config.initial_capital,
            'total_trades': total_trades,
            'win_rate': profitable_trades / total_trades if total_trades > 0 else 0,
            'avg_return_per_trade': np.mean([t.pnl for t in self.trades]),
            'max_drawdown': max(self.drawdown_curve),
            'sharpe_ratio': self.calculate_sharpe_ratio(),
            'profit_factor': self.calculate_profit_factor()
        }
        
        return metrics
    
    def calculate_sharpe_ratio(self) -> float:
        """Calculate Sharpe ratio of the strategy."""
        if len(self.equity_curve) < 2:
            return 0.0
        
        returns = pd.Series(self.equity_curve).pct_change().dropna()
        if len(returns) == 0:
            return 0.0
            
        return np.sqrt(252) * (returns.mean() / returns.std())
    
    def calculate_profit_factor(self) -> float:
        """Calculate profit factor (gross profit / gross loss)."""
        profits = sum(t.pnl for t in self.trades if t.pnl > 0)
        losses = abs(sum(t.pnl for t in self.trades if t.pnl < 0))
        return profits / losses if losses != 0 else 0.0

    def plot_equity_curve(self):
        """Plot equity curve and drawdown."""
        try:
            import matplotlib.pyplot as plt
            
            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))
            
            # Plot equity curve
            ax1.plot(self.equity_curve)
            ax1.set_title('Equity Curve')
            ax1.set_ylabel('Equity')
            
            # Plot drawdown
            ax2.fill_between(range(len(self.drawdown_curve)), 
                           0, 
                           [d * 100 for d in self.drawdown_curve], 
                           color='red', 
                           alpha=0.3)
            ax2.set_title('Drawdown (%)')
            ax2.set_ylabel('Drawdown %')
            
            plt.tight_layout()
            plt.show()
        except ImportError:
            print("Matplotlib is required for plotting.")


# data = pd.DataFrame({
#     'date': pd.date_range(start='2023-01-01', periods=10, freq='D'),
#     'symbol': ['AAPL'] * 10,
#     'close_price': [150, 152, 149, 153, 155, 157, 154, 156, 158, 160]
# })

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "password",
    "database": "hack_canada"
}
engine = create_engine(f"mysql+pymysql://{db_config['user']}:{db_config['password']}@{db_config['host']}/{db_config['database']}")


query = "SELECT * FROM stock_prices WHERE ticker = 'AMZN'"

data = pd.read_sql(query, engine)

strategy = BollingerStrategy()
backtest = Backtest(data, strategy)
backtest.run()

print("\n==== ALL TRADES ====")
for trade in backtest.trades:
    print(f"Symbol: {trade.symbol}, Entry: {trade.entry_price} on {trade.entry_date}, "
            f"Exit: {trade.exit_price} on {trade.exit_date}, PnL: {trade.exit_price - trade.entry_price}")


backtest.plot_equity_curve()



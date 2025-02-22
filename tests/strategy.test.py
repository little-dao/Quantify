import sys
import os
import pandas as pd
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from strategy import *

# Testing the UserDefinedExpression class
def create_test_data(periods: int = 10) -> pd.DataFrame:
    """Create sample price data"""
    data = pd.DataFrame({
        'high': [100, 102, 98, 103, 105, 101, 99, 104, 102, 106],
        'low':  [95,  97,  93, 98,  99,  96,  94, 99,  97,  101]
    })
    return data

def print_expression_result(expression: List[Union[UserDefinedVariable, float, Operator]], data: pd.DataFrame):
    """Helper function to print expression results"""
    complex_expr = UserDefinedExpression(expression)
    result = complex_expr.evaluate(data)
    print("\nExpression result:")
    print(pd.DataFrame({
        'high': data['high'],
        'low': data['low'],
        'result': result
    }))

# Create test data
data = create_test_data()

high_2day = UserDefinedVariable(2, 'high')
expr1 = [high_2day]
complex_expr1 = UserDefinedExpression(expr1)
result1 = complex_expr1.evaluate(data)
print(result1)
    
print("\nTest 2: (2-day high + 2-day low) / 2")
high_2day = UserDefinedVariable(2, 'high')
low_2day = UserDefinedVariable(2, 'low')
expr2 = [
    Operator.LEFT_PAREN,
    high_2day,
    Operator.ADD,
    low_2day,
    Operator.RIGHT_PAREN,
    Operator.DIVIDE,
    2.0
]
print_expression_result(expr2, data)

print("\nTest 3: 0.7 * 2-day high + 0.3 * 2-day low")
expr3 = [
    Operator.LEFT_PAREN,
    high_2day,
    Operator.MULTIPLY,
    0.7,
    Operator.RIGHT_PAREN,
    Operator.ADD,
    Operator.LEFT_PAREN,
    low_2day,
    Operator.MULTIPLY,
    0.3,
    Operator.RIGHT_PAREN
]
print_expression_result(expr3, data)

window = 20
num_std = 2.00
middle_band_var = UserDefinedVariable(day=window, stock_price_state='mvg')
std_dev_var = UserDefinedVariable(day=window, stock_price_state='std')
upper_band_expression = UserDefinedExpression([middle_band_var, Operator.ADD,  std_dev_var, Operator.MULTIPLY, num_std])
lower_band_expression = UserDefinedExpression([middle_band_var, Operator.MINUS, std_dev_var, Operator.MULTIPLY, num_std])

current_close_var = UserDefinedVariable(day=1, stock_price_state='mvg')

sell_strategy = UserDefinedStrategy(
    user_defined_variable=current_close_var,
    condition=Condition.GREATER,
    expression=upper_band_expression,
    action=Action.EXIT_LONG  # Generates signal=-1
)

# Buy Strategy (Close < Lower Band)
buy_strategy = UserDefinedStrategy(
    user_defined_variable=current_close_var,
    condition=Condition.LESS,
    expression=lower_band_expression,
    action=Action.ENTER_LONG  # Generates signal=1
)

class CombinedBollingerStrategy(Strategy):
    def __init__(self, sell_strategy, buy_strategy):
        super().__init__()
        self.sell_strategy = sell_strategy
        self.buy_strategy = buy_strategy

    def update(self, data):
        self.sell_strategy.update(data)
        self.buy_strategy.update(data)

    def next(self):
        sell_signal = self.sell_strategy.next()
        buy_signal = self.buy_strategy.next()
        
        # Prioritize sell over buy (as per original strategy)
        if sell_signal == -1:
            return -1
        elif buy_signal == 1:
            return 1
        else:
            return 0
        

bollinger = BollingerStrategy(window=20, num_std=2)
combined = CombinedBollingerStrategy(sell_strategy, buy_strategy)

dict = {
    "id": [1, 2, 3],
    "ticker": ["AAPL", "GOOGL", "MSFT"],
    "date": [datetime(2024, 2, 20), datetime(2024, 2, 21), datetime(2024, 2, 22)],
    "open_price": [150.0, 2800.5, 310.2],
    "high_price": [155.0, 2825.0, 315.0],
    "low_price": [148.5, 2780.0, 308.0],
    "close_price": [152.0, 2810.0, 312.5],
    "volume": [50000000, 1200000, 30000000]
}

data = pd.DataFrame(dict)

bollinger.update(data)
combined.update(data)


# Check if signals match
assert bollinger.next() == combined.next(), "Signals do not match!"
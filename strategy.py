from enum import Enum
from typing import Union, Any, List, Optional
from dataclasses import dataclass
import pandas as pd

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

class Operator(Enum):
    # Arithmetic operators
    ADD = '+'
    MINUS = '-'
    MULTIPLY = '*'
    DIVIDE = '/'
    
    # Parentheses
    LEFT_PAREN = '('
    RIGHT_PAREN = ')'
    
    @staticmethod
    def get_precedence(op: 'Operator') -> int:
        if op in (Operator.ADD, Operator.MINUS):
            return 1
        if op in (Operator.MULTIPLY, Operator.DIVIDE):
            return 2
        return 0
    
    @property
    def is_parenthesis(self) -> bool:
        return self in (Operator.LEFT_PAREN, Operator.RIGHT_PAREN)
    
    @property
    def is_arithmetic(self) -> bool:
        return self in (Operator.ADD, Operator.MINUS, Operator.MULTIPLY, Operator.DIVIDE)


class Condition(Enum):
    GREATER = ">"
    EQUAL = "="
    LESS = "<"
    GEQ = ">="
    LEQ = "<="

class Action(Enum):
    ENTER_LONG = "enter"
    EXIT_LONG = "exit"

class UserDefinedVariable:
    def __init__(self, day: int, stock_price_state: str):
        self.day = day
        self.stock_price_state = stock_price_state # high or low or std or mvg or std

    def __post_init__(self):
        # Ensure that stock_price_state is either 'high' or 'low' or 'std' or 'mvg'
        if self.stock_price_state not in ['high', 'low', 'std', 'mvg']:
            raise ValueError("stock_price_state must be 'high' or 'low' or 'std' or 'mvg'.")
    
    def evaluate(self, data):
        if self.stock_price_state == 'high':
            return data['high'].rolling(window=self.day).max()
        elif self.stock_price_state == 'low':
            return data['low'].rolling(window=self.day).min()
        elif self.stock_price_state == 'std':
            return data['close_price'].rolling(window=self.day).std()
        elif self.stock_price_state == 'mvg':
            return data['close_price'].rolling(window=self.day).mean()
    
@dataclass
class Token:
    type: str  # 'OPERAND', 'OPERATOR'
    value: Any

class ExpressionNode:
    def __init__(self, 
                 value: Union[UserDefinedVariable, float, Operator, None] = None,
                 left: Optional['ExpressionNode'] = None,
                 right: Optional['ExpressionNode'] = None):
        self.value = value
        self.left = left
        self.right = right

class ExpressionParser:
    @staticmethod
    def tokenize(expression: List[Union[UserDefinedVariable, float, Operator]]) -> List[Token]:
        tokens = []
        for item in expression:
            if isinstance(item, (UserDefinedVariable, float)):
                tokens.append(Token('OPERAND', item))
            elif isinstance(item, Operator):
                tokens.append(Token('OPERATOR', item))
        return tokens

    def build_tree(self, tokens: List[Token]) -> ExpressionNode:
        def parse_expression(token_list: List[Token]) -> ExpressionNode:
            output_queue = []
            operator_stack = []

            for token in token_list:
                if token.type == 'OPERAND':
                    output_queue.append(ExpressionNode(token.value))
                elif token.type == 'OPERATOR':
                    op = token.value
                    if op == Operator.LEFT_PAREN:
                        operator_stack.append(token)
                    elif op == Operator.RIGHT_PAREN:
                        while (operator_stack and 
                              operator_stack[-1].value != Operator.LEFT_PAREN):
                            op_token = operator_stack.pop()
                            right = output_queue.pop()
                            left = output_queue.pop()
                            output_queue.append(ExpressionNode(op_token.value, left, right))
                        if not operator_stack:
                            raise ValueError("Mismatched parentheses")
                        operator_stack.pop()  # Remove left parenthesis
                    else:  # Arithmetic operator
                        while (operator_stack and 
                               operator_stack[-1].value != Operator.LEFT_PAREN and
                               Operator.get_precedence(operator_stack[-1].value) >= 
                               Operator.get_precedence(op)):
                            op_token = operator_stack.pop()
                            right = output_queue.pop()
                            left = output_queue.pop()
                            output_queue.append(ExpressionNode(op_token.value, left, right))
                        operator_stack.append(token)

            while operator_stack:
                op_token = operator_stack.pop()
                if op_token.value == Operator.LEFT_PAREN:
                    raise ValueError("Mismatched parentheses")
                right = output_queue.pop()
                left = output_queue.pop()
                output_queue.append(ExpressionNode(op_token.value, left, right))

            if len(output_queue) != 1:
                raise ValueError("Invalid expression")
            
            return output_queue[0]

        return parse_expression(tokens)
    
class UserDefinedExpression:
    def __init__(self, expression: List[Union[UserDefinedVariable, float, Operator]]):
        self.parser = ExpressionParser()
        self.tokens = self.parser.tokenize(expression)
        self.expression_tree = self.parser.build_tree(self.tokens)

    def _evaluate_node(self, node: ExpressionNode, data: Any) -> Union[pd.Series, float]:
        if isinstance(node.value, (UserDefinedVariable, float)):
            return self._evaluate_operand(node.value, data)
        
        # Only evaluate arithmetic operators
        if not node.value.is_arithmetic:
            raise ValueError(f"Invalid operator for evaluation: {node.value}")
            
        left_result = self._evaluate_node(node.left, data)
        right_result = self._evaluate_node(node.right, data)

        if node.value == Operator.ADD:
            return left_result + right_result
        elif node.value == Operator.MINUS:
            return left_result - right_result
        elif node.value == Operator.MULTIPLY:
            return left_result * right_result
        elif node.value == Operator.DIVIDE:
            return left_result / right_result

    def _evaluate_operand(self, operand: Union[UserDefinedVariable, float], data: Any) -> Union[pd.Series, float]:
        if isinstance(operand, UserDefinedVariable):
            return operand.evaluate(data)
        return operand

    def evaluate(self, data: Any) -> Union[pd.Series, float]:
        return self._evaluate_node(self.expression_tree, data)
        

class UserDefinedStrategy(Strategy):
    """
    Strategy defined by users
    """
    def __init__(self, user_defined_variable: UserDefinedVariable, condition: Condition, expression: UserDefinedExpression, action: Action):
        self.user_defined_variable = user_defined_variable
        self.condition = condition
        self.expression = expression
        self.action = action

    def update(self, data):
        self.operand = self.user_defined_variable.evaluate(data)[0]
        self.expression_value = self.expression.evaluate(data)[0]

    def next(self):
        if self.condition == Condition.GREATER:
            if self.operand > self.expression_value:
                self.signal = 1 if self.action == Action.ENTER_LONG else -1
            else:
                self.signal = 0

        elif self.condition == Condition.LESS:
            if self.operand < self.expression_value:
                self.signal = 1 if self.action == Action.ENTER_LONG else -1
            else:
                self.signal = 0

        elif self.condition == Condition.EQUAL:
            if self.operand == self.expression_value:
                self.signal = 1 if self.action == Action.ENTER_LONG else -1
            else:
                self.signal = 0

        elif self.condition == Condition.GEQ:
            if self.operand >= self.expression_value:
                self.signal = 1 if self.action == Action.ENTER_LONG else -1
            else:
                self.signal = 0
        
        elif self.condition == Condition.LEQ:
            if self.operand <= self.expression_value:
                self.signal = 1 if self.action == Action.ENTER_LONG else -1
            else:
                self.signal = 0
        
        return self.signal

    
    
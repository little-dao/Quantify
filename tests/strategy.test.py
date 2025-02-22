import sys
import os

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

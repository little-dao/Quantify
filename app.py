from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import json
import backtesting
import strategy
from sqlalchemy import create_engine
import pandas as pd
from http import HTTPStatus
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

stg = backtesting.BollingerStrategy(num_std = 2)

# Database connection function
def get_db_connection():
    return pymysql.connect(
        host="localhost",
        user="root",  # Your MySQL username
        password="root",  # Your MySQL password
        database="hack_canada",  # Your database name
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor  # Return results as dictionaries
    )

def fetch_stock_data(query: str, db_config: dict) -> pd.DataFrame:
    engine = create_engine(f'mysql+pymysql://{db_config["user"]}:{db_config["password"]}@{db_config["host"]}/{db_config["database"]}')
    return pd.read_sql(query, engine)

# API endpoint to fetch financial data with filtering
@app.route('/api/financial-data', methods=['GET'])
def get_financial_data():
    ticker = request.args.get('ticker', default=None)  # Get ticker from query params
    start_date = request.args.get('start_date', default=None)  # Get start_date from query params
    end_date = request.args.get('end_date', default=None)  # Get end_date from query params

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Build the SQL query dynamically based on provided filters
        query = "SELECT * FROM stock_prices WHERE 1=1"
        params = []

        if ticker:
            query += " AND ticker = %s"
            params.append(ticker)

        if start_date:
            query += " AND date >= %s"
            params.append(start_date)

        if end_date:
            query += " AND date <= %s"
            params.append(end_date)

        cursor.execute(query, tuple(params))
        data = cursor.fetchall()  # Fetch all rows as dictionaries

        cursor.close()
        connection.close()

        return json.dumps(data, default=str), 200, {'Content-Type': 'application/json'}  # Return filtered data as JSON response

    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Handle errors gracefully

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "hack_canada"
}

# API endpoint to fetch trades
@app.route('/api/trades', methods=['GET'])
def get_trades():
    ticker = request.args.get('ticker', default="AAPL")  # Get ticker from query params
    start_date = request.args.get('start_date', default=None)  # Get start_date from query params
    end_date = request.args.get('end_date', default=None)  # Get end_date from query params
    try:
        query = f"SELECT * FROM stock_prices WHERE 1=1"

        if ticker:
            query += f" AND ticker = '{ticker}'"

        if start_date:
            query += f" AND date >= '{start_date}'"

        if end_date:
            query += f" AND date <= '{end_date}'"

        df = fetch_stock_data(query, db_config)

        backtest = backtesting.Backtest(df, stg)
        trades = backtest.run()

        print(trades)
        return json.dumps([trade.to_dict() for trade in trades], default=str), 200, {'Content-Type': 'application/json'}  # Return filtered data as JSON response

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500  # Handle errors gracefully
    
def init_db():
    """Initialize database table if it doesn't exist"""
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS strategies (
        id VARCHAR(36) PRIMARY KEY,
        user_defined_variable JSON NOT NULL,
        `condition` JSON NOT NULL,
        expression JSON NOT NULL,
        action JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """
    
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(create_table_sql)
        connection.commit()
    finally:
        connection.close()


def parse_operand(operand: str) -> strategy.UserDefinedExpression:
    """Parse the operand string into a UserDefinedVariable object"""
    operand = operand.strip()
    pattern = re.compile(r"([A-Za-z ]+)\((\d+)\)")
    
    tokens = re.split(r"(\+|\-|\*|/)", operand)

    stock_price_state_mapping = {
        "High": "high",
        "Low": "low",
        "Std Dev": "std",
        "Moving Average": "mvg",
        "Last Price": "low"
    }

    operator_mapping = {
        "+": strategy.Operator.ADD,
        "-": strategy.Operator.MINUS,
        "*": strategy.Operator.MULTIPLY,
        "/": strategy.Operator.DIVIDE
    }

    result = []

    for token in tokens:
        token = token.strip()
        if not token:
            continue
        
        match = pattern.match(token)
        if match:
            result.append(strategy.UserDefinedVariable(day=int(match.group(2)), stock_price_state=stock_price_state_mapping[match.group(1).strip()]))
        else:
            result.append(operator_mapping[token])
    
    return strategy.UserDefinedExpression(result)


@app.route('/api/submit-strategy', methods=['POST'])
def post_strategy():
    """
    Create a new strategy and store it in MySQL database.
    
    Expected request body format:
    {
        "enter_long": {
            left_operand: str,
            condition: str,
            right_operand: str,
        },
        "exit_long": {
            left_operand: str,
            condition: str,
            right_operand: str,
        },
    }
    """
    try:
        global stg
        # Get request data
        data = request.get_json()
        print(data)

        conditions_mapping = {
            ">": strategy.Condition.GREATER,
            "<": strategy.Condition.LESS,
            "=": strategy.Condition.EQUAL,
            ">=": strategy.Condition.GEQ,
            "<=": strategy.Condition.LEQ
        }
        
       # Enter long
        enter_long = data.get('enter_long')
        enter_long_condition = enter_long.get('condition')
        enter_long_left_operand = parse_operand(enter_long.get('left_operand'))
        enter_long_right_operand = parse_operand(enter_long.get('right_operand'))

        buy_strategy = strategy.UserDefinedStrategy(
            left_operand=enter_long_left_operand,
            condition=conditions_mapping[enter_long_condition],
            right_operand=enter_long_right_operand,
            action=strategy.Action.ENTER_LONG  # Generates signal=1
        )
        
        # Exit long
        exit_long = data.get('exit_long')
        exit_long_condition = exit_long.get('condition')
        exit_long_left_operand = parse_operand(exit_long.get('left_operand'))
        exit_long_right_operand = parse_operand(exit_long.get('right_operand'))

        sell_strategy = strategy.UserDefinedStrategy(
            left_operand=exit_long_left_operand,
            condition=conditions_mapping[exit_long_condition],
            right_operand=exit_long_right_operand,
            action=strategy.Action.EXIT_LONG  # Generates signal=-1
        )

        stg = strategy.CombinedBollingerStrategy(sell_strategy, buy_strategy)

        return jsonify({"message": "Strategy submitted successfully"}), HTTPStatus.OK

    except Exception as e:
        return jsonify({"error": str(e)}), HTTPStatus.BAD_REQUEST


@app.route('/api/submit-expression', methods=['POST'])
def submit_expression():
    data = request.get_json()
    print(data)
    expression = data.get('expression')

    # Process the expression as needed
    print(f'Received expression: {expression}')

    # Example processing: split the expression into lines
    lines = expression.split('\n')
    enter_long_expr = lines[0]
    exit_long_expr = lines[1]
    strategy_expr = lines[2] if len(lines) > 2 else ''

    # Further processing can be done here
    # For example, you can save the expressions to a database or perform some calculations

    return jsonify(
        {'message': 'Expression received successfully', 'enter_long': enter_long_expr, 'exit_long': exit_long_expr,
         'strategy': strategy_expr}), 200


if __name__ == '__main__':
    app.run(port=8000, debug=True)


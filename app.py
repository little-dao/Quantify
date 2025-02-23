from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import json
import backtesting
from sqlalchemy import create_engine
import pandas as pd
from http import HTTPStatus

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests


# Database connection function
def get_db_connection():
    return pymysql.connect(
        host="localhost",
        user="root",  # Your MySQL username
        password="password",  # Your MySQL password
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
    "password": "password",
    "database": "hack_canada"
}

# API endpoint to fetch trades
@app.route('/api/trades', methods=['GET'])
def get_trades():
    ticker = request.args.get('ticker', default=None)  # Get ticker from query params
    start_date = request.args.get('start_date', default=None)  # Get start_date from query params
    end_date = request.args.get('end_date', default=None)  # Get end_date from query params
    num_std = request.args.get('num_std', default=2)
    try:
        query = f"SELECT * FROM stock_prices WHERE 1=1"

        if ticker:
            query += f" AND ticker = '{ticker}'"

        if start_date:
            query += f" AND date >= '{start_date}'"

        if end_date:
            query += f" AND date <= '{end_date}'"

        df = fetch_stock_data(query, db_config)

        strategy = backtesting.BollingerStrategy(num_std = num_std)
        backtest = backtesting.Backtest(df, strategy)
        trades = backtest.run()

        print(trades)
        return json.dumps([trade.to_dict() for trade in trades], default=str), 200, {'Content-Type': 'application/json'}  # Return filtered data as JSON response

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500  # Handle errors gracefully


if __name__ == '__main__':
    app.run(port=8000, debug=True)


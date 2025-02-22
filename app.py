from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests


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
        query = "SELECT * FROM data WHERE 1=1"
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

        return jsonify(data)  # Return filtered data as JSON response

    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Handle errors gracefully


if __name__ == '__main__':
    app.run(debug=True)

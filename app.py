from flask import Flask, jsonify
from flask_cors import CORS
import pymysql

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests


# Database connection function
def get_db_connection():
    return pymysql.connect(
        host="localhost",  # Replace with your database host
        user="root",  # Replace with your MySQL username
        password="root",  # Replace with your MySQL password
        database="hack_canada",  # Replace with your database name
        charset="utf8mb4",  # Ensure proper encoding
        cursorclass=pymysql.cursors.DictCursor  # Return results as dictionaries
    )


# API endpoint to fetch financial data
@app.route('/api/financial-data', methods=['GET'])
def get_financial_data():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Execute query to fetch all financial data
        cursor.execute("SELECT * FROM data")
        data = cursor.fetchall()  # Fetch all rows as dictionaries

        cursor.close()
        connection.close()

        return jsonify(data)  # Return data as JSON response

    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Handle errors gracefully


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)

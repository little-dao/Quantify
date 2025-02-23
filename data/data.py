import yfinance as yf
import MySQLdb

# MySQL database connection details
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "hack_canada"
}

# List of stock tickers to fetch
STOCKS = ["AAPL", "MSFT", "GOOGL", "AMZN","NVDA","TSLA","SPY","QQQ","^VIX",
          "BANC","BAC","C","JPM","GS","MS","USB","UNH"]

# Fetch stock data for the last 5 years
def fetch_stock_data(ticker):
    stock = yf.Ticker(ticker)
    data = stock.history(period="5y")
    return data.reset_index()

# Create MySQL table if not exists
def create_table(cursor):
    create_query = """
    CREATE TABLE IF NOT EXISTS stock_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticker VARCHAR(10),
        date DATE,
        open_price FLOAT,
        high_price FLOAT,
        low_price FLOAT,
        close_price FLOAT,
        volume BIGINT
    )
    """
    cursor.execute(create_query)

# Insert data into MySQL
def insert_data(cursor, ticker, data):
    insert_query = """
    INSERT INTO stock_prices (ticker, date, open_price, high_price, low_price, close_price, volume)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    for _, row in data.iterrows():
        cursor.execute(insert_query, (ticker, row['Date'], row['Open'], row['High'], row['Low'], row['Close'], row['Volume']))

# Main function
def main():
    try:
        # Connect to the database
        conn = MySQLdb.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Create the table if it doesn't exist
        create_table(cursor)

        # Fetch and insert data for each stock
        for stock in STOCKS:
            print(f"Fetching data for {stock}...")
            data = fetch_stock_data(stock)
            insert_data(cursor, stock, data)
            conn.commit()
            print(f"Inserted data for {stock}")

        cursor.close()
        conn.close()
        print("All data inserted successfully.")

    except MySQLdb.MySQLError as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()


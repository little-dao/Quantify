# Quantify

This project is a web-app built with React, Python, and MySQL. It allows users to backtest trading strategies and visualize stock data in a very simple fashion.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js (v14 or higher)
- npm (v6 or higher)
- Python (v3.8 or higher)
- pip (v20 or higher)
- MySQL

## Getting Started

Follow these steps to set up and run the application from scratch.

### Backend Setup (`app.py`)

1. **Clone the repository:**

    ```bash
    git clone https://github.com/little-dao/quantify.git
    cd quantify
    ```

2. **Create a virtual environment and activate it:**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. **Install required libraries:**

    ```bash
    pip install flask flask-cors pymysql json backtesting strategy sqlalchemy pandas http tqdm dataclasses typing enum numpy ehset
    ```

4. **Set up MySQL database:**

    - Start your MySQL server.
    - Create a database named `hack_canada`.
    - Update the `db_config` dictionary in `app.py` with your MySQL credentials.

5. **Run the backend server:**

    ```bash
    python app.py
    ```

### Frontend Setup (`client`)

1. **Navigate to the `client` directory:**

    ```bash
    cd finance-dashboard
    ```

2. **Install required npm packages:**

    ```bash
    npm install
    ```

3. **Start the React development server:**

    ```bash
    npm start
    ```

### Running the Application

1. **Ensure both the backend and frontend servers are running.**
2. **Open your web browser and navigate to `http://localhost:3000`.**

You should now be able to use the Quantify web-app to backtest trading strategies and visualize stock data.
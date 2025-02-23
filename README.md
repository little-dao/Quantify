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
    - Update the `db_config` dictionary and the credentials in the `get_db_connection()` function in app.py with your MySQL credentials.
    - Run `python data/data.py` to fetch stock data of some of the most popular stocks.

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


### **Handling Dependency Conflicts**

If you encounter dependency resolution errors, such as:

```
npm ERR! ERESOLVE unable to resolve dependency tree
```

try the following solutions:

#### **1. Install Dependencies with `--legacy-peer-deps` (Recommended)**
If `npm install` fails due to peer dependency conflicts, run:
```sh
npm install --legacy-peer-deps
```
This allows dependencies to install even if there are mismatched peer versions.

#### **2. Force Install Dependencies**
If `--legacy-peer-deps` does not work, try:
```sh
npm install --force
```
⚠️ *Warning:* This may override dependency conflicts but could lead to instability.

#### **3. Downgrade React (If Using `react-table` or Other Incompatible Packages)**
Some packages, like `react-table@7.8.0`, do not support React 19. If you face issues, downgrade React to version 18:

```sh
npm uninstall react react-dom
npm install react@18 react-dom@18
```

#### **4. Manually Install Missing Dependencies**
If you see an error like:
```sh
Module not found: Error: Can't resolve '@fortawesome/fontawesome-svg-core'
```
Manually install missing dependencies:
```sh
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome
```

#### **5. Clear Cache and Reinstall Dependencies**
If dependency conflicts persist, reset your environment:

```sh
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```
After reinstalling, restart your development server:

```sh
npm run dev
```
or
```sh
npm start
```

## **Login**

Due to time constraints, our current login system does **not** support user registration and authentication. Instead, we provide a default login for all users:

**Login Credentials:**
- **Username:** `user`
- **Password:** `password`

Simply enter these credentials on the login screen to access the system.

⚠️ *Note:* This is a temporary solution. In future versions, we plan to implement proper authentication and user management.

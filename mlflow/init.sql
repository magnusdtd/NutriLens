CREATE DATABASE IF NOT EXISTS mlflow_database;

CREATE USER IF NOT EXISTS 'mlflow_user'@'%' IDENTIFIED BY 'mlflow';

GRANT ALL PRIVILEGES ON mlflow_database.* TO 'mlflow_user'@'%';

FLUSH PRIVILEGES;
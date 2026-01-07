import os
from flask import Flask
from flask import jsonify
import requests
from dotenv import load_dotenv
load_dotenv()

# We decided to go with Python, so let's continue with Flask as well
app = Flask(__name__)

# Refactored function to use http GET to retrieve pingpong count instead of reading a file
def get_pingpong_count():
    try:
        response = requests.get(f"{os.getenv('PINGS_API')}/pings", timeout=2)
        if response.status_code == 200:
            data = response.json()
            return data.get("pings", "N/A")
        else:
            return f"Error: {response.status_code}"
    except requests.RequestException:
        return f"Error: Unable to connect"
    
def read_config_message():
    config_message = os.getenv("CONFIG_MESSAGE", "No config message found or development mode")
    return config_message

def read_config_file():
    config_path = "/tmp/information.txt"
    try:
        with open(config_path, "r") as config_file:
            return config_file.read().strip()
    except Exception as e:
        return f"Error reading config file: {str(e)}"

# Create a web endpoint for the log output
@app.route("/logs")
def logs():
    log_path = os.getenv("LOG_PATH", "../script/log/") + "/app.log" # default path for development
    try:
        with open(log_path, "r") as log_file:
            try:
                timestamp = log_file.readline().strip()
            except Exception as e:
                timestamp = f"Error reading log file: {str(e)}"
            counter_value = get_pingpong_count() # Retrieve pingpong count
            config_message = read_config_message()
            config_file_content = read_config_file()
            return (
                f"<p>file content: {config_file_content}</p>"
                f"<p>env variable: {config_message}</p>"
                f"<p>{timestamp}</p>"
                f"<p>Ping / Pongs: {counter_value}</p>"
            )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Define a health check endpoint that checks the /pings endpoint of the pingpong service
@app.route("/health", methods=["GET"])
def health():
    try:
        response = requests.get(f"{os.getenv('PINGS_API')}/pings", timeout=2)
        if response.status_code == 200:
            return "Healthy", 200
        else:
            return "Unhealthy", 500
    except requests.RequestException:
        return "Unhealthy", 500

@app.route("/", methods=["GET"])
def index():
    return "Hello world! Access /logs to see the latest log entry.", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081)

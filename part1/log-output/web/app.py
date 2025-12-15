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
            return (
                f"<p>{timestamp}</p>"
                f"<p>Ping / Pongs: {counter_value}</p>"
            )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081)

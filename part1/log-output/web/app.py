import os
from flask import Flask
from flask import jsonify

# We decided to go with Python, so let's continue with Flask as well
app = Flask(__name__)

# Create a web endpoint for the log output
@app.route("/logs")
def logs():
    log_path = os.getenv("LOG_PATH", "../script/log/app.log") # default path for development
    try:
        with open(log_path, "r") as f:
            logs = []
            line_counter = 0
            for line in f:
                line = line.rstrip("\n")
                if line_counter != 0:   # Skip the first line which is just "Started logging"
                    logs.append(line)
                line_counter += 1
        # The format is pretty bad at the moment, but the log format is not ready either so keep it this way for testing
        return jsonify({"100 latest log entries": logs[-100:]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081)

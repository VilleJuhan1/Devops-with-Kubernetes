import os
from flask import Flask
from flask import jsonify

# We decided to go with Python, so let's continue with Flask as well
app = Flask(__name__)

# Create a web endpoint for the log output
@app.route("/logs")
def logs():
    log_path = os.getenv("LOG_PATH", "../script/log/app.log") + "/app.log"  # default path for development
    try:
        with open(log_path, "r") as log_file:
            timestamp = log_file.readline().strip()
            try:
                with open(os.getenv("VOLUME_PATH", "../../ping-pong/mock") + "/counter.txt", "r") as counter_file:
                    counter_value = counter_file.read().strip()
            except FileNotFoundError:
                counter_value = "Counter file not found"
            return "<p>{}</p><p>Ping / Pongs: {}</p>".format(timestamp, counter_value)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081)

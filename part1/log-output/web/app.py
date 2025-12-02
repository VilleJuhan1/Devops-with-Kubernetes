import random
import string
import datetime
from flask import Flask
from flask import jsonify

# We decided to go with Python, so let's continue with Flask as well
app = Flask(__name__)

# Create a random string of given length, default into 15 characters
def randomString(length=15):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

# Create a web endpoint for the log output
@app.route("/status")
def status():
    timestamp = datetime.datetime.now().isoformat(
            timespec='seconds'
        )  
    return jsonify({
        "timestamp": timestamp,
        "random_string": randomString()
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081)

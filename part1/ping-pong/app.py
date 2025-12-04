from flask import Flask

# A tracker to keep the count of requests to /pingpong
class Counter:
    # Initialize the counter
    def __init__(self):
        self.value = 0

    # Increment the counter and return the new value
    def inc(self):
        self.value += 1
        return self.value

# Define the counter and the Flask app
counter = Counter()
app = Flask(__name__)

# Define the /pingpong endpoint
@app.route("/pingpong")
def pingpong():
    newCount = counter.inc()
    print(f"GET requests: {newCount}")
    return {"pong": newCount}

# Run the Flask app if this script is executed directly
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8085)
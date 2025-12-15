from flask import Flask
import os

# A tracker to keep the count of requests to /pingpong
class Counter:
    # Initialize the counter by reading the existing value from a file, or starting at 0
    def __init__(self):
        try:
            with open(os.getenv("VOLUME_PATH", "./mock") + "/counter.txt", "r") as f:
                content = f.read()
                if content.isdigit():
                    self.value = int(content)
                    print(f"Existing counter value: {self.value}")
                else:
                    print("Initializing counter to 0")
                    self.value = 0
        except FileNotFoundError:
            print("Counter file not found, initializing to 0") # PV mount might overwrite the file so this is a failsafe
            self.value = 0

    # Increment the counter and return the new value
    def inc(self):
        self.value += 1
        with open(os.getenv("VOLUME_PATH", "./mock") + "/counter.txt", "w") as f:
            f.write(str(self.value))
        return self.value
    
    def get(self):
        return self.value

# Define the counter and the Flask app
counter = Counter()
app = Flask(__name__)

# Define the /pingpong endpoint
@app.route("/pingpong")
def pingpong():
    newCount = counter.inc()
    #print(f"GET requests: {newCount}")
    return {"pong": newCount}

@app.route("/pings")
def pings():
    return {"pings": counter.get()}

# Run the Flask app if this script is executed directly
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8085)
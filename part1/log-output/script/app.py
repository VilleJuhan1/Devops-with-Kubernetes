import time
import random
import string
import datetime
import os

log_path = os.getenv("LOG_PATH", "./log/app.log")
# Create a random string of given length, default into 15 characters
def randomString(length=15):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def logger():

    timestamp = datetime.datetime.now().isoformat(timespec="seconds")
    generated_string = randomString(30)

    with open(log_path, "w") as f:
        f.write(f"{timestamp}: {generated_string}\n")
        f.flush()

if __name__ == "__main__":
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    print("LOGGER STARTED", flush=True)
    """
    # Don't need this as we refactor code to save only one log line at a time
    with open(log_path, "a") as f:
        f.write("Started logging\n")  # Initialize log file each time
        f.flush()
    """

    while True:
        logger()
        time.sleep(5)  # Log every 5 seconds

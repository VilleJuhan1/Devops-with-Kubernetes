import time
import random
import string
import datetime

# Create a random string of given length, default into 15 characters
def randomString(length=15):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))
  
if __name__ == "__main__":
    generated_string = randomString(30)    
    while True:
        timestamp = datetime.datetime.now().isoformat(
            timespec='seconds' # Specify precision to seconds
        )
        print(f"{timestamp} - Generated String: {generated_string}")
        time.sleep(5)
# Use the official Python image with alpine base
FROM python:3.12-alpine

# Create working directory
WORKDIR /app

# Copy the script into the container
COPY app.py .

# Initialize a log file
RUN mkdir /log && touch /log/app.log

# Set environment variable for shared log path
ENV LOG_PATH=/log/app.log

# Run the Python script unbuffered so that the output is printed immediately
CMD ["python", "app.py"]

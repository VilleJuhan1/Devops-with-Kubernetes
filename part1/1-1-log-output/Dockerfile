# Use the official Python image with alpine base
FROM python:3.12-alpine

# Create working directory
WORKDIR /app

# Copy the script into the container
COPY app.py .

# Run the Python script unbuffered so that the output is printed immediately
CMD ["python", "-u", "app.py"]

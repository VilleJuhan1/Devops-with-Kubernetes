FROM python:3.12-slim
WORKDIR /app
COPY app.py .
COPY requirements.txt .
RUN pip install -r requirements.txt
ENV LOG_PATH=/log/app.log
EXPOSE 8081
CMD ["python", "app.py"]

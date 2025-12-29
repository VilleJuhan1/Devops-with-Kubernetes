FROM python:3.12-slim
WORKDIR /app
COPY app.py .
COPY requirements.txt .
RUN pip install -r requirements.txt
EXPOSE 8085
CMD ["python", "app.py"]

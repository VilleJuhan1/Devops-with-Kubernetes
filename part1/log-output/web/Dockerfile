FROM python:3.12-slim
WORKDIR /app
COPY app.py .
COPY requirements.txt .
RUN pip install -r requirements.txt
# Log file needs to exist or otherwise it defaults to development path "../script/log/app.log".
# If neither exist, the web app fails to start.
RUN mkdir /shared
ENV LOG_PATH=/shared/app.log
EXPOSE 8081
CMD ["python", "app.py"]

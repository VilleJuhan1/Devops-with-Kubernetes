FROM python:3.12-slim
WORKDIR /app
COPY app.py .
COPY requirements.txt .
RUN pip install -r requirements.txt
# Log file needs to exist or otherwise it defaults to development path "../script/log/app.log".
# If neither exist, the web app fails to start.
RUN mkdir /log \
  && mkdir /shared
ENV LOG_PATH=/log
ENV VOLUME_PATH=/shared
EXPOSE 8081
CMD ["python", "app.py"]

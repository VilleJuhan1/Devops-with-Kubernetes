FROM python:3.12-slim
WORKDIR /app
COPY app.py .
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN mkdir /log && touch /log/app.log && echo "Mock timestamp 2025-12-11T18:38:43: FmB7um8YqB4NqlXMX5UBBoBVj4XVDJ" > /log/app.log
ENV LOG_PATH=/log
#ENV VOLUME_PATH=/shared
EXPOSE 8081
CMD ["python", "app.py"]

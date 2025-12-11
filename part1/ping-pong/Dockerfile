FROM python:3.12-slim
WORKDIR /app
COPY app.py .
COPY requirements.txt .
RUN mkdir /shared \
  && echo "0" > /shared/counter.txt \
  && pip install -r requirements.txt
ENV VOLUME_PATH=/shared
EXPOSE 8085
CMD ["python", "app.py"]

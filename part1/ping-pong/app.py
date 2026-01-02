import os
from flask import Flask, request, jsonify
import psycopg2

app = Flask(__name__)

# Connect to the PostgreSQL database
def get_conn():
    return psycopg2.connect(
        host=os.environ["DATABASE_HOST"],
        port=os.environ.get("DATABASE_PORT", 5432),
        dbname=os.environ["DATABASE_NAME"],
        user=os.environ["DATABASE_USER"],
        password=os.environ["DATABASE_PASSWORD"],
    )

# Define the /reset endpoint
# POST-method clears all records from the api_calls table (only allowed in dev mode)
@app.route("/reset", methods=["POST"])
def reset():
    if os.environ.get("DEV_MODE") != "true":
        return "not allowed", 403

    conn = get_conn()

    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("TRUNCATE TABLE api_calls")

        return "", 204

    finally:
        conn.close()

# Define the /entries endpoint
# GET-method returns all recorded API call entries (only allowed in dev mode)
@app.route("/entries", methods=["GET"])
def list_entries():
    if os.environ.get("DEV_MODE") != "true":
        return "not allowed", 403

    conn = get_conn()

    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, endpoint, method, timestamp, user_agent, remote_addr
                    FROM api_calls
                    ORDER BY timestamp DESC
                """)
                rows = cur.fetchall()

        entries = [
            {
                "id": row[0],
                "endpoint": row[1],
                "method": row[2],
                "timestamp": row[3].isoformat(),
                "user_agent": row[4],
                "remote_addr": row[5],
            }
            for row in rows
        ]

        return jsonify(entries)

    finally:
        conn.close()

# Define the /pingpong endpoint
# GET-method saves a new entry with some metadata from the request and returns "pong!"
@app.route("/pingpong", methods=["GET"])
def pingpong():
    conn = get_conn()

    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO api_calls (endpoint, method, user_agent, remote_addr)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (
                        request.path,
                        request.method,
                        request.headers.get("User-Agent"),
                        request.remote_addr,
                    ),
                )

        # Upon successful insertion, return "pong!"
        return "pong!", 201

    finally:
        conn.close()

# Define the /pings endpoint
# GET-method returns the count of all /pingpong calls recorded in the database
@app.route("/pings", methods=["GET"])
def pings():
    conn = get_conn()

    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM api_calls")
                count = cur.fetchone()[0]

        return jsonify({"pings": count}), 200

    finally:
        conn.close()

# Health check endpoint to verify database connectivity
@app.route("/health", methods=["GET"])
def health():
    try:
        conn = get_conn()
        conn.close()
        return "ok", 200
    except Exception:
        return "db not ready", 503

@app.route("/", methods=["GET"])
def index():
    return "Hello world! Access /pingpong to play ping-pong.", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8085)

import pool from "../utils/db.js";
import pino from "pino";

const logger = pino({
  level: 'info',
  redact: ['req.headers.authorization', 'req.body.password']
});


// Fetch all todos from the database
async function getAllTodos() {
  try {
    const result = await pool.query(
      "SELECT id, user_id, todo, completed FROM todos ORDER BY id"
    );
    logger.info({ count: result.rowCount }, "Fetched all todos from DB");
    return result.rows;
  } catch (err) {
    logger.error({ err }, "Error fetching todos from DB");
    throw err;
  }
}

// Add a new todo
async function addTodo({ userId = 1, todo }) {
  try {
    const result = await pool.query(
      `INSERT INTO todos (user_id, todo, completed)
       VALUES ($1, $2, false)
       RETURNING id, user_id, todo, completed`,
      [userId, todo]
    );
    logger.info({ todo: result.rows[0] }, "Inserted new todo into DB");
    return result.rows[0];
  } catch (err) {
    logger.error({ err, todo, userId }, "Error inserting todo into DB");
    throw err;
  }
}

// Delete all todos (for development/testing purposes)
async function deleteAllTodos() {
  try {
    await pool.query("TRUNCATE TABLE todos RESTART IDENTITY");
    logger.warn("Deleted all todos from DB (dev mode)");
  } catch (err) {
    logger.error({ err }, "Failed to delete all todos from DB");
    throw err;
  }
}

// Check the health of the database connection
async function checkHealth() {
  try {
    await pool.query("SELECT 1");
    logger.info("Database connection healthy");
    return { ok: true };
  } catch (err) {
    logger.error({ err }, "Database connection unhealthy");
    return { ok: false, details: err.message };
  }
}

// Mark a todo as completed in the database
async function markTodoCompleted(todoId) {
  try {
    const result = await pool.query(
      `UPDATE todos
       SET completed = true
       WHERE id = $1
       RETURNING id, user_id, todo, completed`,
      [todoId]
    );

    if (result.rowCount === 0) {
      logger.warn({ todoId }, "Todo not found to mark as completed");
      throw new Error("Todo not found");
    }

    logger.info({ todo: result.rows[0] }, "Marked todo as completed in DB");
    return result.rows[0];
  } catch (err) {
    logger.error({ err, todoId }, "Error marking todo as completed in DB");
    throw err;
  }
}

export default {
  getAllTodos,
  addTodo,
  markTodoCompleted,
  deleteAllTodos,
  checkHealth,
};

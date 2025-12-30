import pool from "../utils/db.js";

// Fetch all todos from the database
async function getAllTodos() {
  const result = await pool.query(
    "SELECT id, user_id, todo, completed FROM todos ORDER BY id"
  );
  return result.rows;
}

// Add a mew todo
async function addTodo({ userId = 1, todo }) {
  const result = await pool.query(
    `INSERT INTO todos (user_id, todo, completed)
     VALUES ($1, $2, false)
     RETURNING id, user_id, todo, completed`,
    [userId, todo]
  );

  return result.rows[0];
}

export default {
  getAllTodos,
  addTodo,
};
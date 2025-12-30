import express from "express";
import todoService from "../services/todoService.js";

const todosRouter = express.Router();

// GET /api/todos - Fetch all todos
todosRouter.get("/", async (req, res) => {
  try {
    const todos = await todoService.getAllTodos();
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// POST /api/todos - Create a new todo
todosRouter.post("/", async (req, res) => {
  try {
    const todo = await todoService.addTodo(req.body);
    res.status(201).json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

export default todosRouter;

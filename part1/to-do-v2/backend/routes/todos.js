import express from "express";
import todoService from "../services/todoService.js";

const todosRouter = express.Router();

// GET /api/todos - Fetch all todos
todosRouter.get("/", async (req, res) => {
  try {
    const todos = await todoService.getAllTodos();
    req.log.info({ count: todos.length }, "Fetched all todos");
    res.json(todos);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch todos");
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// POST /api/todos - Create a new todo
todosRouter.post("/", async (req, res) => {
  const { todo } = req.body;
  // Validate input
  if (!todo || todo.length > 140) {
    req.log.warn({ todoLength: todo?.length }, "Todo exceeds 140 characters");
    return res
      .status(400)
      .json({ error: "Todo text is required and must be 140 characters or less" });
  }

  try {
    const newTodo = await todoService.addTodo(req.body);
    req.log.info({ todo: newTodo }, "Created new todo");
    res.status(201).json(newTodo);
  } catch (err) {
    req.log.error({ err, body: req.body }, "Failed to create todo");
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// DELETE /api/todos - Delete all todos (development/testing only)
todosRouter.delete("/", async (req, res) => {
  if (process.env.DEV_MODE !== "true") {
    req.log.warn("Attempted to delete all todos in non-dev mode");
    return res.status(403).json({ error: "Not allowed" });
  }

  try {
    await todoService.deleteAllTodos();
    req.log.info("Deleted all todos (dev mode)");
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete all todos");
    res.status(500).json({ error: "Failed to delete todos" });
  }
});

export default todosRouter;


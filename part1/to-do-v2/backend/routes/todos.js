import express from "express";
const todosRouter = express.Router();
import todoService from "../services/todoService.js";

// GET /api/todos
todosRouter.get("/", (req, res) => {
  res.json(todoService.getAllTodos());
});

// POST /api/todos
todosRouter.post("/", (req, res) => {
  const { todo } = req.body;

  if (!todo) {
    return res.status(400).json({ error: "Todo required" });
  }

  const newTodo = todoService.addTodo({ todo });
  res.status(201).json(newTodo);
});

export default todosRouter;

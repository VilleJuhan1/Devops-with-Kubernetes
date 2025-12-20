import cors from "cors"; // Import the cors package
import express from "express";
import { getImagePath } from "./services/fsService.js";
import todosRouter from "./routes/todos.js";

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/todos', todosRouter)

app.get('/api/assets/random.jpg', async (req, res) => {
  try {
    const imagePath = await getImagePath();
    res.sendFile(imagePath);
  } catch (err) {
    console.error(err);
    res.status(500).send('Image unavailable');
  }
});

// app.get("/api/assets/todos", (req, res) => {
//   console.log("Fetching todos...");
//   const todos = [
//     { id: 1, task: "Learn Kubernetes", completed: false },
//     { id: 2, task: "Build a To-Do App", completed: true },
//     { id: 3, task: "Deploy to Cloud", completed: false },
//   ];
//   res.json(todos);
// });

export default app;
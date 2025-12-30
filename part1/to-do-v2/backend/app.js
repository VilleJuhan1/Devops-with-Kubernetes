import cors from "cors"; // Import the cors package
import express from "express";
import { getImagePath } from "./services/fsService.js";
import todosRouter from "./routes/todos.js";

const app = express()

app.use(cors())
app.use(express.json())

// Use the todos router for routes starting with /api/todos
app.use('/api/todos', todosRouter)

// Endpoint to serve a random image
app.get('/api/assets/random.jpg', async (req, res) => {
  try {
    const imagePath = await getImagePath();
    res.sendFile(imagePath);
  } catch (err) {
    console.error(err);
    res.status(500).send('Image unavailable');
  }
});

export default app;
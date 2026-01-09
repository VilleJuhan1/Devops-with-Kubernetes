import cors from "cors"; // Import the cors package
import express from "express";
import { getImagePath } from "./services/fsService.js";
import todosRouter from "./routes/todos.js";
import pino from 'pino';
import expressPino from 'express-pino-logger';

const logger = pino({
  level: 'info',
  redact: ['req.headers.authorization', 'req.body.password']
});

const expressLogger = expressPino({ logger });

const app = express()

app.use(cors())
app.use(express.json())
app.use(expressLogger);

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

// Global error handler
app.use((err, req, res, next) => {
  req.log ? req.log.error(err) : console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
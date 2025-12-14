import cors from "cors"; // Import the cors package
import express from "express";
import { getImagePath } from "./services/fs.js";

const app = express()

app.use(cors())

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
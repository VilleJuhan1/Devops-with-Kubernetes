import express from "express";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import cors from "cors"; // Import the cors package
import dotenv from "dotenv";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3005;

const ASSETS_DIR = path.resolve("./assets");
const META_FILE = path.resolve("./imageMeta.json");
const IMAGE_PATH = path.join(ASSETS_DIR, "random.jpg");

const ONE_HOUR = 60 * 60 * 1000;

if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: "http://localhost:5173",
    })
  );
}

app.use("/assets", express.static(ASSETS_DIR));

function getMeta() {
  if (!fs.existsSync(META_FILE)) {
    return { lastFetched: 0 };
  }
  return JSON.parse(fs.readFileSync(META_FILE, "utf-8"));
}

function saveMeta(meta) {
  fs.writeFileSync(META_FILE, JSON.stringify(meta));
}

async function fetchAndCacheImage() {
  const response = await fetch("https://picsum.photos/800/600");
  const buffer = await response.arrayBuffer();

  fs.writeFileSync(IMAGE_PATH, Buffer.from(buffer));
  saveMeta({ lastFetched: Date.now() });
}

app.get("/random-image", async (req, res) => {
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR);
  }

  const meta = getMeta();
  const now = Date.now();

  if (!fs.existsSync(IMAGE_PATH) || now - meta.lastFetched > ONE_HOUR) {
    await fetchAndCacheImage();
  }

  res.json({
    imageUrl: "/assets/random.jpg",
    lastFetched: meta.lastFetched,
  });
});

app.listen(PORT, () => {
  console.log(`Image service running on http://localhost:${PORT}`);
});
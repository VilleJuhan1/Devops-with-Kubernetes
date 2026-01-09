import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import { IMAGE_PATH } from "../utils/config.js";
import pino from "pino";

const logger = pino({
  level: 'info',
  redact: ['req.headers.authorization', 'req.body.password']
});


const image = path.resolve(IMAGE_PATH);
const ONE_HOUR = 60 * 60 * 1000;

async function needsRefresh() {
  logger.info({ image }, "Checking if image needs refresh");

  try {
    const stats = await fs.stat(image);
    const age = Date.now() - stats.mtime.getTime();
    const ageMinutes = (age / 1000 / 60).toFixed(2);

    logger.info({ ageMinutes }, "Image age in minutes");

    return age > ONE_HOUR;
  } catch (err) {
    logger.warn({ err }, "Image file does not exist, needs refresh");
    return true;
  }
}

async function downloadNewImage() {
  logger.info("Downloading new image from https://picsum.photos/800/600");

  const res = await fetch("https://picsum.photos/800/600");

  if (!res.ok) {
    logger.error({ status: res.status }, "Failed to fetch image");
    throw new Error("Failed to fetch image");
  }

  logger.info({ status: res.status }, "Image fetched successfully");

  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(image, buffer);

  logger.info({ path: image }, "New image saved successfully");
}

export async function getImagePath() {
  if (await needsRefresh()) {
    logger.info("Refreshing image...");
    await downloadNewImage();
  }

  logger.info({ path: image }, "Serving image");
  return image;
}

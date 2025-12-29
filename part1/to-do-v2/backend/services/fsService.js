import fs from 'fs/promises';
import path from 'path';
import { IMAGE_PATH } from '../utils/config.js';

const image = path.resolve(IMAGE_PATH);
const one_hour = 60 * 60 * 1000;

async function needsRefresh() {
  console.log(`Checking if image at ${image} needs refresh`);
  try {
    const stats = await fs.stat(image);
    const age = Date.now() - stats.mtime.getTime();
    const ageHumanReadable = (age / 1000 / 60).toFixed(2);
    console.log(`Image age: ${ageHumanReadable} minutes`);
    return age > one_hour;
  } catch (err) {
    console.log('Image file does not exist, needs refresh');
    return true;
  }
}

async function downloadNewImage() {
  const res = await fetch('https://picsum.photos/800/600');

  if (!res.ok) {
    throw new Error('Failed to fetch image');
  }

  console.log(`The image load response status was: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(image, buffer);
}

export async function getImagePath() {
  if (await needsRefresh()) {
    console.log('Downloading new image...');
    await downloadNewImage();
  }
  console.log(`Serving image from path: ${image}`);
  return image;
}

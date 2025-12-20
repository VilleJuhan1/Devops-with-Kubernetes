import fs from 'fs/promises';
import path from 'path';

const IMAGE_PATH = path.resolve('assets/random.jpg');
const ONE_HOUR = 60 * 60 * 1000;

async function needsRefresh() {
  console.log(`Checking if image at ${IMAGE_PATH} needs refresh`);
  try {
    const stats = await fs.stat(IMAGE_PATH);
    const age = Date.now() - stats.mtime.getTime();
    const ageHumanReadable = (age / 1000 / 60).toFixed(2);
    console.log(`Image age: ${ageHumanReadable} minutes`);
    return age > ONE_HOUR;
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
  await fs.writeFile(IMAGE_PATH, buffer);
}

export async function getImagePath() {
  if (await needsRefresh()) {
    console.log('Downloading new image...');
    await downloadNewImage();
  }
  console.log(`Serving image from path: ${IMAGE_PATH}`);
  return IMAGE_PATH;
}

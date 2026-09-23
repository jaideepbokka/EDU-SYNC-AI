const fs = require('fs');
const path = require('path');
const https = require('https');

const publicDir = path.join(__dirname, '..', 'public');
const vendorDir = path.join(publicDir, 'vendor');
const modelsDir = path.join(publicDir, 'models');

if (!fs.existsSync(vendorDir)) fs.mkdirSync(vendorDir, { recursive: true });
if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`Already exists: ${path.basename(dest)}`);
      return resolve();
    }
    console.log(`Downloading ${url} -> ${path.basename(dest)}...`);
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`Failed with status ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${path.basename(dest)} (${fs.statSync(dest).size} bytes)`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  try {
    // 1. Download face-api.min.js
    await downloadFile(
      'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js',
      path.join(vendorDir, 'face-api.min.js')
    );

    // 2. Models to download from @vladmandic/face-api
    const baseUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
    const files = [
      'tiny_face_detector_model-weights_manifest.json',
      'tiny_face_detector_model-shard1',
      'face_landmark_68_model-weights_manifest.json',
      'face_landmark_68_model-shard1',
      'face_recognition_model-weights_manifest.json',
      'face_recognition_model-shard1',
      'face_recognition_model-shard2'
    ];

    for (const f of files) {
      await downloadFile(baseUrl + f, path.join(modelsDir, f));
    }
    console.log('All face models downloaded successfully!');
  } catch (e) {
    console.error('Error downloading models:', e.message);
  }
}

main();

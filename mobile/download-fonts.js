const fs = require('fs');
const https = require('https');
const path = require('path');

const fontsDir = path.join(__dirname, 'assets', 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fonts = [
  { url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/baloobhai2/BalooBhai2-Regular.ttf', name: 'BalooBhai2-Regular.ttf' },
  { url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/baloobhai2/BalooBhai2-Medium.ttf', name: 'BalooBhai2-Medium.ttf' },
  { url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/baloobhai2/BalooBhai2-SemiBold.ttf', name: 'BalooBhai2-SemiBold.ttf' },
  { url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/baloobhai2/BalooBhai2-Bold.ttf', name: 'BalooBhai2-Bold.ttf' },
  { url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/baloobhai2/BalooBhai2-ExtraBold.ttf', name: 'BalooBhai2-ExtraBold.ttf' },
  { url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat-Regular.ttf', name: 'Montserrat-Regular.ttf' },
  { url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat-Medium.ttf', name: 'Montserrat-Medium.ttf' },
  { url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat-SemiBold.ttf', name: 'Montserrat-SemiBold.ttf' },
  { url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat-Bold.ttf', name: 'Montserrat-Bold.ttf' },
  { url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat-Black.ttf', name: 'Montserrat-Black.ttf' },
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        }).on('error', (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

(async () => {
  for (const font of fonts) {
    const dest = path.join(fontsDir, font.name);
    console.log(`Downloading ${font.name}...`);
    try {
      await download(font.url, dest);
      console.log(`Downloaded ${font.name}`);
    } catch (e) {
      console.error(e.message);
    }
  }
})();

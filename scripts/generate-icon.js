const sharp = require('sharp');
const path = require('path');

// Actual logo found in the repo
const logoPath = path.join(__dirname, '../assets/images/build logo1.png');
const iconPath = path.join(__dirname, '../assets/icon.png');
const splashPath = path.join(__dirname, '../assets/splash.png');

async function generate() {
  const black = { r: 0, g: 0, b: 0, alpha: 1 };

  // Generate icon.png — 1024x1024 black background, logo centered
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: black },
  })
    .composite([
      {
        input: await sharp(logoPath)
          .resize(624, 624, { fit: 'contain', background: black })
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(iconPath);
  console.log('icon.png done');

  // Generate splash.png — 1284x2778 black background, logo centered
  await sharp({
    create: { width: 1284, height: 2778, channels: 4, background: black },
  })
    .composite([
      {
        input: await sharp(logoPath)
          .resize(500, 500, { fit: 'contain', background: black })
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(splashPath);
  console.log('splash.png done');
}

generate().catch(console.error);

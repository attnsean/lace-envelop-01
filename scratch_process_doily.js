const Jimp = require('jimp');

async function run() {
  const inputPath = '/Users/attnsean/.gemini/antigravity-ide/brain/8df28bfc-a063-4205-87a5-6eab24508bab/media__1781669540706.png';
  const outputPath = '/Users/attnsean/Documents/SERA STUDIO/lace-envelop-01/public/heart-doily.png';

  console.log('Loading doily image...');
  const image = await Jimp.read(inputPath);
  console.log(`Loaded image: ${image.bitmap.width}x${image.bitmap.height}`);

  // Process pixels: make black/dark pixels transparent
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const a = this.bitmap.data[idx + 3];

    // If pixel is very dark, make it transparent
    const brightness = (r + g + b) / 3;
    if (brightness < 45) {
      this.bitmap.data[idx + 3] = 0; // transparent
    } else {
      // It's part of the doily - make sure it's fully opaque or keep original alpha
      this.bitmap.data[idx + 3] = a;
    }
  });

  // Autocrop the edges to get a tight heart bounding box
  image.autocrop();

  console.log('Saving processed doily to:', outputPath);
  await image.writeAsync(outputPath);
  console.log('Done!');
}

run().catch(console.error);

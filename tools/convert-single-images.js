#!/usr/bin/env node

/**
 * Convert Single Images to WebP
 *
 * Use this tool to convert individual images or small batches to WebP format.
 * Based on the main optimize-images.js but designed for specific file conversions.
 *
 * Usage:
 *   node tools/convert-single-images.js
 *
 * Then edit the imagesToConvert array below with your specific file paths.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertImage(inputPath, outputPath, options = {}) {
  const { quality = 85 } = options;

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log(`Processing: ${path.basename(inputPath)} (${metadata.width}x${metadata.height}, ${metadata.format})`);

    // Convert to WebP
    const webpPath = outputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    await image
      .webp({ quality: quality })
      .toFile(webpPath);

    const originalSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(webpPath).size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    console.log(`  → ${path.basename(webpPath)} (${(newSize/1024/1024).toFixed(1)}MB, saved ${savings}%)`);
    return webpPath;
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('Converting individual images to WebP...\n');

  // EDIT THIS ARRAY: Add your image file paths here
  const imagesToConvert = [
    // Example entries (uncomment and modify as needed):
    // {
    //   source: "/path/to/source/image.png",
    //   output: "/home/skunian/code/MyCode/Draachenmar/public/images/artifacts/image_name.webp"
    // },
    // {
    //   source: "/path/to/another/image.jpg",
    //   output: "/home/skunian/code/MyCode/Draachenmar/public/images/characters/character_name.webp"
    // }
  ];

  if (imagesToConvert.length === 0) {
    console.log('No images specified for conversion.');
    console.log('Edit the imagesToConvert array in this file to add your image paths.');
    return;
  }

  let convertedCount = 0;
  let totalCount = imagesToConvert.length;

  for (const { source, output } of imagesToConvert) {
    if (fs.existsSync(source)) {
      // Ensure output directory exists
      const outputDir = path.dirname(output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const result = await convertImage(source, output, { quality: 85 });
      if (result) {
        convertedCount++;

        // Also copy to dist folder if it exists
        const distPath = output.replace('/public/images/', '/dist/images/');
        const distDir = path.dirname(distPath);
        if (fs.existsSync('/home/skunian/code/MyCode/Draachenmar/dist/images/')) {
          if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
          }
          fs.copyFileSync(result, distPath);
          console.log(`  → Copied to dist: ${path.basename(distPath)}`);
        }
      }
    } else {
      console.log(`✗ File not found: ${source}`);
    }
  }

  console.log(`\n✅ Conversion complete! ${convertedCount}/${totalCount} images converted to WebP.`);
}

main().catch(console.error);
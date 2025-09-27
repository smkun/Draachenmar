#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function optimizeImage(inputPath, outputPath, options = {}) {
  const { quality = 80, width = null, height = null } = options;

  try {
    const image = sharp(inputPath);

    // Get image metadata
    const metadata = await image.metadata();
    console.log(`Processing: ${inputPath} (${metadata.width}x${metadata.height}, ${metadata.format})`);

    let processor = image;

    // Resize if needed (keep aspect ratio)
    if (width && metadata.width > width) {
      processor = processor.resize(width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    // Convert to WebP for better compression
    if (inputPath.endsWith('.png') || inputPath.endsWith('.jpg') || inputPath.endsWith('.jpeg')) {
      const webpPath = outputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      await processor
        .webp({ quality: quality })
        .toFile(webpPath);

      const originalSize = fs.statSync(inputPath).size;
      const newSize = fs.statSync(webpPath).size;
      const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

      console.log(`  → ${webpPath} (${(newSize/1024/1024).toFixed(1)}MB, saved ${savings}%)`);
      return webpPath;
    } else {
      // Keep original format but optimize
      await processor
        .jpeg({ quality: quality })
        .png({ quality: quality })
        .toFile(outputPath);

      const originalSize = fs.statSync(inputPath).size;
      const newSize = fs.statSync(outputPath).size;
      const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

      console.log(`  → ${outputPath} (${(newSize/1024/1024).toFixed(1)}MB, saved ${savings}%)`);
      return outputPath;
    }
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
    return null;
  }
}

async function optimizeDirectory(dirPath, outputDir, options = {}) {
  const files = fs.readdirSync(dirPath);

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const file of files) {
    const inputPath = path.join(dirPath, file);
    const outputPath = path.join(outputDir, file);

    if (fs.statSync(inputPath).isFile() && /\.(png|jpg|jpeg|webp)$/i.test(file)) {
      const fileSize = fs.statSync(inputPath).size / 1024 / 1024; // MB

      // Only optimize large files (>500KB)
      if (fileSize > 0.5) {
        await optimizeImage(inputPath, outputPath, options);
      } else {
        // Copy small files as-is
        fs.copyFileSync(inputPath, outputPath);
        console.log(`Copied (small): ${file} (${fileSize.toFixed(1)}MB)`);
      }
    } else if (fs.statSync(inputPath).isDirectory()) {
      // Recursively process subdirectories
      await optimizeDirectory(inputPath, path.join(outputDir, file), options);
    }
  }
}

async function main() {
  const inputDir = './public/images';
  const outputDir = './public/images-optimized';

  console.log('Starting image optimization...');
  console.log(`Input: ${inputDir}`);
  console.log(`Output: ${outputDir}`);

  await optimizeDirectory(inputDir, outputDir, {
    quality: 75,        // Reduce quality to 75% for better compression
    width: 1200        // Max width 1200px (most images are smaller anyway)
  });

  console.log('\nOptimization complete!');

  // Show size comparison
  const originalSize = await getFolderSize(inputDir);
  const optimizedSize = await getFolderSize(outputDir);
  const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

  console.log(`\nSize comparison:`);
  console.log(`Original:  ${(originalSize/1024/1024).toFixed(1)}MB`);
  console.log(`Optimized: ${(optimizedSize/1024/1024).toFixed(1)}MB`);
  console.log(`Savings:   ${savings}%`);
}

async function getFolderSize(dirPath) {
  let totalSize = 0;

  function addSize(path) {
    const stats = fs.statSync(path);
    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(path);
      files.forEach(file => addSize(`${path}/${file}`));
    }
  }

  addSize(dirPath);
  return totalSize;
}

main().catch(console.error);
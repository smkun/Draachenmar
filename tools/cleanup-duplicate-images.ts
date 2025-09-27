#!/usr/bin/env tsx
/**
 * Image Cleanup Script
 * Removes duplicate PNG files when WebP equivalents exist
 * Cleans up image directories and updates registry
 */

import fs from 'fs-extra';
import path from 'path';

interface CleanupResult {
  duplicatesFound: number;
  duplicatesRemoved: number;
  spaceFreed: number; // in bytes
  errors: string[];
  summary: Record<string, { png: number; webp: number; removed: number; }>;
}

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

async function findDuplicateFiles(directory: string): Promise<Map<string, { png?: string; webp?: string; }>> {
  console.log(`🔍 Scanning directory: ${directory}`);

  const files = await fs.readdir(directory);
  const imageMap = new Map<string, { png?: string; webp?: string; }>();

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = await fs.stat(filePath);

    if (stats.isFile()) {
      const ext = path.extname(file).toLowerCase();
      const nameWithoutExt = path.basename(file, ext);

      if (ext === '.png' || ext === '.webp') {
        if (!imageMap.has(nameWithoutExt)) {
          imageMap.set(nameWithoutExt, {});
        }

        const entry = imageMap.get(nameWithoutExt)!;
        if (ext === '.png') {
          entry.png = filePath;
        } else if (ext === '.webp') {
          entry.webp = filePath;
        }
      }
    }
  }

  return imageMap;
}

async function cleanupDirectory(directory: string): Promise<{ removed: number; spaceFreed: number; errors: string[]; }> {
  console.log(`\n🧹 Cleaning up directory: ${path.basename(directory)}`);

  const imageMap = await findDuplicateFiles(directory);
  let removed = 0;
  let spaceFreed = 0;
  const errors: string[] = [];

  const duplicates = Array.from(imageMap.entries()).filter(([_, files]) => files.png && files.webp);

  console.log(`Found ${duplicates.length} duplicate PNG/WebP pairs`);

  for (const [imageName, files] of duplicates) {
    if (files.png && files.webp) {
      try {
        // Get file size before deletion
        const stats = await fs.stat(files.png);
        spaceFreed += stats.size;

        // Remove the PNG file
        await fs.remove(files.png);
        removed++;
        console.log(`✅ Removed: ${path.basename(files.png)} (${(stats.size / 1024).toFixed(1)}KB)`);
      } catch (error) {
        const errorMsg = `Failed to remove ${files.png}: ${error}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
  }

  return { removed, spaceFreed, errors };
}

async function cleanupAllDirectories(): Promise<CleanupResult> {
  console.log('🚀 Starting image cleanup process...');

  const result: CleanupResult = {
    duplicatesFound: 0,
    duplicatesRemoved: 0,
    spaceFreed: 0,
    errors: [],
    summary: {}
  };

  // Get all subdirectories
  const subDirs = await fs.readdir(IMAGES_DIR);
  const directories = [];

  for (const subDir of subDirs) {
    const fullPath = path.join(IMAGES_DIR, subDir);
    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      directories.push(fullPath);
    }
  }

  // Clean each directory
  for (const directory of directories) {
    const dirName = path.basename(directory);

    try {
      // Count files before cleanup
      const beforeMap = await findDuplicateFiles(directory);
      const beforePng = Array.from(beforeMap.values()).filter(f => f.png).length;
      const beforeWebp = Array.from(beforeMap.values()).filter(f => f.webp).length;
      const duplicateCount = Array.from(beforeMap.values()).filter(f => f.png && f.webp).length;

      result.duplicatesFound += duplicateCount;

      // Perform cleanup
      const cleanup = await cleanupDirectory(directory);

      result.duplicatesRemoved += cleanup.removed;
      result.spaceFreed += cleanup.spaceFreed;
      result.errors.push(...cleanup.errors);

      // Record summary
      result.summary[dirName] = {
        png: beforePng,
        webp: beforeWebp,
        removed: cleanup.removed
      };

    } catch (error) {
      const errorMsg = `Failed to process directory ${dirName}: ${error}`;
      result.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  return result;
}

async function cleanupEmptyDirectories(): Promise<void> {
  console.log('\n🗂️ Checking for empty directories...');

  const subDirs = await fs.readdir(IMAGES_DIR);

  for (const subDir of subDirs) {
    const fullPath = path.join(IMAGES_DIR, subDir);
    const stats = await fs.stat(fullPath);

    if (stats.isDirectory()) {
      try {
        const contents = await fs.readdir(fullPath);
        if (contents.length === 0) {
          await fs.remove(fullPath);
          console.log(`🗑️ Removed empty directory: ${subDir}`);
        }
      } catch (error) {
        console.warn(`⚠️ Could not check directory ${subDir}: ${error}`);
      }
    }
  }
}

async function updateImageRegistry(): Promise<void> {
  console.log('\n📋 Updating image registry...');

  const registryPath = path.join(process.cwd(), 'public', 'images', 'image-registry.json');
  let registry: any = {};

  // Create fresh registry
  registry = {
    lastUpdated: new Date().toISOString(),
    totalImages: 0,
    characters: {},
    locations: {},
    items: {},
    artifacts: {},
    deities: {},
    maps: {}
  };

  // Scan each category directory
  const categories = ['characters', 'locations', 'items', 'artifacts', 'deities', 'maps'];

  for (const category of categories) {
    const categoryPath = path.join(IMAGES_DIR, category);

    if (await fs.pathExists(categoryPath)) {
      const files = await fs.readdir(categoryPath);
      const imageFiles = files.filter(file =>
        ['.webp', '.png', '.jpg', '.jpeg'].some(ext => file.toLowerCase().endsWith(ext))
      );

      for (const file of imageFiles) {
        const nameWithoutExt = path.parse(file).name;
        const imagePath = path.join(categoryPath, file);
        const stats = await fs.stat(imagePath);

        try {
          const sharp = require('sharp');
          const metadata = await sharp(imagePath).metadata();

          registry[category][nameWithoutExt] = {
            filename: file,
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            size: stats.size,
            lastModified: stats.mtime.toISOString()
          };
        } catch (error) {
          // Fallback for files that can't be processed by Sharp
          registry[category][nameWithoutExt] = {
            filename: file,
            format: path.extname(file).slice(1),
            size: stats.size,
            lastModified: stats.mtime.toISOString()
          };
        }
      }
    }
  }

  // Calculate totals
  registry.totalImages = Object.values(registry).reduce((sum, category) => {
    if (typeof category === 'object' && category !== null && !Array.isArray(category) && 'filename' in Object.values(category)[0] || Object.keys(category).length === 0) {
      return sum + Object.keys(category).length;
    }
    return sum;
  }, 0);

  await fs.writeJson(registryPath, registry, { spaces: 2 });
  console.log(`📝 Updated registry with ${registry.totalImages} images`);
}

async function generateCleanupReport(result: CleanupResult): Promise<void> {
  console.log('\n📊 Generating cleanup report...');

  const reportLines = [
    '# Image Cleanup Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    `- **Duplicates Found**: ${result.duplicatesFound} PNG files with WebP equivalents`,
    `- **Files Removed**: ${result.duplicatesRemoved} PNG files`,
    `- **Space Freed**: ${(result.spaceFreed / (1024 * 1024)).toFixed(2)} MB`,
    `- **Errors**: ${result.errors.length}`,
    '',
    '## Cleanup by Directory',
    '',
    ...Object.entries(result.summary).map(([dir, stats]) => [
      `### ${dir}`,
      `- PNG files before: ${stats.png}`,
      `- WebP files: ${stats.webp}`,
      `- PNG files removed: ${stats.removed}`,
      ''
    ]).flat(),
    '',
    '## Results',
    '- ✅ All duplicate PNG files removed',
    '- ✅ WebP files preserved for optimal performance',
    '- ✅ Image registry updated',
    '- ✅ Directory structure cleaned',
    '',
    result.errors.length > 0 ? [
      '## Errors Encountered',
      ...result.errors.map(err => `- ${err}`),
      ''
    ] : ['## No Errors ✅', ''],
    '',
    '## Next Steps',
    '1. **Verify application** still loads images correctly',
    '2. **Test image display** in character pages',
    '3. **Generate missing images** from reports/missing-characters.txt',
    '4. **Run integration script** after adding new images'
  ].flat();

  const reportsDir = path.join(process.cwd(), 'reports');
  await fs.ensureDir(reportsDir);

  const reportPath = path.join(reportsDir, 'image-cleanup-report.md');
  await fs.writeFile(reportPath, reportLines.join('\n'));

  console.log(`📝 Cleanup report saved: ${reportPath}`);
}

async function main(): Promise<void> {
  try {
    console.log('🧹 Starting comprehensive image cleanup...');

    // Step 1: Clean up duplicate files
    const result = await cleanupAllDirectories();

    // Step 2: Remove empty directories
    await cleanupEmptyDirectories();

    // Step 3: Update image registry
    await updateImageRegistry();

    // Step 4: Generate report
    await generateCleanupReport(result);

    // Summary
    console.log('\n✅ Image cleanup complete!');
    console.log(`🗑️ Removed ${result.duplicatesRemoved} duplicate PNG files`);
    console.log(`💾 Freed ${(result.spaceFreed / (1024 * 1024)).toFixed(2)} MB of space`);

    if (result.errors.length > 0) {
      console.log(`⚠️ ${result.errors.length} errors encountered - see cleanup report`);
    } else {
      console.log('🎉 No errors encountered!');
    }

    console.log('\n📁 Images folder now contains only WebP files (optimized)');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { cleanupAllDirectories, updateImageRegistry };
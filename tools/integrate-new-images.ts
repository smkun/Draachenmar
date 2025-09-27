#!/usr/bin/env tsx
/**
 * Image Integration and Validation Script
 * Integrates newly generated images into the project and validates completeness
 */

import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { characters } from '../src/data/characters.ts';

interface IntegrationResult {
  processed: number;
  optimized: number;
  errors: string[];
  newImages: string[];
  validationResults: ValidationResult[];
}

interface ValidationResult {
  characterName: string;
  hasImage: boolean;
  imageFormat: string;
  fileSize: number;
  dimensions: { width: number; height: number; };
  issues: string[];
}

const TEMP_DIR = path.join(process.cwd(), 'temp_generated');
const CHARACTERS_DIR = path.join(process.cwd(), 'public', 'images', 'characters');
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

async function findGeneratedImages(): Promise<string[]> {
  console.log('🔍 Scanning for newly generated images...');

  if (!await fs.pathExists(TEMP_DIR)) {
    console.log(`⚠️ Temporary directory not found: ${TEMP_DIR}`);
    return [];
  }

  const files = await fs.readdir(TEMP_DIR);
  const imageFiles = files.filter(file =>
    IMAGE_EXTENSIONS.some(ext => file.toLowerCase().endsWith(ext))
  );

  console.log(`Found ${imageFiles.length} generated images`);
  return imageFiles.map(file => path.join(TEMP_DIR, file));
}

async function optimizeAndMove(inputPath: string): Promise<string | null> {
  try {
    const filename = path.basename(inputPath);
    const nameWithoutExt = path.parse(filename).name;

    // Target WebP format
    const outputPath = path.join(CHARACTERS_DIR, `${nameWithoutExt}.webp`);

    console.log(`📷 Optimizing ${filename}...`);

    const metadata = await sharp(inputPath).metadata();

    // Optimize to WebP with quality settings
    await sharp(inputPath)
      .resize(512, 512, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: 85,
        effort: 6
      })
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);
    console.log(`✅ Optimized: ${filename} → ${nameWithoutExt}.webp (${(stats.size / 1024).toFixed(1)}KB)`);

    return outputPath;
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error);
    return null;
  }
}

async function validateCharacterImages(): Promise<ValidationResult[]> {
  console.log('\n🔍 Validating character image coverage...');

  const results: ValidationResult[] = [];

  for (const character of characters) {
    const characterName = character.name.replace(/["/\\]/g, ''); // Clean filename

    // Check for image file
    let hasImage = false;
    let imageFormat = '';
    let fileSize = 0;
    let dimensions = { width: 0, height: 0 };
    let issues: string[] = [];

    // Try different formats
    for (const ext of IMAGE_EXTENSIONS) {
      const imagePath = path.join(CHARACTERS_DIR, `${characterName}${ext}`);
      if (await fs.pathExists(imagePath)) {
        hasImage = true;
        const stats = await fs.stat(imagePath);
        fileSize = stats.size;

        try {
          const metadata = await sharp(imagePath).metadata();
          dimensions = {
            width: metadata.width || 0,
            height: metadata.height || 0
          };
          imageFormat = metadata.format || path.extname(imagePath).slice(1);

          // Quality checks
          if (dimensions.width < 400 || dimensions.height < 400) {
            issues.push('Image resolution too low (< 400x400)');
          }

          if (imageFormat === 'webp' && fileSize > 100 * 1024) {
            issues.push('WebP file size too large (> 100KB)');
          }

          if (imageFormat !== 'webp') {
            issues.push('Image not optimized to WebP format');
          }
        } catch (error) {
          issues.push(`Error reading image metadata: ${error}`);
        }
        break;
      }
    }

    results.push({
      characterName: character.name,
      hasImage,
      imageFormat,
      fileSize,
      dimensions,
      issues
    });
  }

  return results;
}

async function generateCoverageReport(validationResults: ValidationResult[]): Promise<void> {
  console.log('\n📊 Generating coverage report...');

  const totalCharacters = validationResults.length;
  const charactersWithImages = validationResults.filter(r => r.hasImage).length;
  const coverage = (charactersWithImages / totalCharacters) * 100;

  const missingImages = validationResults.filter(r => !r.hasImage);
  const imagesWithIssues = validationResults.filter(r => r.hasImage && r.issues.length > 0);

  const reportLines = [
    '# Image Coverage Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    `- **Total Characters**: ${totalCharacters}`,
    `- **Characters with Images**: ${charactersWithImages}`,
    `- **Coverage**: ${coverage.toFixed(1)}%`,
    `- **Missing Images**: ${missingImages.length}`,
    `- **Images with Issues**: ${imagesWithIssues.length}`,
    '',
    '## Missing Images',
    ...missingImages.map(r => `- ${r.characterName}`),
    '',
    '## Images with Quality Issues',
    ...imagesWithIssues.map(r => [
      `### ${r.characterName}`,
      `- Format: ${r.imageFormat}`,
      `- Size: ${(r.fileSize / 1024).toFixed(1)}KB`,
      `- Dimensions: ${r.dimensions.width}x${r.dimensions.height}`,
      `- Issues:`,
      ...r.issues.map(issue => `  - ${issue}`),
      ''
    ]).flat(),
    '',
    '## Quality Statistics',
    `- **WebP Optimized**: ${validationResults.filter(r => r.hasImage && r.imageFormat === 'webp').length}`,
    `- **High Resolution**: ${validationResults.filter(r => r.hasImage && r.dimensions.width >= 400).length}`,
    `- **Optimized Size**: ${validationResults.filter(r => r.hasImage && r.fileSize <= 100 * 1024).length}`,
    '',
    '## Next Steps',
    '',
    '1. **Create Missing Images**: Generate portraits for remaining characters',
    '2. **Optimize Existing**: Convert non-WebP images to WebP format',
    '3. **Quality Review**: Address quality issues in existing images',
    '4. **Regular Audits**: Run this report after each batch of new images'
  ];

  const reportsDir = path.join(process.cwd(), 'reports');
  await fs.ensureDir(reportsDir);

  const reportPath = path.join(reportsDir, 'image-coverage-report.md');
  await fs.writeFile(reportPath, reportLines.join('\n'));

  console.log(`📝 Coverage report saved: ${reportPath}`);

  // Console summary
  console.log('\n📈 Image Coverage Summary:');
  console.log(`${charactersWithImages}/${totalCharacters} characters have images (${coverage.toFixed(1)}%)`);

  if (missingImages.length > 0) {
    console.log(`❌ ${missingImages.length} characters still missing images`);
  }

  if (imagesWithIssues.length > 0) {
    console.log(`⚠️ ${imagesWithIssues.length} images have quality issues`);
  }

  if (missingImages.length === 0 && imagesWithIssues.length === 0) {
    console.log('✅ All character images present and optimized!');
  }
}

async function updateImageRegistry(): Promise<void> {
  console.log('\n📋 Updating image registry...');

  const registryPath = path.join(process.cwd(), 'public', 'images', 'image-registry.json');

  // Create or update registry
  let registry: any = {};
  if (await fs.pathExists(registryPath)) {
    registry = await fs.readJson(registryPath);
  }

  if (!registry.characters) {
    registry.characters = {};
  }

  // Scan characters directory
  const files = await fs.readdir(CHARACTERS_DIR);
  const imageFiles = files.filter(file =>
    IMAGE_EXTENSIONS.some(ext => file.toLowerCase().endsWith(ext))
  );

  for (const file of imageFiles) {
    const nameWithoutExt = path.parse(file).name;
    const imagePath = path.join(CHARACTERS_DIR, file);
    const stats = await fs.stat(imagePath);

    try {
      const metadata = await sharp(imagePath).metadata();

      registry.characters[nameWithoutExt] = {
        filename: file,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: stats.size,
        lastModified: stats.mtime.toISOString()
      };
    } catch (error) {
      console.warn(`⚠️ Could not read metadata for ${file}`);
    }
  }

  registry.lastUpdated = new Date().toISOString();
  registry.totalImages = Object.keys(registry.characters).length;

  await fs.writeJson(registryPath, registry, { spaces: 2 });
  console.log(`📝 Updated image registry: ${Object.keys(registry.characters).length} images`);
}

async function cleanupTempFiles(): Promise<void> {
  if (await fs.pathExists(TEMP_DIR)) {
    console.log('\n🧹 Cleaning up temporary files...');
    await fs.remove(TEMP_DIR);
    console.log('✅ Temporary directory cleaned');
  }
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Starting image integration and validation...');

    const result: IntegrationResult = {
      processed: 0,
      optimized: 0,
      errors: [],
      newImages: [],
      validationResults: []
    };

    // Step 1: Find and process generated images
    const generatedImages = await findGeneratedImages();

    if (generatedImages.length > 0) {
      console.log('\n📦 Processing generated images...');

      for (const imagePath of generatedImages) {
        const optimizedPath = await optimizeAndMove(imagePath);
        result.processed++;

        if (optimizedPath) {
          result.optimized++;
          result.newImages.push(path.basename(optimizedPath));
        } else {
          result.errors.push(`Failed to optimize ${path.basename(imagePath)}`);
        }
      }
    } else {
      console.log('ℹ️ No generated images found in temp_generated/');
    }

    // Step 2: Validate all character images
    result.validationResults = await validateCharacterImages();

    // Step 3: Generate reports
    await generateCoverageReport(result.validationResults);

    // Step 4: Update image registry
    await updateImageRegistry();

    // Step 5: Cleanup (optional)
    if (generatedImages.length > 0) {
      await cleanupTempFiles();
    }

    console.log('\n✅ Integration and validation complete!');

    if (result.newImages.length > 0) {
      console.log(`📷 Integrated ${result.newImages.length} new images:`);
      result.newImages.forEach(img => console.log(`  - ${img}`));
    }

    if (result.errors.length > 0) {
      console.log(`❌ Errors encountered:`);
      result.errors.forEach(err => console.log(`  - ${err}`));
    }

  } catch (error) {
    console.error('❌ Error during integration:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { validateCharacterImages, generateCoverageReport };
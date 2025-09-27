#!/usr/bin/env tsx
/**
 * Image Quality Validation Script
 * Validates generated images meet quality standards
 */

import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';

interface ImageQualityCheck {
  file: string;
  dimensions: { width: number; height: number; };
  fileSize: number;
  format: string;
  passed: boolean;
  issues: string[];
}

const QUALITY_STANDARDS = {
  minWidth: 400,
  minHeight: 400,
  maxFileSize: 100 * 1024, // 100KB for WebP
  acceptedFormats: ['webp', 'png', 'jpeg', 'jpg']
};

async function validateImage(imagePath: string): Promise<ImageQualityCheck> {
  const stats = await fs.stat(imagePath);
  const metadata = await sharp(imagePath).metadata();

  const check: ImageQualityCheck = {
    file: path.basename(imagePath),
    dimensions: {
      width: metadata.width || 0,
      height: metadata.height || 0
    },
    fileSize: stats.size,
    format: metadata.format || 'unknown',
    passed: true,
    issues: []
  };

  // Validate dimensions
  if (check.dimensions.width < QUALITY_STANDARDS.minWidth) {
    check.issues.push(`Width too small: ${check.dimensions.width}px < ${QUALITY_STANDARDS.minWidth}px`);
    check.passed = false;
  }

  if (check.dimensions.height < QUALITY_STANDARDS.minHeight) {
    check.issues.push(`Height too small: ${check.dimensions.height}px < ${QUALITY_STANDARDS.minHeight}px`);
    check.passed = false;
  }

  // Validate file size (only for WebP)
  if (check.format === 'webp' && check.fileSize > QUALITY_STANDARDS.maxFileSize) {
    check.issues.push(`File size too large: ${(check.fileSize / 1024).toFixed(1)}KB > ${QUALITY_STANDARDS.maxFileSize / 1024}KB`);
    check.passed = false;
  }

  // Validate format
  if (!QUALITY_STANDARDS.acceptedFormats.includes(check.format)) {
    check.issues.push(`Invalid format: ${check.format}`);
    check.passed = false;
  }

  return check;
}

async function validateBatch(directory: string): Promise<void> {
  console.log(`🔍 Validating images in ${directory}...`);

  const imageFiles = (await fs.readdir(directory))
    .filter(file => /\.(webp|png|jpe?g)$/i.test(file))
    .map(file => path.join(directory, file));

  const results: ImageQualityCheck[] = [];

  for (const imagePath of imageFiles) {
    try {
      const result = await validateImage(imagePath);
      results.push(result);
    } catch (error) {
      console.error(`❌ Error validating ${imagePath}:`, error);
    }
  }

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);

  console.log(`\n📊 Validation Results:`);
  console.log(`Total Images: ${results.length}`);
  console.log(`Passed: ${passed.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log(`\n❌ Failed Images:`);
    failed.forEach(result => {
      console.log(`- ${result.file}:`);
      result.issues.forEach(issue => console.log(`  • ${issue}`));
    });
  }

  if (passed.length > 0) {
    console.log(`\n✅ All ${passed.length} images passed quality validation!`);
  }
}

export { validateBatch, validateImage };

if (require.main === module) {
  const directory = process.argv[2] || 'public/images/characters';
  validateBatch(directory);
}

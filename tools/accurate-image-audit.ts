#!/usr/bin/env tsx
/**
 * Accurate Image Audit Script
 * Properly checks existing images vs character list to generate accurate missing list
 */

import fs from 'fs-extra';
import path from 'path';
import { characters } from '../src/data/characters.ts';

interface ImageAuditResult {
  characterName: string;
  characterId: string;
  hasImage: boolean;
  imageFiles: string[];
  imagePath?: string;
}

const CHARACTERS_DIR = path.join(process.cwd(), 'public', 'images', 'characters');
const IMAGE_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg'];

function normalizeCharacterName(name: string): string {
  // Clean the character name to match file naming conventions
  return name
    .replace(/["/\\]/g, '') // Remove quotes and slashes
    .replace(/\s+/g, ' ')    // Normalize spaces
    .trim();
}

async function findImageForCharacter(characterName: string): Promise<string[]> {
  const normalizedName = normalizeCharacterName(characterName);
  const foundImages: string[] = [];

  // Get all files in characters directory
  const allFiles = await fs.readdir(CHARACTERS_DIR);

  // Look for exact matches first
  for (const ext of IMAGE_EXTENSIONS) {
    const exactMatch = `${normalizedName}${ext}`;
    if (allFiles.includes(exactMatch)) {
      foundImages.push(exactMatch);
    }
  }

  // If no exact match, look for partial matches (in case of slight naming differences)
  if (foundImages.length === 0) {
    const nameWords = normalizedName.toLowerCase().split(' ');
    const primaryName = nameWords[0]; // First word of name

    for (const file of allFiles) {
      const fileNameLower = file.toLowerCase();
      const fileWithoutExt = path.parse(file).name.toLowerCase();

      // Check if file contains the character's primary name
      if (fileWithoutExt.includes(normalizedName.toLowerCase()) ||
          (nameWords.length > 1 && nameWords.every(word => fileWithoutExt.includes(word)))) {
        foundImages.push(file);
      }
    }
  }

  return foundImages;
}

async function auditAllCharacters(): Promise<ImageAuditResult[]> {
  console.log('🔍 Starting accurate image audit...');
  console.log(`📊 Total characters to check: ${characters.length}`);

  const results: ImageAuditResult[] = [];
  let charactersWithImages = 0;

  for (const character of characters) {
    const imageFiles = await findImageForCharacter(character.name);
    const hasImage = imageFiles.length > 0;

    if (hasImage) {
      charactersWithImages++;
    }

    results.push({
      characterName: character.name,
      characterId: character.id,
      hasImage,
      imageFiles,
      imagePath: hasImage ? path.join(CHARACTERS_DIR, imageFiles[0]) : undefined
    });

    // Progress indicator
    if (results.length % 10 === 0) {
      console.log(`✅ Processed ${results.length}/${characters.length} characters...`);
    }
  }

  const missingImages = results.filter(r => !r.hasImage);
  const coverage = (charactersWithImages / characters.length) * 100;

  console.log('\n📈 Audit Results:');
  console.log(`Total Characters: ${characters.length}`);
  console.log(`Characters with Images: ${charactersWithImages}`);
  console.log(`Characters Missing Images: ${missingImages.length}`);
  console.log(`Coverage: ${coverage.toFixed(1)}%`);

  return results;
}

async function generateMissingImagesList(results: ImageAuditResult[]): Promise<void> {
  console.log('\n📝 Generating missing images list...');

  const missingImages = results.filter(r => !r.hasImage);

  if (missingImages.length === 0) {
    console.log('🎉 All characters have images! No missing images found.');
    return;
  }

  // Create simple missing list
  const missingListLines = [
    '# Characters Missing Images',
    `Generated: ${new Date().toISOString()}`,
    `Total Missing: ${missingImages.length}`,
    '',
    '## Characters Needing Images',
    '',
    ...missingImages.map((char, index) => `${index + 1}. **${char.characterName}** (ID: ${char.characterId})`)
  ];

  const reportsDir = path.join(process.cwd(), 'reports');
  await fs.ensureDir(reportsDir);

  const missingListPath = path.join(reportsDir, 'MISSING_IMAGES_LIST.md');
  await fs.writeFile(missingListPath, missingListLines.join('\n'));

  // Also create a simple text file for easy copying
  const simpleListPath = path.join(reportsDir, 'missing-characters.txt');
  const simpleList = missingImages.map(char => char.characterName).join('\n');
  await fs.writeFile(simpleListPath, simpleList);

  console.log(`📝 Missing images list saved to: ${missingListPath}`);
  console.log(`📝 Simple list saved to: ${simpleListPath}`);

  // Show first 10 missing characters
  console.log('\n❌ Characters Missing Images:');
  missingImages.slice(0, 10).forEach((char, index) => {
    console.log(`${index + 1}. ${char.characterName}`);
  });

  if (missingImages.length > 10) {
    console.log(`   ... and ${missingImages.length - 10} more (see full list in reports/)`);
  }
}

async function validateExistingImages(results: ImageAuditResult[]): Promise<void> {
  console.log('\n🔍 Validating existing images...');

  const charactersWithImages = results.filter(r => r.hasImage);
  let duplicateFormats = 0;
  let pngFiles = 0;
  let webpFiles = 0;

  for (const char of charactersWithImages) {
    const hasWebp = char.imageFiles.some(f => f.endsWith('.webp'));
    const hasPng = char.imageFiles.some(f => f.endsWith('.png'));

    if (hasWebp && hasPng) {
      duplicateFormats++;
    }

    if (hasPng && !hasWebp) {
      pngFiles++;
    }

    if (hasWebp) {
      webpFiles++;
    }
  }

  console.log(`📊 Image Format Analysis:`);
  console.log(`- Characters with both PNG and WebP: ${duplicateFormats}`);
  console.log(`- Characters with only PNG: ${pngFiles}`);
  console.log(`- Characters with WebP: ${webpFiles}`);

  if (pngFiles > 0) {
    console.log(`⚠️ ${pngFiles} characters could benefit from WebP optimization`);
  }
}

async function generateCorrectedReport(results: ImageAuditResult[]): Promise<void> {
  console.log('\n📊 Generating corrected coverage report...');

  const totalCharacters = results.length;
  const charactersWithImages = results.filter(r => r.hasImage).length;
  const coverage = (charactersWithImages / totalCharacters) * 100;
  const missingImages = results.filter(r => !r.hasImage);

  const reportLines = [
    '# Corrected Image Coverage Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    `- **Total Characters**: ${totalCharacters}`,
    `- **Characters with Images**: ${charactersWithImages}`,
    `- **Coverage**: ${coverage.toFixed(1)}%`,
    `- **Missing Images**: ${missingImages.length}`,
    '',
    '## Characters with Images',
    ...results.filter(r => r.hasImage).map(r => `- ✅ ${r.characterName} (${r.imageFiles.length} file${r.imageFiles.length > 1 ? 's' : ''})`),
    '',
    '## Characters Missing Images',
    ...missingImages.map(r => `- ❌ ${r.characterName}`),
    '',
    '## Next Steps',
    '',
    missingImages.length === 0 ?
      '🎉 **All characters have images!** The image coverage is complete.' :
      [
        `1. **Generate ${missingImages.length} missing character portraits**`,
        '2. **Use AI tools** (Midjourney, DALL-E, Stable Diffusion) with stylized fantasy style',
        '3. **Save images** to public/images/characters/ with exact character names',
        '4. **Run optimization** to convert to WebP format',
        '5. **Update image registry** after adding new images'
      ].join('\n   ')
  ];

  const reportsDir = path.join(process.cwd(), 'reports');
  const reportPath = path.join(reportsDir, 'corrected-image-coverage.md');
  await fs.writeFile(reportPath, reportLines.join('\n'));

  console.log(`📝 Corrected coverage report saved: ${reportPath}`);
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Starting accurate image audit...');

    // Audit all characters against existing images
    const results = await auditAllCharacters();

    // Generate missing images list
    await generateMissingImagesList(results);

    // Validate existing images
    await validateExistingImages(results);

    // Generate corrected report
    await generateCorrectedReport(results);

    const missingCount = results.filter(r => !r.hasImage).length;

    console.log('\n✅ Accurate audit complete!');

    if (missingCount === 0) {
      console.log('🎉 All characters have images! No action needed.');
    } else {
      console.log(`📋 ${missingCount} characters need images - see reports/MISSING_IMAGES_LIST.md`);
      console.log('💡 You can generate these using AI tools with stylized fantasy style');
    }

  } catch (error) {
    console.error('❌ Error during accurate audit:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { auditAllCharacters, generateMissingImagesList };
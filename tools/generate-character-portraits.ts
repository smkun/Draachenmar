#!/usr/bin/env tsx
/**
 * Character Portrait Generation Pipeline
 * Creates AI-generated portraits for missing characters with consistent style
 */

import fs from 'fs-extra';
import path from 'path';
import { characters } from '../src/data/characters.ts';

interface CharacterPrompt {
  characterId: string;
  name: string;
  description: string;
  race: string;
  class: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  aiPrompt: string;
  stylePrompt: string;
}

interface GenerationConfig {
  style: string;
  artDirection: string;
  technicalSpecs: string;
  qualitySettings: string;
}

const GENERATION_CONFIG: GenerationConfig = {
  style: "fantasy art, digital painting, portrait style, D&D character art",
  artDirection: "medieval fantasy aesthetic, detailed facial features, fantasy clothing and armor",
  technicalSpecs: "high quality, 512x512 resolution, centered portrait, clean background",
  qualitySettings: "masterpiece, best quality, detailed, professional digital art"
};

const RACE_DESCRIPTIONS = {
  dwarf: "stocky build, thick beard, braided hair, sturdy features, often wearing metal armor or rich fabrics",
  elf: "tall and graceful, pointed ears, ethereal beauty, elegant features, flowing hair",
  human: "varied appearance, medium build, expressive features, diverse clothing styles",
  gnome: "small stature, curious expression, bright eyes, often with mechanical or magical accessories",
  halfling: "small and cheerful, round features, friendly demeanor, comfortable clothing",
  dragonborn: "draconic features, scaled skin, reptilian eyes, powerful build",
  tiefling: "demonic heritage, horns, tail, unusual skin color, exotic appearance"
};

const CLASS_DESCRIPTIONS = {
  fighter: "warrior bearing weapons and armor, battle-ready stance, martial appearance",
  wizard: "robes adorned with arcane symbols, holding staff or spellbook, scholarly appearance",
  cleric: "holy symbols, divine vestments, blessed armor, serene or commanding presence",
  rogue: "leather armor, hooded cloak, daggers, stealthy and agile appearance",
  ranger: "natural clothing, bow and quiver, woodland gear, outdoorsy appearance",
  paladin: "shining armor, holy symbols, righteous bearing, noble and pure appearance",
  barbarian: "tribal clothing, primitive weapons, wild and fierce appearance",
  bard: "colorful clothing, musical instruments, charismatic and artistic appearance",
  sorcerer: "magical energy visibly emanating, exotic clothing, inherent power",
  warlock: "dark or mysterious clothing, otherworldly features, eldritch power",
  druid: "nature-themed clothing, animal motifs, earthy and wild appearance",
  monk: "simple robes, peaceful demeanor, disciplined and serene appearance",
  artificer: "mechanical gadgets, inventor's tools, technological accessories",
  noble: "rich clothing, jewelry, regal bearing, symbols of status and wealth"
};

function generateCharacterPrompt(character: any, priority: string): CharacterPrompt {
  const race = (character.race || 'human').toLowerCase();
  const characterClass = (character.class || 'noble').toLowerCase();

  // Extract key details from description
  const description = character.description || '';
  const isRoyalty = /king|queen|prince|princess|duke|duchess/i.test(character.name + ' ' + description);
  const isMilitary = /captain|commander|guard|warrior/i.test(character.name + ' ' + description);
  const isMagical = /mage|wizard|archmage|magic|spell/i.test(character.name + ' ' + description);
  const isReligious = /priest|cleric|holy|divine|temple/i.test(character.name + ' ' + description);

  // Build race-specific description
  let raceDesc = RACE_DESCRIPTIONS[race as keyof typeof RACE_DESCRIPTIONS] || RACE_DESCRIPTIONS.human;

  // Build class-specific description
  let classDesc = CLASS_DESCRIPTIONS[characterClass as keyof typeof CLASS_DESCRIPTIONS] || CLASS_DESCRIPTIONS.noble;

  // Add role-specific elements
  let roleElements = [];
  if (isRoyalty) roleElements.push("royal crown or circlet, rich royal garments, regal bearing");
  if (isMilitary) roleElements.push("military insignia, weapons, armor, commanding presence");
  if (isMagical) roleElements.push("magical aura, arcane symbols, staff or wand, mystical appearance");
  if (isReligious) roleElements.push("holy symbols, divine vestments, blessed accessories, spiritual aura");

  // Extract specific details from description
  let specificDetails = [];
  if (description.includes('beard')) specificDetails.push('distinctive beard');
  if (description.includes('armor')) specificDetails.push('ornate armor');
  if (description.includes('robe')) specificDetails.push('elegant robes');
  if (description.includes('gem') || description.includes('jewelry')) specificDetails.push('precious jewelry');
  if (description.includes('scar')) specificDetails.push('battle scars');

  // Build the AI prompt
  const aiPrompt = [
    `Portrait of ${character.name}, a ${race} ${characterClass}`,
    raceDesc,
    classDesc,
    ...roleElements,
    ...specificDetails,
    GENERATION_CONFIG.artDirection,
    GENERATION_CONFIG.technicalSpecs
  ].filter(Boolean).join(', ');

  const stylePrompt = [
    GENERATION_CONFIG.style,
    GENERATION_CONFIG.qualitySettings,
    'consistent fantasy art style matching existing character portraits'
  ].join(', ');

  return {
    characterId: character.id,
    name: character.name,
    description: character.description || '',
    race: character.race || 'human',
    class: character.class || 'noble',
    priority: priority as any,
    aiPrompt,
    stylePrompt
  };
}

async function generatePromptBatch(priorityLevel: 'critical' | 'high' | 'medium' | 'low'): Promise<CharacterPrompt[]> {
  console.log(`\n🎨 Generating ${priorityLevel} priority character prompts...`);

  // Load priority queue
  const queuePath = path.join(process.cwd(), 'reports', 'image-priority-queue.json');
  const priorityQueue = await fs.readJson(queuePath);

  const missingCharacters = priorityQueue[priorityLevel];
  const prompts: CharacterPrompt[] = [];

  for (const missing of missingCharacters) {
    // Find full character data
    const character = characters.find(c => c.id === missing.characterId);
    if (!character) {
      console.warn(`⚠️ Character not found: ${missing.characterId}`);
      continue;
    }

    const prompt = generateCharacterPrompt(character, priorityLevel);
    prompts.push(prompt);
  }

  console.log(`Generated ${prompts.length} prompts for ${priorityLevel} priority characters`);
  return prompts;
}

async function savePromptBatch(prompts: CharacterPrompt[], filename: string): Promise<void> {
  const promptsDir = path.join(process.cwd(), 'reports', 'ai-prompts');
  await fs.ensureDir(promptsDir);

  const promptsPath = path.join(promptsDir, filename);
  await fs.writeJson(promptsPath, prompts, { spaces: 2 });

  // Also create a human-readable version
  const readablePath = path.join(promptsDir, filename.replace('.json', '.md'));
  const readableContent = [
    `# AI Generation Prompts - ${filename.replace('.json', '').replace('-', ' ').toUpperCase()}`,
    `Generated: ${new Date().toISOString()}`,
    '',
    ...prompts.map((prompt, index) => [
      `## ${index + 1}. ${prompt.name}`,
      `**Character ID**: ${prompt.characterId}`,
      `**Race**: ${prompt.race} | **Class**: ${prompt.class} | **Priority**: ${prompt.priority}`,
      '',
      '**AI Prompt**:',
      `"${prompt.aiPrompt}"`,
      '',
      '**Style Prompt**:',
      `"${prompt.stylePrompt}"`,
      '',
      '**Original Description**:',
      prompt.description.substring(0, 200) + (prompt.description.length > 200 ? '...' : ''),
      '',
      '---',
      ''
    ]).flat()
  ].join('\n');

  await fs.writeFile(readablePath, readableContent);

  console.log(`📝 Saved prompts: ${promptsPath}`);
  console.log(`📝 Saved readable: ${readablePath}`);
}

async function createImageGenerationScript(): Promise<void> {
  console.log('\n🔧 Creating image generation automation script...');

  const scriptContent = `#!/bin/bash
# Character Portrait Generation Script
# This script provides templates for AI image generation

set -e

CHARACTERS_DIR="public/images/characters"
TEMP_DIR="temp_generated"
PROMPTS_DIR="reports/ai-prompts"

# Create directories
mkdir -p "$CHARACTERS_DIR"
mkdir -p "$TEMP_DIR"

echo "🎨 Character Portrait Generation Helper"
echo "======================================"
echo ""
echo "This script helps generate character portraits using AI tools."
echo "Prompts are available in reports/ai-prompts/"
echo ""
echo "Recommended workflow:"
echo "1. Use critical-priority.json prompts first"
echo "2. Generate images with your preferred AI tool (Midjourney, DALL-E, Stable Diffusion)"
echo "3. Save images to temp_generated/ with exact character names"
echo "4. Run the optimization script to convert to WebP"
echo ""
echo "Available prompt files:"
ls -1 "$PROMPTS_DIR"/*.json 2>/dev/null || echo "No prompt files found. Run the generation script first."
echo ""
echo "AI Generation Tips:"
echo "- Use the 'aiPrompt' field for your AI tool"
echo "- Add the 'stylePrompt' for style consistency"
echo "- Generate at least 512x512 resolution"
echo "- Aim for consistent fantasy art style"
echo ""
echo "Example usage with Stable Diffusion:"
echo "python generate_image.py --prompt 'Portrait of King Rathgar...' --output temp_generated/"
echo ""
echo "After generation, run:"
echo "npm run optimize-images"
`;

  const scriptPath = path.join(process.cwd(), 'tools', 'generate-portraits.sh');
  await fs.writeFile(scriptPath, scriptContent);
  await fs.chmod(scriptPath, '755');

  console.log(`📝 Created generation script: ${scriptPath}`);
}

async function createValidationScript(): Promise<void> {
  console.log('\n🔍 Creating image validation script...');

  const validationContent = `#!/usr/bin/env tsx
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
    check.issues.push(\`Width too small: \${check.dimensions.width}px < \${QUALITY_STANDARDS.minWidth}px\`);
    check.passed = false;
  }

  if (check.dimensions.height < QUALITY_STANDARDS.minHeight) {
    check.issues.push(\`Height too small: \${check.dimensions.height}px < \${QUALITY_STANDARDS.minHeight}px\`);
    check.passed = false;
  }

  // Validate file size (only for WebP)
  if (check.format === 'webp' && check.fileSize > QUALITY_STANDARDS.maxFileSize) {
    check.issues.push(\`File size too large: \${(check.fileSize / 1024).toFixed(1)}KB > \${QUALITY_STANDARDS.maxFileSize / 1024}KB\`);
    check.passed = false;
  }

  // Validate format
  if (!QUALITY_STANDARDS.acceptedFormats.includes(check.format)) {
    check.issues.push(\`Invalid format: \${check.format}\`);
    check.passed = false;
  }

  return check;
}

async function validateBatch(directory: string): Promise<void> {
  console.log(\`🔍 Validating images in \${directory}...\`);

  const imageFiles = (await fs.readdir(directory))
    .filter(file => /\\.(webp|png|jpe?g)$/i.test(file))
    .map(file => path.join(directory, file));

  const results: ImageQualityCheck[] = [];

  for (const imagePath of imageFiles) {
    try {
      const result = await validateImage(imagePath);
      results.push(result);
    } catch (error) {
      console.error(\`❌ Error validating \${imagePath}:\`, error);
    }
  }

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);

  console.log(\`\\n📊 Validation Results:\`);
  console.log(\`Total Images: \${results.length}\`);
  console.log(\`Passed: \${passed.length}\`);
  console.log(\`Failed: \${failed.length}\`);

  if (failed.length > 0) {
    console.log(\`\\n❌ Failed Images:\`);
    failed.forEach(result => {
      console.log(\`- \${result.file}:\`);
      result.issues.forEach(issue => console.log(\`  • \${issue}\`));
    });
  }

  if (passed.length > 0) {
    console.log(\`\\n✅ All \${passed.length} images passed quality validation!\`);
  }
}

export { validateBatch, validateImage };

if (require.main === module) {
  const directory = process.argv[2] || 'public/images/characters';
  validateBatch(directory);
}
`;

  const validationPath = path.join(process.cwd(), 'tools', 'validate-image-assets.ts');
  await fs.writeFile(validationPath, validationContent);

  console.log(`📝 Created validation script: ${validationPath}`);
}

async function main() {
  try {
    console.log('🚀 Starting Character Portrait Generation Pipeline...');

    // Generate prompts for all priority levels
    const allPrompts: CharacterPrompt[] = [];

    for (const priority of ['critical', 'high', 'medium', 'low'] as const) {
      const prompts = await generatePromptBatch(priority);
      allPrompts.push(...prompts);
      await savePromptBatch(prompts, `${priority}-priority.json`);
    }

    // Create comprehensive prompt file
    await savePromptBatch(allPrompts, 'all-characters.json');

    // Create helper scripts
    await createImageGenerationScript();
    await createValidationScript();

    console.log('\n✅ Portrait generation pipeline complete!');
    console.log('\nGenerated Assets:');
    console.log('- AI prompts for all missing characters');
    console.log('- Generation helper script');
    console.log('- Image validation script');
    console.log('\nNext Steps:');
    console.log('1. Review reports/ai-prompts/critical-priority.md');
    console.log('2. Use AI tool of choice with generated prompts');
    console.log('3. Save generated images to public/images/characters/');
    console.log('4. Run tools/validate-image-assets.ts for quality check');
    console.log('5. Run existing optimization pipeline');

  } catch (error) {
    console.error('❌ Error in generation pipeline:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { generateCharacterPrompt, generatePromptBatch };
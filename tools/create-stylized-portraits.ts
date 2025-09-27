#!/usr/bin/env tsx
/**
 * Stylized Fantasy Portrait Creator
 * Creates consistent stylized fantasy portraits for characters
 */

import fs from 'fs-extra';
import path from 'path';

interface StyleConfig {
  artStyle: string;
  colorPalette: string[];
  characterTraits: Record<string, string>;
  technicalSpecs: string;
}

const STYLIZED_FANTASY_CONFIG: StyleConfig = {
  artStyle: "stylized fantasy art, cartoon-inspired, painterly digital art, D&D character illustration, non-realistic, stylized proportions, fantasy game art style",
  colorPalette: [
    "rich purples and golds", // royal characters
    "earthy browns and greens", // dwarves and natural
    "cool blues and silvers", // magical characters
    "warm reds and oranges", // military/warriors
    "ethereal pastels" // elves and mystical
  ],
  characterTraits: {
    dwarf: "exaggerated beard, stocky proportions, ornate armor details, gem inlays",
    elf: "elongated elegant features, flowing hair, ethereal glow, delicate jewelry",
    human: "varied but heroic proportions, expressive eyes, noble bearing",
    goliath: "large imposing figure, stone-like skin markings, powerful build",
    giant: "massive scale implied, imposing presence, elemental features"
  },
  technicalSpecs: "512x512, centered portrait, clean fantasy background, soft lighting, stylized not photorealistic"
};

interface CharacterPortraitData {
  id: string;
  name: string;
  race: string;
  class: string;
  priority: string;
  stylePrompt: string;
  colorScheme: string;
  description: string;
}

async function createStylizedPrompts(): Promise<CharacterPortraitData[]> {
  console.log('🎨 Creating stylized fantasy portrait prompts...');

  // Load the critical priority characters
  const criticalPath = path.join(process.cwd(), 'reports', 'ai-prompts', 'critical-priority.json');
  const criticalCharacters = await fs.readJson(criticalPath);

  const portraits: CharacterPortraitData[] = [];

  for (const character of criticalCharacters) {
    const race = character.race.toLowerCase();
    const isRoyalty = character.name.includes('King') || character.name.includes('Queen');
    const isMilitary = character.name.includes('Captain') || character.class.includes('Fighter');
    const isMagical = character.class.includes('Wizard') || character.class.includes('Sorcerer');

    // Determine color scheme based on character type
    let colorScheme = STYLIZED_FANTASY_CONFIG.colorPalette[0]; // default
    if (isRoyalty) colorScheme = "rich purples, golds, and royal blues with crown details";
    else if (isMilitary) colorScheme = "metallic silvers and bold reds with armor highlights";
    else if (isMagical) colorScheme = "mystical blues and purples with magical aura effects";
    else if (race === 'dwarf') colorScheme = "earthy browns and metallics with gem accents";
    else if (race === 'elf') colorScheme = "ethereal greens and silvers with nature motifs";

    // Create stylized prompt
    const stylePrompt = [
      `Stylized fantasy portrait of ${character.name}`,
      `${race} ${character.class}`,
      STYLIZED_FANTASY_CONFIG.characterTraits[race] || "heroic fantasy proportions",
      colorScheme,
      isRoyalty ? "royal regalia, crown or circlet, noble bearing" : "",
      isMilitary ? "stylized armor, weapons, commanding pose" : "",
      isMagical ? "magical aura, arcane symbols, mystical accessories" : "",
      STYLIZED_FANTASY_CONFIG.artStyle,
      STYLIZED_FANTASY_CONFIG.technicalSpecs
    ].filter(Boolean).join(', ');

    portraits.push({
      id: character.characterId,
      name: character.name,
      race: character.race,
      class: character.class,
      priority: character.priority,
      stylePrompt,
      colorScheme,
      description: character.description.substring(0, 100) + '...'
    });
  }

  return portraits;
}

async function generatePortraitBatch(portraits: CharacterPortraitData[]): Promise<void> {
  console.log(`\n🖼️ Generating ${portraits.length} stylized fantasy portraits...`);

  // Create temp directory for generated images
  const tempDir = path.join(process.cwd(), 'temp_generated');
  await fs.ensureDir(tempDir);

  // Create the generation instruction file
  const instructionFile = [
    '# Stylized Fantasy Portrait Generation Instructions',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Art Style Guidelines',
    '- **Style**: Stylized fantasy art, NOT photorealistic',
    '- **Inspiration**: D&D character art, fantasy game illustrations, painterly digital art',
    '- **Proportions**: Slightly exaggerated, heroic fantasy style',
    '- **Colors**: Rich, saturated fantasy palette',
    '- **Background**: Clean, simple fantasy backgrounds',
    '',
    '## Technical Specifications',
    '- **Resolution**: 512x512 pixels minimum',
    '- **Format**: PNG or JPG (will be converted to WebP)',
    '- **Naming**: Use exact character name as filename',
    '- **Centering**: Portrait should be centered in frame',
    '',
    '## Character Portraits to Generate',
    '',
    ...portraits.map((portrait, index) => [
      `### ${index + 1}. ${portrait.name}`,
      `**Character ID**: ${portrait.id}`,
      `**Race**: ${portrait.race} | **Class**: ${portrait.class}`,
      `**Priority**: ${portrait.priority.toUpperCase()}`,
      '',
      '**Stylized Prompt**:',
      `"${portrait.stylePrompt}"`,
      '',
      '**Color Scheme**: ' + portrait.colorScheme,
      '',
      '**Key Features**:',
      portrait.race === 'dwarf' ? '- Exaggerated beard and stocky build' : '',
      portrait.race === 'elf' ? '- Pointed ears and ethereal features' : '',
      portrait.name.includes('King') || portrait.name.includes('Queen') ? '- Royal crown or circlet' : '',
      portrait.name.includes('Captain') ? '- Military armor and weapons' : '',
      portrait.class.includes('Wizard') ? '- Magical robes and arcane symbols' : '',
      '',
      '**Save as**: `' + portrait.name + '.png`',
      '',
      '---',
      ''
    ]).flat().filter(line => line !== '')
  ].join('\n');

  const instructionPath = path.join(tempDir, 'GENERATION_INSTRUCTIONS.md');
  await fs.writeFile(instructionPath, instructionFile);

  // Create a quick reference list
  const quickRefLines = [
    '# Quick Reference - Critical Priority Characters',
    '',
    'Generate these 17 characters in stylized fantasy art style:',
    '',
    ...portraits.map((p, i) => `${i + 1}. **${p.name}** (${p.race} ${p.class}) - ${p.colorScheme}`)
  ];

  const quickRefPath = path.join(tempDir, 'QUICK_REFERENCE.md');
  await fs.writeFile(quickRefPath, quickRefLines.join('\n'));

  console.log(`📝 Generation instructions saved to: ${instructionPath}`);
  console.log(`📝 Quick reference saved to: ${quickRefPath}`);
  console.log('\n🎯 Next Steps:');
  console.log('1. Use your preferred AI art tool (Midjourney, DALL-E, Stable Diffusion)');
  console.log('2. Generate each character using the stylized prompts');
  console.log('3. Save images to temp_generated/ with exact character names');
  console.log('4. Run integration script to optimize and validate');
}

async function createExamplePrompts(): Promise<void> {
  console.log('\n📚 Creating example prompts for different AI tools...');

  const examplePrompts = {
    midjourney: [
      '/imagine prompt: Stylized fantasy portrait of High King Rathgar Stoneforge Ironhammer, dwarf noble, exaggerated beard, stocky proportions, ornate armor details, gem inlays, rich purples, golds, and royal blues with crown details, royal regalia, crown or circlet, noble bearing, stylized fantasy art, cartoon-inspired, painterly digital art, D&D character illustration, non-realistic, stylized proportions, fantasy game art style, 512x512, centered portrait, clean fantasy background, soft lighting, stylized not photorealistic --ar 1:1 --style fantasy',
      '',
      '/imagine prompt: Stylized fantasy portrait of Queen Yurta, frost giant noble, massive scale implied, imposing presence, elemental features, mystical blues and purples with magical aura effects, royal regalia, crown or circlet, magical aura, arcane symbols, mystical accessories, stylized fantasy art, D&D character illustration, fantasy game art style --ar 1:1 --style fantasy'
    ],
    dalle: [
      'Stylized fantasy portrait of Captain Aldrik Thunderfoot, dwarf fighter, exaggerated beard, stocky proportions, ornate armor details, metallic silvers and bold reds with armor highlights, stylized armor, weapons, commanding pose, stylized fantasy art, cartoon-inspired, painterly digital art, D&D character illustration, non-realistic proportions, 512x512, centered portrait, clean fantasy background',
      '',
      'Stylized fantasy portrait of High Counselor Elowen Windwhisper, elf noble, elongated elegant features, flowing hair, ethereal glow, delicate jewelry, ethereal greens and silvers with nature motifs, royal regalia, noble bearing, stylized fantasy art, fantasy game art style, non-photorealistic'
    ],
    stableDiffusion: [
      'Stylized fantasy portrait of Headmaster Brondar Stormfist, goliath wizard, large imposing figure, stone-like skin markings, powerful build, mystical blues and purples with magical aura effects, magical aura, arcane symbols, mystical accessories, stylized fantasy art, cartoon-inspired, painterly digital art, D&D character illustration, non-realistic, stylized proportions, fantasy game art style, 512x512, centered portrait, clean fantasy background, soft lighting, masterpiece, best quality',
      '',
      'Negative prompt: photorealistic, realistic, photography, modern clothing, contemporary, 3d render, blurry, low quality'
    ]
  };

  const examplePath = path.join(process.cwd(), 'temp_generated', 'AI_TOOL_EXAMPLES.md');
  const exampleContent = [
    '# AI Tool Example Prompts',
    '',
    '## Midjourney Examples',
    ...examplePrompts.midjourney,
    '',
    '## DALL-E Examples',
    ...examplePrompts.dalle,
    '',
    '## Stable Diffusion Examples',
    ...examplePrompts.stableDiffusion,
    '',
    '## Style Consistency Tips',
    '- Use "stylized fantasy art" in all prompts',
    '- Avoid "photorealistic" or "realistic"',
    '- Include "D&D character illustration" for consistency',
    '- Use "cartoon-inspired" or "painterly" for style',
    '- Specify "non-realistic proportions" for fantasy feel',
    '- Add character-specific color schemes',
    '- Include race-specific traits (beard for dwarves, pointed ears for elves)',
    '- Add role-specific elements (crowns for royalty, armor for warriors)'
  ].join('\n');

  await fs.writeFile(examplePath, exampleContent);
  console.log(`📝 AI tool examples saved to: ${examplePath}`);
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Starting stylized fantasy portrait creation...');

    // Create stylized prompts for critical characters
    const portraits = await createStylizedPrompts();

    // Generate instructions and reference files
    await generatePortraitBatch(portraits);

    // Create example prompts for different AI tools
    await createExamplePrompts();

    console.log('\n✅ Stylized portrait generation setup complete!');
    console.log(`📊 Ready to generate ${portraits.length} critical priority characters`);
    console.log('\n🎨 Style Focus: Stylized Fantasy (NOT Realistic)');
    console.log('- Cartoon-inspired D&D character art');
    console.log('- Exaggerated fantasy proportions');
    console.log('- Rich, saturated color palettes');
    console.log('- Painterly digital art style');

  } catch (error) {
    console.error('❌ Error creating stylized portraits:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { createStylizedPrompts, generatePortraitBatch };
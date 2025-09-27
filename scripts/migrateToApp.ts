#!/usr/bin/env tsx

import fs from 'fs-extra';
import path from 'path';

async function migrateExtractedContent() {
  console.log('🔄 Migrating extracted content to app...\n');

  const extractedDir = './extracted-content';
  const dataDir = './src/data';

  // Check if extracted content exists
  if (!await fs.pathExists(extractedDir)) {
    console.error('❌ No extracted content found. Run npm run extract-content first.');
    return;
  }

  try {
    // Load extracted data
    const characters = await fs.readJSON(path.join(extractedDir, 'characters.json'));
    const items = await fs.readJSON(path.join(extractedDir, 'items.json'));
    const locations = await fs.readJSON(path.join(extractedDir, 'locations.json'));
    const organizations = await fs.readJSON(path.join(extractedDir, 'organizations.json'));

    console.log('📊 Loaded extracted content:');
    console.log(`   👥 Characters: ${characters.length}`);
    console.log(`   ⚔️  Items: ${items.length}`);
    console.log(`   🏰 Locations: ${locations.length}`);
    console.log(`   🛡️  Organizations: ${organizations.length}\n`);

    // Filter and clean the content - remove low-quality extractions
    const cleanCharacters = characters.filter((char: any) =>
      char.name &&
      char.name.length < 100 &&
      !char.name.toLowerCase().includes('draachenmar 3.') &&
      char.description &&
      char.description.length > 20
    );

    const cleanItems = items.filter((item: any) =>
      item.name &&
      item.name.length < 100 &&
      !item.name.toLowerCase().includes('draachenmar 3.') &&
      item.description &&
      item.description.length > 20
    );

    const cleanLocations = locations.filter((loc: any) =>
      loc.name &&
      loc.name.length < 100 &&
      !loc.name.toLowerCase().includes('draachenmar 3.') &&
      loc.description &&
      loc.description.length > 20
    );

    const cleanOrganizations = organizations.filter((org: any) =>
      org.name &&
      org.name.length < 100 &&
      !org.name.toLowerCase().includes('draachenmar 3.') &&
      org.description &&
      org.description.length > 20
    );

    console.log('🧹 After cleaning:');
    console.log(`   👥 Characters: ${cleanCharacters.length}`);
    console.log(`   ⚔️  Items: ${cleanItems.length}`);
    console.log(`   🏰 Locations: ${cleanLocations.length}`);
    console.log(`   🛡️  Organizations: ${cleanOrganizations.length}\n`);

    // Convert to our app format
    const appCharacters = cleanCharacters.map((char: any) => ({
      id: char.id,
      name: char.name,
      title: char.title || undefined,
      race: char.race || undefined,
      class: char.class || undefined,
      category: mapCharacterCategory(char),
      description: cleanDescription(char.description),
      background: char.background || undefined,
      creator: char.creator || char.source?.creator || undefined,
      tags: char.tags || ['character']
    }));

    const appItems = cleanItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      title: item.title || undefined,
      type: mapItemType(item.type),
      rarity: mapRarity(item.rarity),
      description: cleanDescription(item.description),
      properties: item.properties || undefined,
      history: item.history || undefined,
      creator: item.creator || item.source?.creator || undefined,
      tags: item.tags || ['item']
    }));

    const appLocations = cleanLocations.map((loc: any) => ({
      id: loc.id,
      name: loc.name,
      title: loc.title || undefined,
      type: mapLocationType(loc.type),
      population: loc.population || undefined,
      description: cleanDescription(loc.description),
      government: loc.government || undefined,
      economy: loc.economy || undefined,
      history: loc.history || undefined,
      tags: loc.tags || ['location']
    }));

    const appOrganizations = cleanOrganizations.map((org: any) => ({
      id: org.id,
      name: org.name,
      type: mapOrganizationType(org.type),
      description: cleanDescription(org.description),
      headquarters: org.headquarters || undefined,
      leader: org.leader || undefined,
      goals: org.goals || undefined,
      tags: org.tags || ['organization']
    }));

    // Write TypeScript files
    await writeDataFile('characters.ts', 'Character', appCharacters);
    await writeDataFile('items.ts', 'Item', appItems);
    await writeDataFile('locations.ts', 'Location', appLocations);
    await writeDataFile('organizations.ts', 'Organization', appOrganizations);

    console.log('✅ Migration complete!');
    console.log('🔄 You may need to restart your dev server to see the new content.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

function mapCharacterCategory(char: any): string {
  const category = char.category || 'npc';
  const validCategories = ['npc', 'player', 'deity', 'antagonist', 'historical'];
  return validCategories.includes(category) ? category : 'npc';
}

function mapItemType(type: string): string {
  if (!type) return 'mundane';
  const typeMap: Record<string, string> = {
    'weapon': 'weapon',
    'armor': 'armor',
    'artifact': 'artifact',
    'consumable': 'consumable',
    'accessory': 'accessory'
  };
  return typeMap[type.toLowerCase()] || 'mundane';
}

function mapRarity(rarity?: string): string {
  if (!rarity) return 'common';
  const rarityMap: Record<string, string> = {
    'common': 'common',
    'uncommon': 'uncommon',
    'rare': 'rare',
    'very rare': 'very-rare',
    'very-rare': 'very-rare',
    'legendary': 'legendary',
    'artifact': 'artifact'
  };
  return rarityMap[rarity.toLowerCase()] || 'common';
}

function mapLocationType(type: string): string {
  if (!type) return 'landmark';
  const typeMap: Record<string, string> = {
    'city': 'city',
    'town': 'town',
    'village': 'village',
    'fortress': 'fortress',
    'dungeon': 'dungeon',
    'landmark': 'landmark',
    'region': 'region'
  };
  return typeMap[type.toLowerCase()] || 'landmark';
}

function mapOrganizationType(type: string): string {
  if (!type) return 'guild';
  const typeMap: Record<string, string> = {
    'guild': 'guild',
    'order': 'order',
    'government': 'government',
    'religion': 'religion',
    'military': 'military',
    'criminal': 'criminal'
  };
  return typeMap[type.toLowerCase()] || 'guild';
}

function cleanDescription(description: string): string {
  if (!description) return '';

  // Remove common artifacts from extraction
  let cleaned = description
    .replace(/^DRAACHENMAR\s*/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Take first reasonable paragraph if too long
  if (cleaned.length > 500) {
    const sentences = cleaned.split(/[.!?]+/);
    const firstFewSentences = sentences.slice(0, 3).join('. ');
    cleaned = firstFewSentences + (firstFewSentences.endsWith('.') ? '' : '.');
  }

  return cleaned;
}

async function writeDataFile(fileName: string, typeName: string, data: any[]) {
  const filePath = path.join('./src/data', fileName);

  const content = `import { ${typeName} } from '../types';

export const ${fileName.replace('.ts', '')}: ${typeName}[] = ${JSON.stringify(data, null, 2)};
`;

  await fs.writeFile(filePath, content);
  console.log(`📝 Updated ${fileName} with ${data.length} entries`);
}

// Run the migration
if (require.main === module) {
  migrateExtractedContent().catch(error => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
}
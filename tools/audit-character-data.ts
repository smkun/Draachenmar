#!/usr/bin/env tsx
/**
 * Character Data Integrity Audit
 * Identifies characters missing required fields
 */

import fs from 'fs-extra';
import path from 'path';
import { characters } from '../src/data/characters.ts';

interface DataIntegrityIssue {
  characterId: string;
  characterName: string;
  missingFields: string[];
  hasDescription: boolean;
  hasCategory: boolean;
  hasRace: boolean;
  hasClass: boolean;
}

const REQUIRED_FIELDS = ['description', 'category', 'race', 'class'];
const OPTIONAL_FIELDS = ['title', 'level', 'location', 'background', 'personality', 'appearance', 'relationships', 'stats', 'abilities'];

async function auditCharacterData(): Promise<void> {
  console.log('🔍 Starting character data integrity audit...');
  console.log(`📊 Total characters to audit: ${characters.length}`);

  const issues: DataIntegrityIssue[] = [];
  let completeCharacters = 0;
  let incompleteCharacters = 0;

  for (const character of characters) {
    const missingFields: string[] = [];

    // Check required fields
    if (!character.description || character.description.trim() === '') {
      missingFields.push('description');
    }
    if (!character.category) {
      missingFields.push('category');
    }
    if (!character.race) {
      missingFields.push('race');
    }
    if (!character.class) {
      missingFields.push('class');
    }

    if (missingFields.length > 0) {
      issues.push({
        characterId: character.id,
        characterName: character.name,
        missingFields,
        hasDescription: !!character.description,
        hasCategory: !!character.category,
        hasRace: !!character.race,
        hasClass: !!character.class
      });
      incompleteCharacters++;
    } else {
      completeCharacters++;
    }
  }

  // Generate summary report
  console.log('\\n📈 Data Integrity Summary:');
  console.log(`✅ Complete characters: ${completeCharacters}`);
  console.log(`❌ Incomplete characters: ${incompleteCharacters}`);
  console.log(`📊 Completion rate: ${((completeCharacters / characters.length) * 100).toFixed(1)}%`);

  if (issues.length > 0) {
    console.log('\\n❌ Characters with missing data:');

    // Group by missing fields
    const missingDescription = issues.filter(i => i.missingFields.includes('description'));
    const missingCategory = issues.filter(i => i.missingFields.includes('category'));
    const missingRace = issues.filter(i => i.missingFields.includes('race'));
    const missingClass = issues.filter(i => i.missingFields.includes('class'));

    console.log(`\\n📝 Missing descriptions (${missingDescription.length}):`);
    missingDescription.slice(0, 10).forEach(issue => {
      console.log(`  - ${issue.characterName} (${issue.characterId})`);
    });
    if (missingDescription.length > 10) {
      console.log(`    ... and ${missingDescription.length - 10} more`);
    }

    console.log(`\\n🏷️ Missing categories (${missingCategory.length}):`);
    missingCategory.slice(0, 10).forEach(issue => {
      console.log(`  - ${issue.characterName} (${issue.characterId})`);
    });

    console.log(`\\n🧬 Missing races (${missingRace.length}):`);
    missingRace.slice(0, 10).forEach(issue => {
      console.log(`  - ${issue.characterName} (${issue.characterId})`);
    });

    console.log(`\\n⚔️ Missing classes (${missingClass.length}):`);
    missingClass.slice(0, 10).forEach(issue => {
      console.log(`  - ${issue.characterName} (${issue.characterId})`);
    });
  }

  // Generate detailed report file
  await generateDetailedReport(issues);
}

async function generateDetailedReport(issues: DataIntegrityIssue[]): Promise<void> {
  const reportsDir = path.join(process.cwd(), 'reports');
  await fs.ensureDir(reportsDir);

  const reportLines = [
    '# Character Data Integrity Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    `- **Total Characters**: ${characters.length}`,
    `- **Complete Characters**: ${characters.length - issues.length}`,
    `- **Incomplete Characters**: ${issues.length}`,
    `- **Completion Rate**: ${(((characters.length - issues.length) / characters.length) * 100).toFixed(1)}%`,
    '',
    '## Characters Missing Required Fields',
    '',
    ...issues.map(issue => [
      `### ${issue.characterName}`,
      `**ID**: ${issue.characterId}`,
      `**Missing Fields**: ${issue.missingFields.join(', ')}`,
      `**Status**:`,
      `- Description: ${issue.hasDescription ? '✅' : '❌'}`,
      `- Category: ${issue.hasCategory ? '✅' : '❌'}`,
      `- Race: ${issue.hasRace ? '✅' : '❌'}`,
      `- Class: ${issue.hasClass ? '✅' : '❌'}`,
      ''
    ]).flat(),
    '',
    '## Recommended Actions',
    '',
    '1. **Priority 1**: Add missing descriptions for characters without them',
    '2. **Priority 2**: Add missing categories (npc, player, deity, etc.)',
    '3. **Priority 3**: Add missing races (human, dwarf, elf, etc.)',
    '4. **Priority 4**: Add missing classes (fighter, wizard, noble, etc.)',
    '',
    '## Data Template for Missing Entries',
    '',
    '```typescript',
    '{',
    '  "id": "character-id",',
    '  "name": "Character Name",',
    '  "race": "Human|Dwarf|Elf|etc",',
    '  "class": "Fighter|Wizard|Noble|etc",',
    '  "category": "npc|player|deity|antagonist|historical",',
    '  "description": "Character description here...",',
    '  "image": "Character Name",',
    '  "creator": "Campaign Setting",',
    '  "tags": ["character", "relevant", "tags"]',
    '}',
    '```',
    '',
    '## Next Steps',
    '',
    '1. **Backup current data** before making changes',
    '2. **Research character information** from campaign sources',
    '3. **Add missing fields systematically** starting with descriptions',
    '4. **Validate data integrity** after updates',
    '5. **Test application** to ensure no errors'
  ];

  const reportPath = path.join(reportsDir, 'character-data-integrity.md');
  await fs.writeFile(reportPath, reportLines.join('\\n'));

  // Also create a CSV for easy editing
  const csvLines = [
    'character_id,character_name,missing_description,missing_category,missing_race,missing_class,all_missing_fields',
    ...issues.map(issue => [
      issue.characterId,
      `"${issue.characterName}"`,
      !issue.hasDescription,
      !issue.hasCategory,
      !issue.hasRace,
      !issue.hasClass,
      `"${issue.missingFields.join(', ')}"`
    ].join(','))
  ];

  const csvPath = path.join(reportsDir, 'character-data-issues.csv');
  await fs.writeFile(csvPath, csvLines.join('\\n'));

  console.log(`\\n📝 Detailed reports generated:`);
  console.log(`- Report: ${reportPath}`);
  console.log(`- CSV: ${csvPath}`);
}

async function main(): Promise<void> {
  try {
    await auditCharacterData();
    console.log('\\n✅ Character data integrity audit complete!');
    console.log('\\n⚠️ Action Required: Review the missing data and update character entries');
    console.log('💡 Check reports/character-data-integrity.md for detailed findings');
  } catch (error) {
    console.error('❌ Error during audit:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { auditCharacterData };
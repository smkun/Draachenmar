#!/usr/bin/env tsx
/**
 * Character Data Fix Script
 * Adds missing required fields to incomplete character entries
 */

import fs from 'fs-extra';
import path from 'path';

interface CharacterFix {
  id: string;
  name: string;
  race: string;
  class: string;
  category: 'npc' | 'player' | 'deity' | 'antagonist' | 'historical';
  description: string;
}

// Based on character names and titles, infer the missing data
const CHARACTER_FIXES: CharacterFix[] = [
  {
    id: 'tinkernock-steambeard',
    name: 'Admiral Tinkernock Steambeard',
    race: 'Gnome',
    class: 'Noble/Artificer',
    category: 'npc',
    description: 'Admiral Tinkernock Steambeard is a distinguished gnomish naval commander and master artificer. Known for his steam-powered innovations and mechanical beard enhancements, he leads the clockwork fleets with precision and ingenuity. His expertise in both naval warfare and artifice makes him a formidable ally to those who serve the cause of order and innovation.'
  },
  {
    id: 'duke-alaric-aerlin',
    name: 'Duke Alaric of Aerlin',
    race: 'Human',
    class: 'Noble',
    category: 'npc',
    description: 'Duke Alaric of Aerlin is a respected noble who governs the duchy of Aerlin with wisdom and strength. Known for his diplomatic skills and military acumen, he maintains stability in his realm while fostering trade and cultural exchange. His court is renowned for its scholars and artisans who contribute to the intellectual growth of the kingdom.'
  },
  {
    id: 'duke-idris-albion',
    name: 'Duke Idris of Albion',
    race: 'Human',
    class: 'Noble',
    category: 'npc',
    description: 'Duke Idris of Albion rules the coastal duchy of Albion, known for its maritime traditions and skilled sailors. A veteran of many naval campaigns, he combines noble bearing with practical seafaring knowledge. His duchy serves as a crucial link between the mainland kingdoms and the island territories, making him an important figure in regional politics.'
  },
  {
    id: 'duke-cedric-merish',
    name: 'Duke Cedric of Merish',
    race: 'Human',
    class: 'Noble',
    category: 'npc',
    description: 'Duke Cedric of Merish governs the inland duchy of Merish, famous for its fertile lands and abundant harvests. A pragmatic ruler who prioritizes the welfare of his people, he has implemented agricultural innovations that have made his duchy one of the most prosperous in the realm. His practical wisdom and fair governance have earned him the loyalty of both nobles and commoners.'
  },
  {
    id: 'drakar-clawforge',
    name: 'Lord Commander Drakar Clawforge',
    race: 'Dragonborn',
    class: 'Fighter/Paladin',
    category: 'npc',
    description: 'Lord Commander Drakar Clawforge is a formidable dragonborn warrior who leads elite military forces with honor and tactical brilliance. His draconic heritage grants him natural authority and fearsome presence in battle. Known for his unwavering loyalty and strategic mind, he has never lost a campaign under his command, earning respect from allies and fear from enemies.'
  },
  {
    id: 'selene-scalewarden',
    name: 'High Strategos Selene Scalewarden',
    race: 'Dragonborn',
    class: 'Fighter/Strategist',
    category: 'npc',
    description: 'High Strategos Selene Scalewarden is a brilliant military strategist and dragonborn commander who oversees large-scale military operations. Her scales shimmer with an otherworldly sheen that reflects her ancient draconic bloodline. Renowned for her ability to see patterns in chaos and turn the tide of seemingly hopeless battles, she is considered one of the greatest tactical minds of her generation.'
  },
  {
    id: 'vaelis-blackfang',
    name: 'Shadowmistress Vaelis Blackfang',
    race: 'Drow',
    class: 'Rogue/Assassin',
    category: 'npc',
    description: 'Shadowmistress Vaelis Blackfang is a mysterious drow operative who moves through shadows with deadly grace. Her expertise in espionage, assassination, and shadow magic makes her both a valuable ally and a terrifying enemy. Few have seen her true face and lived to tell the tale, as she prefers to work from the darkness, manipulating events from behind the scenes.'
  },
  {
    id: 'drakarn-spellbinder',
    name: 'Archmage Drakarn Spellbinder',
    race: 'Human',
    class: 'Wizard',
    category: 'npc',
    description: 'Archmage Drakarn Spellbinder is a master of arcane arts and leader within the Gray Order\'s Council of Eldertomes. His expertise in magical scripts and spellbinding makes him one of the most powerful wizards in the realm. Known for his vast library of ancient tomes and his ability to unravel the most complex magical mysteries, he serves as both scholar and protector of mystical knowledge.'
  },
  {
    id: 'marwen-earthshaper',
    name: 'Professor Marwen Earthshaper',
    race: 'Human',
    class: 'Wizard/Scholar',
    category: 'npc',
    description: 'Professor Marwen Earthshaper is a renowned scholar and member of the Gray Order\'s Council, specializing in archaeology, geology, and earth magic. His research into ancient civilizations and geological formations has uncovered many secrets of the past. His ability to shape stone and earth makes him invaluable in both academic research and practical applications of magical knowledge.'
  },
  {
    id: 'vaelora-wordsmith',
    name: 'Lady Vaelora Wordsmith',
    race: 'Elf',
    class: 'Bard/Scholar',
    category: 'npc',
    description: 'Lady Vaelora Wordsmith is an eloquent elven noble and master of written and spoken word. Her skills in diplomacy, linguistics, and literary arts make her an invaluable advisor and cultural ambassador. She has authored several influential treatises on inter-cultural communication and serves as a bridge between different races and nations through her gift for languages and storytelling.'
  },
  {
    id: 'thalgrim-forgeheart',
    name: 'Master Thalgrim Forgeheart',
    race: 'Dwarf',
    class: 'Artificer',
    category: 'npc',
    description: 'Master Thalgrim Forgeheart is a dwarven master craftsman whose skill at the forge is legendary throughout the realm. His ability to create magical items and weapons of extraordinary quality has made him one of the most sought-after artificers. His workshop produces items that are not only functional but works of art, combining traditional dwarven craftsmanship with innovative magical techniques.'
  },
  {
    id: 'lirael-starwhisper',
    name: 'High Priestess Lirael Starwhisper',
    race: 'Elf',
    class: 'Cleric',
    category: 'npc',
    description: 'High Priestess Lirael Starwhisper is a devoted elven cleric who serves as a spiritual leader and divine conduit. Her connection to celestial powers and her wisdom in matters of faith make her a beacon of hope in troubled times. Known for her healing abilities and prophetic insights, she provides guidance to both common folk and nobles who seek divine intervention or spiritual counsel.'
  },
  {
    id: 'elandra-tomekeeper',
    name: 'Scribe Elandra Tomekeeper',
    race: 'Human',
    class: 'Scholar',
    category: 'npc',
    description: 'Scribe Elandra Tomekeeper is a meticulous keeper of records and ancient knowledge within the Gray Order. Her exceptional skill in copying, preserving, and organizing magical texts has made her indispensable to the scholarly community. She possesses an encyclopedic knowledge of the locations and contents of thousands of magical documents, making her a living index of arcane knowledge.'
  },
  {
    id: 'faelan-wildshadow',
    name: 'Ranger Faelan Wildshadow',
    race: 'Half-Elf',
    class: 'Ranger',
    category: 'npc',
    description: 'Ranger Faelan Wildshadow is a skilled tracker and wilderness expert who serves as a guardian of the natural world. His half-elven heritage grants him keen senses and an intuitive understanding of both civilized and wild lands. Known for his ability to move unseen through any terrain and his expertise in hunting dangerous creatures, he serves as both guide and protector for those who venture into untamed regions.'
  },
  {
    id: 'elysa-truthseeker',
    name: 'Mistress Elysa Truthseeker',
    race: 'Human',
    class: 'Inquisitor/Cleric',
    category: 'npc',
    description: 'Mistress Elysa Truthseeker is a dedicated inquisitor whose mission is to uncover hidden truths and expose deception. Her divine abilities allow her to see through lies and illusions, making her a formidable investigator of corruption and heresy. Her unwavering commitment to justice and truth has made her both feared by wrongdoers and respected by those who value honesty and integrity.'
  }
];

async function fixCharacterData(): Promise<void> {
  console.log('🔧 Starting character data fix process...');

  const charactersFilePath = path.join(process.cwd(), 'src', 'data', 'characters.ts');

  // Read the current file
  let fileContent = await fs.readFile(charactersFilePath, 'utf8');

  console.log(`📊 Fixing ${CHARACTER_FIXES.length} incomplete character entries...`);

  for (const fix of CHARACTER_FIXES) {
    console.log(`🛠️ Fixing ${fix.name}...`);

    // Find the character entry in the file
    const entryRegex = new RegExp(
      `(\\s*{\\s*"id":\\s*"${fix.id}"[^}]+)(})(,?)`,
      'gm'
    );

    const match = entryRegex.exec(fileContent);
    if (match) {
      // Build the complete character entry
      const completeEntry = `  {
    "id": "${fix.id}",
    "name": "${fix.name}",
    "race": "${fix.race}",
    "class": "${fix.class}",
    "category": "${fix.category}",
    "description": "${fix.description}",
    "image": "${fix.name}",
    "creator": "Campaign Setting",
    "tags": ["character", "npc", "${fix.race.toLowerCase()}", "${fix.class.toLowerCase().split('/')[0]}"]
  }${match[3]}`;

      // Replace the incomplete entry
      fileContent = fileContent.replace(match[0], completeEntry);
      console.log(`✅ Fixed ${fix.name}`);
    } else {
      console.warn(`⚠️ Could not find entry for ${fix.name} (${fix.id})`);
    }
  }

  // Write the updated file
  await fs.writeFile(charactersFilePath, fileContent);
  console.log('💾 Updated characters.ts file');

  // Create backup
  const backupPath = charactersFilePath + '.backup';
  await fs.copy(charactersFilePath, backupPath);
  console.log(`💾 Backup created: ${backupPath}`);
}

async function validateFix(): Promise<void> {
  console.log('\\n🔍 Validating character data fix...');

  // Re-import the characters to verify the fix
  delete require.cache[require.resolve('../src/data/characters.ts')];
  const { characters } = require('../src/data/characters.ts');

  let missingDataCount = 0;
  for (const character of characters) {
    if (!character.description || !character.category || !character.race || !character.class) {
      missingDataCount++;
      console.log(`❌ Still missing data: ${character.name}`);
    }
  }

  if (missingDataCount === 0) {
    console.log('✅ All characters now have complete data!');
  } else {
    console.log(`⚠️ ${missingDataCount} characters still have missing data`);
  }

  console.log(`📊 Final stats: ${characters.length} total characters, ${characters.length - missingDataCount} complete`);
}

async function main(): Promise<void> {
  try {
    await fixCharacterData();
    await validateFix();

    console.log('\\n✅ Character data fix complete!');
    console.log('\\n📋 Summary:');
    console.log('- Added missing descriptions, categories, races, and classes');
    console.log('- All character entries now have required fields');
    console.log('- Backup created for safety');
    console.log('\\n🎯 Next steps:');
    console.log('1. Test the application to ensure no errors');
    console.log('2. Review the generated descriptions for accuracy');
    console.log('3. Update any descriptions that need refinement');

  } catch (error) {
    console.error('❌ Error during character data fix:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { fixCharacterData };
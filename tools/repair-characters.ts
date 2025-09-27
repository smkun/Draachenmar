#!/usr/bin/env tsx
/**
 * Character Data Repair Script
 * Repairs the corrupted characters.ts file and adds missing character data
 */

import fs from 'fs-extra';
import path from 'path';

async function repairCharactersFile(): Promise<void> {
  console.log('🔧 Starting character data repair...');

  const backupPath = path.join(process.cwd(), 'src', 'data', 'characters.ts.backup');
  const charactersFilePath = path.join(process.cwd(), 'src', 'data', 'characters.ts');

  // Check if backup exists and restore from it
  if (await fs.pathExists(backupPath)) {
    console.log('📋 Restoring from backup...');
    await fs.copy(backupPath, charactersFilePath);
  } else {
    console.error('❌ No backup found, cannot repair');
    return;
  }

  // Read the current file
  let fileContent = await fs.readFile(charactersFilePath, 'utf8');

  // Find where to insert the missing characters (before the last existing character)
  const insertPoint = fileContent.lastIndexOf('  },\n\n  // Legacy characters');

  if (insertPoint === -1) {
    console.error('❌ Could not find insertion point');
    return;
  }

  // Define the missing character data
  const missingCharacters = `
  // Gray Order - Council of Eldertomes
  {
    "id": "drakarn-spellbinder",
    "name": "Archmage Drakarn Spellbinder",
    "race": "Human",
    "class": "Wizard",
    "category": "npc",
    "description": "Archmage Drakarn Spellbinder is a master of arcane arts and leader within the Gray Order's Council of Eldertomes. His expertise in magical scripts and spellbinding makes him one of the most powerful wizards in the realm. Known for his vast library of ancient tomes and his ability to unravel the most complex magical mysteries, he serves as both scholar and protector of mystical knowledge.",
    "image": "Archmage Drakarn Spellbinder",
    "creator": "Campaign Setting",
    "tags": ["character", "npc", "human", "wizard"]
  },
  {
    "id": "marwen-earthshaper",
    "name": "Professor Marwen Earthshaper",
    "race": "Human",
    "class": "Wizard/Scholar",
    "category": "npc",
    "description": "Professor Marwen Earthshaper is a renowned scholar and member of the Gray Order's Council, specializing in archaeology, geology, and earth magic. His research into ancient civilizations and geological formations has uncovered many secrets of the past. His ability to shape stone and earth makes him invaluable in both academic research and practical applications of magical knowledge.",
    "image": "Professor Marwen Earthshaper",
    "creator": "Campaign Setting",
    "tags": ["character", "npc", "human", "wizard"]
  },
  {
    "id": "vaelora-wordsmith",
    "name": "Lady Vaelora Wordsmith",
    "race": "Elf",
    "class": "Bard/Scholar",
    "category": "npc",
    "description": "Lady Vaelora Wordsmith is an eloquent elven noble and master of written and spoken word. Her skills in diplomacy, linguistics, and literary arts make her an invaluable advisor and cultural ambassador. She has authored several influential treatises on inter-cultural communication and serves as a bridge between different races and nations through her gift for languages and storytelling.",
    "image": "Lady Vaelora Wordsmith",
    "creator": "Campaign Setting",
    "tags": ["character", "npc", "elf", "bard"]
  },
  {
    "id": "thalgrim-forgeheart",
    "name": "Master Thalgrim Forgeheart",
    "race": "Dwarf",
    "class": "Artificer",
    "category": "npc",
    "description": "Master Thalgrim Forgeheart is a dwarven master craftsman whose skill at the forge is legendary throughout the realm. His ability to create magical items and weapons of extraordinary quality has made him one of the most sought-after artificers. His workshop produces items that are not only functional but works of art, combining traditional dwarven craftsmanship with innovative magical techniques.",
    "image": "Master Thalgrim Forgeheart",
    "creator": "Campaign Setting",
    "tags": ["character", "npc", "dwarf", "artificer"]
  },
  {
    "id": "lirael-starwhisper",
    "name": "High Priestess Lirael Starwhisper",
    "race": "Elf",
    "class": "Cleric",
    "category": "npc",
    "description": "High Priestess Lirael Starwhisper is a devoted elven cleric who serves as a spiritual leader and divine conduit. Her connection to celestial powers and her wisdom in matters of faith make her a beacon of hope in troubled times. Known for her healing abilities and prophetic insights, she provides guidance to both common folk and nobles who seek divine intervention or spiritual counsel.",
    "image": "High Priestess Lirael Starwhisper",
    "creator": "Campaign Setting",
    "tags": ["character", "npc", "elf", "cleric"]
  },
  {
    "id": "elandra-tomekeeper",
    "name": "Scribe Elandra Tomekeeper",
    "race": "Human",
    "class": "Scholar",
    "category": "npc",
    "description": "Scribe Elandra Tomekeeper is a meticulous keeper of records and ancient knowledge within the Gray Order. Her exceptional skill in copying, preserving, and organizing magical texts has made her indispensable to the scholarly community. She possesses an encyclopedic knowledge of the locations and contents of thousands of magical documents, making her a living index of arcane knowledge.",
    "image": "Scribe Elandra Tomekeeper",
    "creator": "Campaign Setting",
    "tags": ["character", "npc", "human", "scholar"]
  },
  {
    "id": "faelan-wildshadow",
    "name": "Ranger Faelan Wildshadow",
    "race": "Half-Elf",
    "class": "Ranger",
    "category": "npc",
    "description": "Ranger Faelan Wildshadow is a skilled tracker and wilderness expert who serves as a guardian of the natural world. His half-elven heritage grants him keen senses and an intuitive understanding of both civilized and wild lands. Known for his ability to move unseen through any terrain and his expertise in hunting dangerous creatures, he serves as both guide and protector for those who venture into untamed regions.",
    "image": "Ranger Faelan Wildshadow",
    "creator": "Campaign Setting",
    "tags": ["character", "npc", "half-elf", "ranger"]
  },
  {
    "id": "elysa-truthseeker",
    "name": "Mistress Elysa Truthseeker",
    "race": "Human",
    "class": "Inquisitor/Cleric",
    "category": "npc",
    "description": "Mistress Elysa Truthseeker is a dedicated inquisitor whose mission is to uncover hidden truths and expose deception. Her divine abilities allow her to see through lies and illusions, making her a formidable investigator of corruption and heresy. Her unwavering commitment to justice and truth has made her both feared by wrongdoers and respected by those who value honesty and integrity.",
    "image": "Mistress Elysa Truthseeker",
    "creator": "Campaign Setting",
    "tags": ["character", "npc", "human", "inquisitor"]
  },`;

  // Also need to ensure existing incomplete characters have complete data
  const characterUpdates = [
    {
      id: 'tinkernock-steambeard',
      race: '"race": "Gnome",',
      class: '"class": "Noble/Artificer",',
      category: '"category": "npc",',
      description: '"description": "Admiral Tinkernock Steambeard is a distinguished gnomish naval commander and master artificer. Known for his steam-powered innovations and mechanical beard enhancements, he leads the clockwork fleets with precision and ingenuity. His expertise in both naval warfare and artifice makes him a formidable ally to those who serve the cause of order and innovation.",'
    },
    {
      id: 'duke-alaric-aerlin',
      race: '"race": "Human",',
      class: '"class": "Noble",',
      category: '"category": "npc",',
      description: '"description": "Duke Alaric of Aerlin is a respected noble who governs the duchy of Aerlin with wisdom and strength. Known for his diplomatic skills and military acumen, he maintains stability in his realm while fostering trade and cultural exchange. His court is renowned for its scholars and artisans who contribute to the intellectual growth of the kingdom.",'
    },
    {
      id: 'duke-idris-albion',
      race: '"race": "Human",',
      class: '"class": "Noble",',
      category: '"category": "npc",',
      description: '"description": "Duke Idris of Albion rules the coastal duchy of Albion, known for its maritime traditions and skilled sailors. A veteran of many naval campaigns, he combines noble bearing with practical seafaring knowledge. His duchy serves as a crucial link between the mainland kingdoms and the island territories, making him an important figure in regional politics.",'
    },
    {
      id: 'duke-cedric-merish',
      race: '"race": "Human",',
      class: '"class": "Noble",',
      category: '"category": "npc",',
      description: '"description": "Duke Cedric of Merish governs the inland duchy of Merish, famous for its fertile lands and abundant harvests. A pragmatic ruler who prioritizes the welfare of his people, he has implemented agricultural innovations that have made his duchy one of the most prosperous in the realm. His practical wisdom and fair governance have earned him the loyalty of both nobles and commoners.",'
    },
    {
      id: 'drakar-clawforge',
      race: '"race": "Dragonborn",',
      class: '"class": "Fighter/Paladin",',
      category: '"category": "npc",',
      description: '"description": "Lord Commander Drakar Clawforge is a formidable dragonborn warrior who leads elite military forces with honor and tactical brilliance. His draconic heritage grants him natural authority and fearsome presence in battle. Known for his unwavering loyalty and strategic mind, he has never lost a campaign under his command, earning respect from allies and fear from enemies.",'
    },
    {
      id: 'selene-scalewarden',
      race: '"race": "Dragonborn",',
      class: '"class": "Fighter/Strategist",',
      category: '"category": "npc",',
      description: '"description": "High Strategos Selene Scalewarden is a brilliant military strategist and dragonborn commander who oversees large-scale military operations. Her scales shimmer with an otherworldly sheen that reflects her ancient draconic bloodline. Renowned for her ability to see patterns in chaos and turn the tide of seemingly hopeless battles, she is considered one of the greatest tactical minds of her generation.",'
    },
    {
      id: 'vaelis-blackfang',
      race: '"race": "Drow",',
      class: '"class": "Rogue/Assassin",',
      category: '"category": "npc",',
      description: '"description": "Shadowmistress Vaelis Blackfang is a mysterious drow operative who moves through shadows with deadly grace. Her expertise in espionage, assassination, and shadow magic makes her both a valuable ally and a terrifying enemy. Few have seen her true face and lived to tell the tale, as she prefers to work from the darkness, manipulating events from behind the scenes.",'
    }
  ];

  // Apply updates to existing incomplete characters
  for (const update of characterUpdates) {
    // Find the character entry
    const entryPattern = new RegExp(`(\\s*{\\s*"id":\\s*"${update.id}"[^}]+)(})(,?)`, 'gm');
    const match = entryPattern.exec(fileContent);

    if (match) {
      // Check if it already has the required fields
      const entry = match[1];

      // Insert missing fields before the closing brace
      let updatedEntry = entry;

      if (!entry.includes('"race":')) {
        updatedEntry = updatedEntry.replace(/("name":\s*"[^"]+",)/, `$1\n    ${update.race}`);
      }
      if (!entry.includes('"class":')) {
        updatedEntry = updatedEntry.replace(/("race":\s*"[^"]+",)/, `$1\n    ${update.class}`);
      }
      if (!entry.includes('"category":')) {
        updatedEntry = updatedEntry.replace(/("class":\s*"[^"]+",)/, `$1\n    ${update.category}`);
      }
      if (!entry.includes('"description":')) {
        updatedEntry = updatedEntry.replace(/("category":\s*"[^"]+",)/, `$1\n    ${update.description}`);
      }

      const completeEntry = updatedEntry + match[2] + match[3];
      fileContent = fileContent.replace(match[0], completeEntry);
      console.log(`✅ Fixed ${update.id}`);
    }
  }

  // Insert the missing characters at the appropriate location
  const beforeInsertion = fileContent.substring(0, insertPoint);
  const afterInsertion = fileContent.substring(insertPoint);

  fileContent = beforeInsertion + missingCharacters + '\n\n' + afterInsertion;

  // Write the repaired file
  await fs.writeFile(charactersFilePath, fileContent);
  console.log('💾 Repaired characters.ts file');

  // Test the file by trying to import it
  try {
    delete require.cache[require.resolve('../src/data/characters.ts')];
    const { characters } = require('../src/data/characters.ts');
    console.log(`✅ File repaired successfully! ${characters.length} characters loaded.`);

    // Count complete characters
    let completeCount = 0;
    for (const character of characters) {
      if (character.description && character.category && character.race && character.class) {
        completeCount++;
      }
    }

    console.log(`📊 Character data integrity: ${completeCount}/${characters.length} (${((completeCount / characters.length) * 100).toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ File still has errors:', error.message);
  }
}

async function main(): Promise<void> {
  try {
    await repairCharactersFile();
    console.log('\n✅ Character data repair complete!');
  } catch (error) {
    console.error('❌ Error during repair:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { repairCharactersFile };
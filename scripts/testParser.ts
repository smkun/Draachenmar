#!/usr/bin/env tsx

import { DocumentParser } from './parsers/documentParser';
import path from 'path';

async function testParser() {
  console.log('🧪 Testing document parser...\n');

  const parser = new DocumentParser();
  const testDoc = '/home/skunian/code/MyCode/Draachenmar/Draachenmar/World Information/Player Added Content/Yorandis character by Paul Moore.docx';

  try {
    console.log(`📄 Testing with: ${path.basename(testDoc)}`);

    const result = await parser.parseWordDocument(testDoc);

    console.log('\n✅ Parse Results:');
    console.log(`Title: ${result.title}`);
    console.log(`Creator: ${result.metadata.creator}`);
    console.log(`Content length: ${result.content.length} characters`);

    console.log('\n📊 Extracted data:');
    console.log(`Characters: ${result.extractedData.characters.length}`);
    console.log(`Items: ${result.extractedData.items.length}`);
    console.log(`Locations: ${result.extractedData.locations.length}`);
    console.log(`Organizations: ${result.extractedData.organizations.length}`);

    if (result.extractedData.items.length > 0) {
      console.log('\n🗡️ Item details:');
      result.extractedData.items.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.name} (${item.type})`);
        console.log(`     Rarity: ${item.rarity || 'unknown'}`);
        console.log(`     Description: ${item.description.substring(0, 100)}...`);
      });
    }

    if (result.extractedData.characters.length > 0) {
      console.log('\n👥 Character details:');
      result.extractedData.characters.forEach((char, i) => {
        console.log(`  ${i + 1}. ${char.name}`);
        console.log(`     Race: ${char.race || 'unknown'}`);
        console.log(`     Class: ${char.class || 'unknown'}`);
      });
    }

    console.log('\n✨ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testParser();
}
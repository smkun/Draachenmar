#!/usr/bin/env node

const fs = require('fs');

// Test to see if we can find a specific cross-reference
const locationsContent = fs.readFileSync('/home/skunian/code/MyCode/Draachenmar/src/data/locations.ts', 'utf-8');
const charactersContent = fs.readFileSync('/home/skunian/code/MyCode/Draachenmar/src/data/characters.ts', 'utf-8');

// Extract the Gulanbarak description
const gulanbarakMatch = locationsContent.match(/"id":\s*"gulanbarak"[\s\S]*?"description":\s*"([^"]+)"/);
if (gulanbarakMatch) {
  const description = gulanbarakMatch[1];
  console.log('Gulanbarak description contains:');
  console.log(description);
  console.log('\n');

  // Check if it mentions "High King Rathgar"
  if (description.includes('High King Rathgar')) {
    console.log('✅ Found reference to "High King Rathgar"');
  } else {
    console.log('❌ No reference to "High King Rathgar" found');
  }
}

// Extract character names that contain "Rathgar"
const rathgarMatches = charactersContent.match(/"name":\s*"[^"]*Rathgar[^"]*"/g);
if (rathgarMatches) {
  console.log('\nCharacter names containing "Rathgar":');
  rathgarMatches.forEach(match => {
    const name = match.match(/"([^"]+)"/)[1];
    console.log('  -', name);
  });
}
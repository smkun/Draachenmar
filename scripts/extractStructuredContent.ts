#!/usr/bin/env tsx

import { StructuredDocumentParser } from './parsers/structuredDocumentParser';
import fs from 'fs-extra';
import path from 'path';

const DRAACHENMAR_SOURCE = '/home/skunian/code/MyCode/Draachenmar/Draachenmar';
const OUTPUT_DIR = './structured-content';

async function main() {
  console.log('🏰 Starting structured Draachenmar content extraction...\n');

  // Ensure output directory exists
  await fs.ensureDir(OUTPUT_DIR);

  const parser = new StructuredDocumentParser();

  // Priority documents to parse first
  const priorityDocs = [
    'Draachenmar 3.4.docx',
    'Draachenmar 3.4 no Images.docx',
    'People and Places of Draachenmar.docx'
  ];

  const allContent = {
    worldLore: {} as any,
    places: [] as any[],
    characters: [] as any[],
    deities: [] as any[],
    organizations: [] as any[],
    items: [] as any[],
    adventures: [] as any[],
    metadata: {
      totalDocuments: 0,
      extractedSections: [] as string[],
      imageReferences: [] as string[]
    }
  };

  // Find and parse priority documents
  for (const docName of priorityDocs) {
    const docPath = await findDocument(docName);
    if (docPath) {
      console.log(`\n📚 Processing priority document: ${docName}`);
      try {
        const structured = await parser.parseMainDocument(docPath);

        // Merge content
        if (Object.keys(structured.worldLore).length > 0) {
          allContent.worldLore = { ...allContent.worldLore, ...structured.worldLore };
        }

        allContent.places.push(...structured.places);
        allContent.characters.push(...structured.characters);
        allContent.deities.push(...structured.deities);
        allContent.organizations.push(...structured.organizations);
        allContent.items.push(...structured.items);
        allContent.adventures.push(...structured.adventures);

        allContent.metadata.totalDocuments++;
        allContent.metadata.extractedSections.push(...structured.metadata.extractedSections);
        allContent.metadata.imageReferences.push(...structured.metadata.imageReferences);

        console.log(`✅ Extracted: ${structured.places.length} places, ${structured.characters.length} characters, ${structured.deities.length} deities`);

      } catch (error) {
        console.error(`❌ Failed to parse ${docName}:`, error);
      }
    } else {
      console.warn(`⚠️  Could not find ${docName}`);
    }
  }

  // Save structured content
  await saveStructuredContent(allContent);

  // Generate summary
  const summary = {
    extractionDate: new Date().toISOString(),
    totalDocuments: allContent.metadata.totalDocuments,
    extractedContent: {
      places: allContent.places.length,
      characters: allContent.characters.length,
      deities: allContent.deities.length,
      organizations: allContent.organizations.length,
      items: allContent.items.length,
      adventures: allContent.adventures.length
    },
    extractedSections: allContent.metadata.extractedSections,
    sampleContent: {
      firstPlace: allContent.places[0]?.name || 'None',
      firstCharacter: allContent.characters[0]?.name || 'None',
      firstDeity: allContent.deities[0]?.name || 'None'
    }
  };

  await fs.writeJSON(path.join(OUTPUT_DIR, 'extraction-summary.json'), summary, { spaces: 2 });

  console.log('\n📊 Structured Extraction Summary:');
  console.log(`   📄 Documents processed: ${summary.totalDocuments}`);
  console.log(`   🏰 Places extracted: ${summary.extractedContent.places}`);
  console.log(`   👥 Characters extracted: ${summary.extractedContent.characters}`);
  console.log(`   ⚡ Deities extracted: ${summary.extractedContent.deities}`);
  console.log(`   🛡️  Organizations extracted: ${summary.extractedContent.organizations}`);
  console.log(`   ⚔️  Items extracted: ${summary.extractedContent.items}`);
  console.log(`   📜 Adventures extracted: ${summary.extractedContent.adventures}`);

  if (allContent.places.length > 0) {
    console.log('\n🏰 Sample Places:');
    allContent.places.slice(0, 3).forEach((place: any) => {
      console.log(`   • ${place.name}${place.title ? ` "${place.title}"` : ''} (${place.type})`);
      console.log(`     ${place.description.substring(0, 100)}...`);
      if (place.people?.length > 0) {
        console.log(`     People: ${place.people.map((p: any) => p.name).slice(0, 3).join(', ')}`);
      }
    });
  }

  if (allContent.deities.length > 0) {
    console.log('\n⚡ Sample Deities:');
    allContent.deities.slice(0, 3).forEach((deity: any) => {
      console.log(`   • ${deity.name} - ${deity.title}`);
      console.log(`     Domains: ${deity.domain.join(', ')}`);
    });
  }

  console.log(`\n✨ Structured content extraction complete!`);
  console.log(`📁 Check the ${OUTPUT_DIR} directory for hierarchical content.`);
}

async function findDocument(docName: string): Promise<string | null> {
  try {
    // Search in multiple locations
    const searchPaths = [
      path.join(DRAACHENMAR_SOURCE, 'World Information'),
      path.join(DRAACHENMAR_SOURCE, 'World Information/0-STUFF TO ADD TO DOCUMENT/0-OLD/1.0'),
      DRAACHENMAR_SOURCE
    ];

    for (const searchPath of searchPaths) {
      const fullPath = path.join(searchPath, docName);
      if (await fs.pathExists(fullPath)) {
        return fullPath;
      }

      // Also try without spaces in filename
      const noSpaceName = docName.replace(/\s+/g, '');
      const noSpacePath = path.join(searchPath, noSpaceName);
      if (await fs.pathExists(noSpacePath)) {
        return noSpacePath;
      }
    }

    // Recursive search as fallback
    const { glob } = await import('glob');
    const pattern = `**/*${docName.replace(/\s+/g, '*')}*`;
    const matches = await glob(pattern, {
      cwd: DRAACHENMAR_SOURCE,
      absolute: true,
      ignore: ['**/node_modules/**']
    });

    return matches[0] || null;

  } catch (error) {
    console.error(`Error finding ${docName}:`, error);
    return null;
  }
}

async function saveStructuredContent(content: any) {
  // Save each content type separately
  await fs.writeJSON(path.join(OUTPUT_DIR, 'world-lore.json'), content.worldLore, { spaces: 2 });
  await fs.writeJSON(path.join(OUTPUT_DIR, 'places.json'), content.places, { spaces: 2 });
  await fs.writeJSON(path.join(OUTPUT_DIR, 'characters.json'), content.characters, { spaces: 2 });
  await fs.writeJSON(path.join(OUTPUT_DIR, 'deities.json'), content.deities, { spaces: 2 });
  await fs.writeJSON(path.join(OUTPUT_DIR, 'organizations.json'), content.organizations, { spaces: 2 });
  await fs.writeJSON(path.join(OUTPUT_DIR, 'items.json'), content.items, { spaces: 2 });
  await fs.writeJSON(path.join(OUTPUT_DIR, 'adventures.json'), content.adventures, { spaces: 2 });

  // Save combined content
  await fs.writeJSON(path.join(OUTPUT_DIR, 'complete-content.json'), content, { spaces: 2 });

  console.log(`💾 Saved structured content to ${OUTPUT_DIR}/`);
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Structured extraction failed:', error);
    process.exit(1);
  });
}
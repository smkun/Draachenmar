#!/usr/bin/env tsx

import { DocumentParser } from './parsers/documentParser';
import { ImageManager } from './utils/imageManager';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

const DRAACHENMAR_SOURCE = '/home/skunian/code/MyCode/Draachenmar/Draachenmar';
const OUTPUT_DIR = './extracted-content';

async function main() {
  console.log('🚀 Starting Draachenmar content extraction...\n');

  // Ensure output directory exists
  await fs.ensureDir(OUTPUT_DIR);

  // Initialize parsers
  const documentParser = new DocumentParser();
  const imageManager = new ImageManager(DRAACHENMAR_SOURCE);

  console.log('📸 Processing images...');
  await imageManager.generateImageRegistry();

  console.log('\n📄 Finding and processing documents...');
  await processDocuments(documentParser);

  console.log('\n✨ Content extraction complete!');
  console.log(`📁 Check the ${OUTPUT_DIR} directory for extracted content.`);
}

async function processDocuments(parser: DocumentParser) {
  // Find all Word documents
  const docPatterns = [
    '**/*.docx',
    '**/*.doc'
  ];

  const allDocs: string[] = [];
  for (const pattern of docPatterns) {
    const matches = await glob(pattern, {
      cwd: DRAACHENMAR_SOURCE,
      absolute: true,
      ignore: ['**/~$*'] // Ignore temp files
    });
    allDocs.push(...matches);
  }

  console.log(`Found ${allDocs.length} documents to process...`);

  const extractedContent = {
    characters: [] as any[],
    items: [] as any[],
    locations: [] as any[],
    organizations: [] as any[],
    adventures: [] as any[],
    processedDocuments: [] as any[]
  };

  for (const docPath of allDocs) {
    try {
      console.log(`📄 Processing: ${path.basename(docPath)}`);

      const parsed = await parser.parseWordDocument(docPath);

      // Add to respective categories
      extractedContent.characters.push(...parsed.extractedData.characters.map(char => ({
        ...char,
        id: generateId(char.name),
        category: 'characters' as const,
        source: {
          document: parsed.metadata.fileName,
          creator: parsed.metadata.creator
        }
      })));

      extractedContent.items.push(...parsed.extractedData.items.map(item => ({
        ...item,
        id: generateId(item.name),
        category: 'items' as const,
        source: {
          document: parsed.metadata.fileName,
          creator: parsed.metadata.creator
        }
      })));

      extractedContent.locations.push(...parsed.extractedData.locations.map(loc => ({
        ...loc,
        id: generateId(loc.name),
        category: 'locations' as const,
        source: {
          document: parsed.metadata.fileName,
          creator: parsed.metadata.creator
        }
      })));

      extractedContent.organizations.push(...parsed.extractedData.organizations.map(org => ({
        ...org,
        id: generateId(org.name),
        category: 'organizations' as const,
        source: {
          document: parsed.metadata.fileName,
          creator: parsed.metadata.creator
        }
      })));

      // Save individual document data
      extractedContent.processedDocuments.push({
        id: generateId(parsed.title),
        title: parsed.title,
        content: parsed.content,
        htmlContent: parsed.htmlContent,
        metadata: parsed.metadata,
        extractedCount: {
          characters: parsed.extractedData.characters.length,
          items: parsed.extractedData.items.length,
          locations: parsed.extractedData.locations.length,
          organizations: parsed.extractedData.organizations.length
        }
      });

      console.log(`   ✓ Extracted: ${parsed.extractedData.characters.length} characters, ${parsed.extractedData.items.length} items, ${parsed.extractedData.locations.length} locations, ${parsed.extractedData.organizations.length} organizations`);

    } catch (error) {
      console.error(`   ✗ Failed to process ${path.basename(docPath)}:`, error);
    }
  }

  // Save all extracted content
  await fs.writeJSON(path.join(OUTPUT_DIR, 'characters.json'), extractedContent.characters, { spaces: 2 });
  await fs.writeJSON(path.join(OUTPUT_DIR, 'items.json'), extractedContent.items, { spaces: 2 });
  await fs.writeJSON(path.join(OUTPUT_DIR, 'locations.json'), extractedContent.locations, { spaces: 2 });
  await fs.writeJSON(path.join(OUTPUT_DIR, 'organizations.json'), extractedContent.organizations, { spaces: 2 });
  await fs.writeJSON(path.join(OUTPUT_DIR, 'documents.json'), extractedContent.processedDocuments, { spaces: 2 });

  // Generate summary
  const summary = {
    extractionDate: new Date().toISOString(),
    processedDocuments: allDocs.length,
    totalExtracted: {
      characters: extractedContent.characters.length,
      items: extractedContent.items.length,
      locations: extractedContent.locations.length,
      organizations: extractedContent.organizations.length
    },
    sources: extractedContent.processedDocuments.map(doc => ({
      title: doc.title,
      file: doc.metadata.fileName,
      creator: doc.metadata.creator,
      extractedCount: doc.extractedCount
    }))
  };

  await fs.writeJSON(path.join(OUTPUT_DIR, 'extraction-summary.json'), summary, { spaces: 2 });

  console.log('\n📊 Extraction Summary:');
  console.log(`   📄 Documents processed: ${summary.processedDocuments}`);
  console.log(`   👥 Characters extracted: ${summary.totalExtracted.characters}`);
  console.log(`   ⚔️  Items extracted: ${summary.totalExtracted.items}`);
  console.log(`   🏰 Locations extracted: ${summary.totalExtracted.locations}`);
  console.log(`   🛡️  Organizations extracted: ${summary.totalExtracted.organizations}`);
}

function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Extraction failed:', error);
    process.exit(1);
  });
}
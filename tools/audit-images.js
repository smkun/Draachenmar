#!/usr/bin/env node

/**
 * Image Link Audit Tool for Draachenmar Encyclopedia
 *
 * Validates:
 * 1. Registry images exist on filesystem
 * 2. Data file image references match registry
 * 3. Missing image properties in data files
 */

const fs = require('fs-extra');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

class ImageAuditor {
  constructor() {
    this.registryPath = path.join(projectRoot, 'public/images/image-registry.json');
    this.publicImagesDir = path.join(projectRoot, 'public/images');
    this.srcDataDir = path.join(projectRoot, 'src/data');

    this.errors = [];
    this.warnings = [];
    this.stats = {
      registryImages: 0,
      filesystemImages: 0,
      dataReferences: 0,
      missingFiles: 0,
      missingProperties: 0,
      orphanedFiles: 0
    };
  }

  async audit() {
    console.log('🔍 Starting Draachenmar Encyclopedia Image Audit\\n');

    try {
      // Load image registry
      const registry = await this.loadImageRegistry();

      // Audit registry vs filesystem
      await this.auditRegistryVsFilesystem(registry);

      // Audit data file references
      await this.auditDataFileReferences(registry);

      // Find orphaned files
      await this.findOrphanedFiles(registry);

      // Generate report
      this.generateReport();

    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      process.exit(1);
    }
  }

  async loadImageRegistry() {
    if (!await fs.pathExists(this.registryPath)) {
      throw new Error(`Image registry not found at ${this.registryPath}`);
    }

    const registry = await fs.readJSON(this.registryPath);

    // Count total images in registry
    this.stats.registryImages = Object.values(registry.images)
      .reduce((total, images) => total + images.length, 0);

    console.log(`📋 Loaded registry with ${this.stats.registryImages} images`);
    console.log(`📅 Registry generated: ${registry.generated}\\n`);

    return registry;
  }

  async auditRegistryVsFilesystem(registry) {
    console.log('🔍 Auditing registry vs filesystem...');

    for (const [category, images] of Object.entries(registry.images)) {
      for (const image of images) {
        const relativePath = image.webPath.replace('/Draachenmar/', '');
        const fullPath = path.join(projectRoot, 'public', relativePath);

        if (!await fs.pathExists(fullPath)) {
          this.errors.push({
            type: 'missing_file',
            category,
            file: image.fileName,
            path: fullPath,
            webPath: image.webPath
          });
          this.stats.missingFiles++;
        }
      }
    }

    console.log(`   ✓ Checked ${this.stats.registryImages} registry entries`);
  }

  async auditDataFileReferences(registry) {
    console.log('\\n🔍 Auditing data file image references...');

    // Build registry lookup
    const registryLookup = new Map();
    for (const [category, images] of Object.entries(registry.images)) {
      for (const image of images) {
        const fileName = image.fileName.replace(/\\.webp$/, '.png'); // Handle format differences
        registryLookup.set(fileName, image);
        registryLookup.set(image.fileName, image);
      }
    }

    // Check characters
    await this.auditDataFile('characters.ts', registryLookup, 'characters');
    await this.auditDataFile('locations.ts', registryLookup, 'locations');
    await this.auditDataFile('items.ts', registryLookup, 'items');
    await this.auditDataFile('deities.ts', registryLookup, 'deities');
  }

  async auditDataFile(fileName, registryLookup, category) {
    const filePath = path.join(this.srcDataDir, fileName);

    if (!await fs.pathExists(filePath)) {
      this.warnings.push({
        type: 'missing_data_file',
        file: fileName
      });
      return;
    }

    const content = await fs.readFile(filePath, 'utf8');

    // Count entries with image properties (handle JSON format: "image": "value")
    const imageMatches = content.match(/"image":\s*"([^"]+)"/g) || [];
    this.stats.dataReferences += imageMatches.length;

    // Extract image references and validate them
    for (const match of imageMatches) {
      const imageFile = match.match(/"image":\s*"([^"]+)"/)[1];
      const baseFileName = path.basename(imageFile);

      // Try multiple filename variations that might be in registry
      const possibleNames = [
        baseFileName,
        `${baseFileName}.webp`,
        `${baseFileName}.png`,
        baseFileName.replace(/\s+/g, '_').toLowerCase() + '.webp',
        baseFileName.replace(/\s+/g, ' ').replace(/[^a-zA-Z0-9\s]/g, '').trim() + '.webp'
      ];

      let found = false;
      for (const name of possibleNames) {
        if (registryLookup.has(name)) {
          found = true;
          break;
        }
      }

      if (!found) {
        this.errors.push({
          type: 'missing_registry_entry',
          category,
          file: fileName,
          imageReference: imageFile,
          baseFileName,
          possibleNames
        });
      }
    }

    // Count entries without image properties (approximate)
    const entryPattern = /"id":\s*"[^"]+"/g;
    const totalEntries = (content.match(entryPattern) || []).length;
    const entriesWithoutImages = Math.max(0, totalEntries - imageMatches.length);

    if (entriesWithoutImages > 0) {
      this.stats.missingProperties += entriesWithoutImages;
      this.warnings.push({
        type: 'missing_image_properties',
        file: fileName,
        category,
        count: entriesWithoutImages,
        totalEntries
      });
    }

    console.log(`   ✓ ${fileName}: ${imageMatches.length} image refs, ~${entriesWithoutImages} missing`);
  }

  async findOrphanedFiles(registry) {
    console.log('\\n🔍 Finding orphaned image files...');

    const registryFiles = new Set();
    for (const images of Object.values(registry.images)) {
      for (const image of images) {
        registryFiles.add(image.fileName);
      }
    }

    // Scan filesystem for images not in registry
    const categories = await fs.readdir(this.publicImagesDir);

    for (const category of categories) {
      const categoryPath = path.join(this.publicImagesDir, category);
      const stat = await fs.stat(categoryPath);

      if (stat.isDirectory()) {
        const files = await fs.readdir(categoryPath);

        for (const file of files) {
          if (file.match(/\\.(png|jpg|jpeg|webp|gif)$/i) && !registryFiles.has(file)) {
            this.warnings.push({
              type: 'orphaned_file',
              category,
              file,
              path: path.join(categoryPath, file)
            });
            this.stats.orphanedFiles++;
          }
        }
      }
    }

    console.log(`   ✓ Found ${this.stats.orphanedFiles} orphaned files`);
  }

  generateReport() {
    console.log('\\n' + '='.repeat(60));
    console.log('📊 IMAGE AUDIT REPORT');
    console.log('='.repeat(60));

    // Statistics
    console.log('\\n📈 STATISTICS:');
    console.log(`   Registry images: ${this.stats.registryImages}`);
    console.log(`   Data references: ${this.stats.dataReferences}`);
    console.log(`   Missing files: ${this.stats.missingFiles}`);
    console.log(`   Missing properties: ${this.stats.missingProperties}`);
    console.log(`   Orphaned files: ${this.stats.orphanedFiles}`);

    // Errors
    if (this.errors.length > 0) {
      console.log('\\n❌ CRITICAL ERRORS:');
      for (const error of this.errors) {
        switch (error.type) {
          case 'missing_file':
            console.log(`   🔴 Missing file: ${error.file} (${error.category})`);
            console.log(`      Expected: ${error.path}`);
            break;
          case 'missing_registry_entry':
            console.log(`   🔴 Missing registry entry: ${error.baseFileName}`);
            console.log(`      Referenced in: ${error.file}`);
            console.log(`      Tried: ${error.possibleNames?.join(', ')}`);
            break;
        }
      }
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log('\\n⚠️  WARNINGS:');
      for (const warning of this.warnings) {
        switch (warning.type) {
          case 'missing_image_properties':
            console.log(`   🟡 ${warning.file}: ~${warning.count}/${warning.totalEntries} entries missing image property`);
            break;
          case 'orphaned_file':
            console.log(`   🟡 Orphaned file: ${warning.category}/${warning.file}`);
            break;
        }
      }
    }

    // Summary
    console.log('\\n' + '='.repeat(60));
    if (this.errors.length === 0) {
      console.log('✅ NO CRITICAL ERRORS FOUND!');
    } else {
      console.log(`❌ ${this.errors.length} CRITICAL ERRORS FOUND`);
    }

    if (this.warnings.length === 0) {
      console.log('✅ NO WARNINGS');
    } else {
      console.log(`⚠️  ${this.warnings.length} WARNINGS`);
    }

    console.log('\\n🎯 RECOMMENDATIONS:');

    if (this.stats.missingFiles > 0) {
      console.log('   • Run image optimization script to regenerate missing files');
    }

    if (this.stats.missingProperties > 0) {
      console.log('   • Add image properties to entries lacking visual representation');
      console.log('   • Use the image registry to find available images for characters/locations');
    }

    if (this.stats.orphanedFiles > 0) {
      console.log('   • Review orphaned files - they may be unused or need registry updates');
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('   • Image system is in excellent condition! 🎉');
    }

    console.log('\\n📋 Report complete.');
  }
}

// Run audit
const auditor = new ImageAuditor();
auditor.audit().catch(console.error);
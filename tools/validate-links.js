#!/usr/bin/env node

/**
 * Link Validation Tool for Draachenmar Encyclopedia
 *
 * Validates all internal cross-references between:
 * - Characters referencing locations, organizations, other characters
 * - Locations referencing characters, organizations
 * - Organizations referencing characters, locations
 * - Items referencing characters, locations
 */

const fs = require('fs');
const path = require('path');

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const CHARACTERS_FILE = path.join(DATA_DIR, 'characters.ts');
const LOCATIONS_FILE = path.join(DATA_DIR, 'locations.ts');
const ITEMS_FILE = path.join(DATA_DIR, 'items.ts');
const DEITIES_FILE = path.join(DATA_DIR, 'deities.ts');
const ORGANIZATIONS_FILE = path.join(DATA_DIR, 'organizations.ts');

class LinkValidator {
  constructor() {
    this.characters = new Map();
    this.locations = new Map();
    this.items = new Map();
    this.deities = new Map();
    this.organizations = new Map();

    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalReferences: 0,
      validReferences: 0,
      brokenReferences: 0,
      checkedFiles: 0
    };
  }

  // Extract entity names from TypeScript data files
  extractEntityNames(filePath, entityType) {
    if (!fs.existsSync(filePath)) {
      this.errors.push(`❌ Data file not found: ${filePath}`);
      return new Map();
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const entities = new Map();

    try {
      // Match entity objects with id and name properties (JSON-style quotes)
      const idMatches = content.match(/"id":\s*"([^"]+)"/g) || [];
      const nameMatches = content.match(/"name":\s*"([^"]+)"/g) || [];

      // Extract IDs and names
      const ids = idMatches.map(match => match.match(/"([^"]+)"/g)[1].replace(/"/g, ''));
      const names = nameMatches.map(match => match.match(/"([^"]+)"/g)[1].replace(/"/g, ''));

      // Store both ID and name as valid identifiers
      ids.forEach(id => entities.set(id, { type: entityType, identifier: id }));
      names.forEach(name => entities.set(name, { type: entityType, identifier: name }));

      console.log(`📂 Loaded ${ids.length} ${entityType} entities from ${path.basename(filePath)}`);

    } catch (error) {
      this.errors.push(`❌ Error parsing ${filePath}: ${error.message}`);
    }

    this.stats.checkedFiles++;
    return entities;
  }

  // Find cross-references in content fields
  findCrossReferences(content, sourceEntity, sourceType) {
    const references = [];

    // Look for narrative references to character names in descriptions
    // Extract description content (handle multiline descriptions with escaped quotes)
    const descriptionMatch = content.match(/"description":\s*"((?:[^"\\]|\\.)*)"/);
    if (!descriptionMatch) return references;

    const description = descriptionMatch[1];

    // Check for character name mentions in description
    this.characters.forEach((charData, charName) => {
      // Check for exact name matches (handling quotes and special characters)
      const namePatterns = [
        new RegExp(`\\b${this.escapeRegex(charName)}\\b`, 'gi'),
        // Handle nicknames with quotes like 'Stoneforge'
        new RegExp(`\\b${this.escapeRegex(charName.replace(/['"]/g, ''))}\\b`, 'gi')
      ];

      namePatterns.forEach(pattern => {
        if (pattern.test(description) && charName !== sourceEntity) {
          references.push({
            reference: charName,
            sourceEntity,
            sourceType,
            context: `Description mentions: ${charName}`
          });
        }
      });
    });

    // Check for location name mentions
    this.locations.forEach((locData, locName) => {
      const pattern = new RegExp(`\\b${this.escapeRegex(locName)}\\b`, 'gi');
      if (pattern.test(description) && locName !== sourceEntity) {
        references.push({
          reference: locName,
          sourceEntity,
          sourceType,
          context: `Description mentions: ${locName}`
        });
      }
    });

    // Check for organization name mentions
    this.organizations.forEach((orgData, orgName) => {
      const pattern = new RegExp(`\\b${this.escapeRegex(orgName)}\\b`, 'gi');
      if (pattern.test(description) && orgName !== sourceEntity) {
        references.push({
          reference: orgName,
          sourceEntity,
          sourceType,
          context: `Description mentions: ${orgName}`
        });
      }
    });

    return references;
  }

  // Helper function to escape special regex characters
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Load all data and build entity maps
  loadAllData() {
    console.log('🔄 Loading entity data from TypeScript files...\n');

    this.characters = this.extractEntityNames(CHARACTERS_FILE, 'character');
    this.locations = this.extractEntityNames(LOCATIONS_FILE, 'location');
    this.items = this.extractEntityNames(ITEMS_FILE, 'item');
    this.deities = this.extractEntityNames(DEITIES_FILE, 'deity');
    this.organizations = this.extractEntityNames(ORGANIZATIONS_FILE, 'organization');

    console.log(`\n📊 Entity Summary:`);
    console.log(`   Characters: ${this.characters.size}`);
    console.log(`   Locations: ${this.locations.size}`);
    console.log(`   Items: ${this.items.size}`);
    console.log(`   Deities: ${this.deities.size}`);
    console.log(`   Organizations: ${this.organizations.size}`);
    console.log(`   Total entities: ${this.characters.size + this.locations.size + this.items.size + this.deities.size + this.organizations.size}\n`);
  }

  // Validate a single reference
  validateReference(reference) {
    // Check all entity types for the reference
    if (this.characters.has(reference)) return { valid: true, type: 'character' };
    if (this.locations.has(reference)) return { valid: true, type: 'location' };
    if (this.items.has(reference)) return { valid: true, type: 'item' };
    if (this.deities.has(reference)) return { valid: true, type: 'deity' };
    if (this.organizations.has(reference)) return { valid: true, type: 'organization' };

    return { valid: false, type: 'unknown' };
  }

  // Validate cross-references in a data file
  validateFileReferences(filePath, entityType) {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);

    console.log(`🔍 Checking cross-references in ${fileName}...`);

    // Extract entity names for context
    const entityNames = [];
    const nameMatches = content.match(/name:\s*['"`]([^'"`]+)['"`]/g) || [];
    nameMatches.forEach(match => {
      const name = match.match(/['"`]([^'"`]+)['"`]/)[1];
      entityNames.push(name);
    });

    // Find all cross-references in the file
    entityNames.forEach(entityName => {
      const references = this.findCrossReferences(content, entityName, entityType);

      references.forEach(ref => {
        this.stats.totalReferences++;
        const validation = this.validateReference(ref.reference);

        if (validation.valid) {
          this.stats.validReferences++;
        } else {
          this.stats.brokenReferences++;
          this.errors.push({
            type: 'broken_reference',
            source: `${ref.sourceType}: ${ref.sourceEntity}`,
            reference: ref.reference,
            context: ref.context,
            file: fileName
          });
        }
      });
    });
  }

  // Run complete validation
  async validate() {
    console.log('🔗 Draachenmar Encyclopedia Link Validation\n');

    // Load all entity data
    this.loadAllData();

    // Validate references in each data file
    console.log('🔍 Validating cross-references...\n');

    this.validateFileReferences(CHARACTERS_FILE, 'character');
    this.validateFileReferences(LOCATIONS_FILE, 'location');
    this.validateFileReferences(ITEMS_FILE, 'item');
    this.validateFileReferences(DEITIES_FILE, 'deity');
    this.validateFileReferences(ORGANIZATIONS_FILE, 'organization');

    // Generate report
    this.generateReport();
  }

  // Generate validation report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 LINK VALIDATION REPORT');
    console.log('='.repeat(60));

    // Summary statistics
    console.log('\n📊 Summary:');
    console.log(`   Files checked: ${this.stats.checkedFiles}`);
    console.log(`   Total references found: ${this.stats.totalReferences}`);
    console.log(`   Valid references: ${this.stats.validReferences}`);
    console.log(`   Broken references: ${this.stats.brokenReferences}`);

    if (this.stats.totalReferences > 0) {
      const successRate = ((this.stats.validReferences / this.stats.totalReferences) * 100).toFixed(1);
      console.log(`   Success rate: ${successRate}%`);
    }

    // Report broken references
    if (this.errors.length > 0) {
      console.log('\n❌ Broken References Found:');
      this.errors.forEach(error => {
        if (error.type === 'broken_reference') {
          console.log(`   • ${error.source}`);
          console.log(`     References: "${error.reference}" (not found)`);
          console.log(`     Context: ${error.context}`);
          console.log(`     File: ${error.file}\n`);
        }
      });
    }

    // Report file errors
    const fileErrors = this.errors.filter(error => typeof error === 'string');
    if (fileErrors.length > 0) {
      console.log('\n❌ File Access Errors:');
      fileErrors.forEach(error => console.log(`   ${error}`));
    }

    // Final status
    console.log('\n' + '='.repeat(60));
    if (this.stats.brokenReferences === 0 && fileErrors.length === 0) {
      console.log('✅ ALL INTERNAL LINKS VALIDATED SUCCESSFULLY');
      console.log('✅ No broken cross-references found');
    } else {
      console.log('⚠️  VALIDATION COMPLETED WITH ISSUES');
      console.log(`⚠️  Found ${this.stats.brokenReferences} broken references`);
      if (fileErrors.length > 0) {
        console.log(`⚠️  Found ${fileErrors.length} file access errors`);
      }
    }
    console.log('='.repeat(60));

    // Performance assessment
    if (this.stats.totalReferences > 0) {
      const score = Math.round((this.stats.validReferences / this.stats.totalReferences) * 100);
      console.log(`\n🎯 Link Integrity Score: ${score}/100`);

      if (score >= 95) {
        console.log('🟢 Excellent - Nearly all internal links are working');
      } else if (score >= 80) {
        console.log('🟡 Good - Most internal links are working, minor cleanup needed');
      } else if (score >= 60) {
        console.log('🟠 Fair - Significant link maintenance required');
      } else {
        console.log('🔴 Poor - Major link validation issues need immediate attention');
      }
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new LinkValidator();
  validator.validate().catch(console.error);
}

module.exports = LinkValidator;
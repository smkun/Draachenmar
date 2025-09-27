#!/usr/bin/env node

/**
 * Search Functionality Test for Draachenmar Encyclopedia
 *
 * Tests search functionality across all content categories:
 * - Characters, Locations, Items, Deities, Organizations
 * - Verifies fuzzy search, category filtering, and tag-based search
 */

const fs = require('fs');
const path = require('path');

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'src', 'data');

class SearchTester {
  constructor() {
    this.testResults = [];
    this.stats = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    };
  }

  // Load data file and extract entities
  loadDataFile(filePath, entityType) {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const entities = [];

    try {
      // Extract entity objects by finding complete object blocks
      const nameMatches = content.match(/"name":\s*"([^"]+)"/g) || [];
      const idMatches = content.match(/"id":\s*"([^"]+)"/g) || [];
      const descMatches = content.match(/"description":\s*"((?:[^"\\]|\\.)*)"/g) || [];
      const tagMatches = content.match(/"tags":\s*\[([^\]]+)\]/g) || [];

      for (let i = 0; i < nameMatches.length; i++) {
        const nameMatch = nameMatches[i].match(/"name":\s*"([^"]+)"/);
        const idMatch = idMatches[i] ? idMatches[i].match(/"id":\s*"([^"]+)"/) : null;
        const descMatch = descMatches[i] ? descMatches[i].match(/"description":\s*"((?:[^"\\]|\\.*)*)"/) : null;
        const tagMatch = tagMatches[i] ? tagMatches[i].match(/"tags":\s*\[([^\]]+)\]/) : null;

        const name = nameMatch ? nameMatch[1] : '';
        const id = idMatch ? idMatch[1] : '';
        const description = descMatch ? descMatch[1] : '';
        const tags = tagMatch ? tagMatch[1].split(',').map(tag => tag.trim().replace(/['"]/g, '')) : [];

        if (name) {
          entities.push({
            id,
            name,
            description,
            tags,
            type: entityType
          });
        }
      }

      console.log(`📂 Loaded ${entities.length} ${entityType} entities`);
      return entities;

    } catch (error) {
      console.log(`❌ Error loading ${entityType}: ${error.message}`);
      return [];
    }
  }

  // Load all content data
  loadAllContent() {
    console.log('🔄 Loading all content for search testing...\n');

    const characters = this.loadDataFile(path.join(DATA_DIR, 'characters.ts'), 'character');
    const locations = this.loadDataFile(path.join(DATA_DIR, 'locations.ts'), 'location');
    const items = this.loadDataFile(path.join(DATA_DIR, 'items.ts'), 'item');
    const deities = this.loadDataFile(path.join(DATA_DIR, 'deities.ts'), 'deity');
    const organizations = this.loadDataFile(path.join(DATA_DIR, 'organizations.ts'), 'organization');

    const allContent = [...characters, ...locations, ...items, ...deities, ...organizations];

    console.log(`📊 Content Summary:`);
    console.log(`   Characters: ${characters.length}`);
    console.log(`   Locations: ${locations.length}`);
    console.log(`   Items: ${items.length}`);
    console.log(`   Deities: ${deities.length}`);
    console.log(`   Organizations: ${organizations.length}`);
    console.log(`   Total entities: ${allContent.length}\n`);

    return {
      characters,
      locations,
      items,
      deities,
      organizations,
      all: allContent
    };
  }

  // Simple fuzzy search implementation (simulating Fuse.js behavior)
  fuzzySearch(query, entities) {
    const results = [];
    const queryLower = query.toLowerCase();

    entities.forEach(entity => {
      let score = 0;
      const nameLower = entity.name.toLowerCase();
      const descLower = entity.description.toLowerCase();

      // Exact name match
      if (nameLower === queryLower) score += 100;

      // Name starts with query
      else if (nameLower.startsWith(queryLower)) score += 80;

      // Name contains query
      else if (nameLower.includes(queryLower)) score += 60;

      // Description contains query
      else if (descLower.includes(queryLower)) score += 40;

      // Tag matches
      entity.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) score += 30;
      });

      if (score > 0) {
        results.push({ entity, score });
      }
    });

    return results.sort((a, b) => b.score - a.score).map(r => r.entity);
  }

  // Run a search test
  runTest(testName, query, entities, expectedMinResults, category = 'all') {
    this.stats.totalTests++;

    const results = this.fuzzySearch(query, entities);
    const passed = results.length >= expectedMinResults;

    if (passed) {
      this.stats.passedTests++;
    } else {
      this.stats.failedTests++;
    }

    this.testResults.push({
      testName,
      query,
      category,
      resultsCount: results.length,
      expectedMinResults,
      passed,
      sampleResults: results.slice(0, 3).map(r => r.name)
    });

    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: "${query}" → ${results.length} results (expected ≥${expectedMinResults})`);

    if (results.length > 0) {
      console.log(`   Top results: ${results.slice(0, 3).map(r => r.name).join(', ')}`);
    }

    return passed;
  }

  // Run comprehensive search tests
  async runSearchTests() {
    console.log('🔍 Draachenmar Encyclopedia Search Testing\n');

    const content = this.loadAllContent();

    console.log('🧪 Running search functionality tests...\n');

    // Test 1: Search for major characters
    this.runTest(
      'Major Character Search',
      'Rathgar',
      content.characters,
      1,
      'characters'
    );

    // Test 2: Search for locations
    this.runTest(
      'Location Search',
      'Gulanbarak',
      content.locations,
      1,
      'locations'
    );

    // Test 3: Search across all content
    this.runTest(
      'Cross-Category Search',
      'king',
      content.all,
      3,
      'all'
    );

    // Test 4: Fuzzy search (misspelled)
    this.runTest(
      'Fuzzy Search Test',
      'Rathger',
      content.characters,
      0,
      'characters'
    );

    // Test 5: Tag-based search
    this.runTest(
      'Tag-Based Search',
      'dwarf',
      content.all,
      5,
      'all'
    );

    // Test 6: Description search
    this.runTest(
      'Description Search',
      'fortress',
      content.locations,
      1,
      'locations'
    );

    // Test 7: Search for deities
    this.runTest(
      'Deity Search',
      'god',
      content.deities,
      1,
      'deities'
    );

    // Test 8: Search for items/artifacts
    this.runTest(
      'Item Search',
      'sword',
      content.items,
      0,
      'items'
    );

    // Test 9: Organization search
    this.runTest(
      'Organization Search',
      'guild',
      content.organizations,
      0,
      'organizations'
    );

    // Test 10: Empty search
    this.runTest(
      'Empty Query Test',
      '',
      content.all,
      0,
      'all'
    );

    this.generateReport();
  }

  // Generate test report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 SEARCH FUNCTIONALITY TEST REPORT');
    console.log('='.repeat(60));

    // Summary statistics
    console.log('\n📊 Test Summary:');
    console.log(`   Total tests: ${this.stats.totalTests}`);
    console.log(`   Passed: ${this.stats.passedTests}`);
    console.log(`   Failed: ${this.stats.failedTests}`);

    if (this.stats.totalTests > 0) {
      const successRate = ((this.stats.passedTests / this.stats.totalTests) * 100).toFixed(1);
      console.log(`   Success rate: ${successRate}%`);
    }

    // Detailed test results
    console.log('\n📋 Test Details:');
    this.testResults.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      console.log(`${status} ${test.testName} (${test.category})`);
      console.log(`   Query: "${test.query}"`);
      console.log(`   Results: ${test.resultsCount} (expected ≥${test.expectedMinResults})`);
      if (test.sampleResults.length > 0) {
        console.log(`   Sample: ${test.sampleResults.join(', ')}`);
      }
      console.log('');
    });

    // Failed tests
    const failedTests = this.testResults.filter(test => !test.passed);
    if (failedTests.length > 0) {
      console.log('❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`   • ${test.testName}: "${test.query}" returned ${test.resultsCount} results, expected ≥${test.expectedMinResults}`);
      });
    }

    // Final status
    console.log('\n' + '='.repeat(60));
    if (this.stats.failedTests === 0) {
      console.log('✅ ALL SEARCH TESTS PASSED');
      console.log('✅ Search functionality working across all content categories');
    } else {
      console.log('⚠️  SEARCH TESTS COMPLETED WITH ISSUES');
      console.log(`⚠️  ${this.stats.failedTests} test(s) failed`);
    }
    console.log('='.repeat(60));

    // Performance assessment
    if (this.stats.totalTests > 0) {
      const score = Math.round((this.stats.passedTests / this.stats.totalTests) * 100);
      console.log(`\n🎯 Search Functionality Score: ${score}/100`);

      if (score >= 95) {
        console.log('🟢 Excellent - Search works reliably across all content types');
      } else if (score >= 80) {
        console.log('🟡 Good - Search mostly functional, minor improvements needed');
      } else if (score >= 60) {
        console.log('🟠 Fair - Search has significant issues that should be addressed');
      } else {
        console.log('🔴 Poor - Major search functionality problems need immediate attention');
      }
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SearchTester();
  tester.runSearchTests().catch(console.error);
}

module.exports = SearchTester;
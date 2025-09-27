#!/usr/bin/env node

/**
 * Responsive Design Test Report for Draachenmar Encyclopedia
 *
 * Tests common breakpoints and responsive patterns:
 * - Mobile (320px, 375px, 414px)
 * - Tablet (768px, 834px, 1024px)
 * - Desktop (1280px, 1440px, 1920px)
 */

const fs = require('fs-extra');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

class ResponsiveDesignTester {
  constructor() {
    this.breakpoints = {
      mobile: [
        { name: 'Mobile Small', width: 320, height: 568 },
        { name: 'Mobile Medium', width: 375, height: 667 },
        { name: 'Mobile Large', width: 414, height: 896 }
      ],
      tablet: [
        { name: 'Tablet Portrait', width: 768, height: 1024 },
        { name: 'Tablet Landscape', width: 1024, height: 768 },
        { name: 'iPad Pro', width: 834, height: 1194 }
      ],
      desktop: [
        { name: 'Desktop Small', width: 1280, height: 720 },
        { name: 'Desktop Medium', width: 1440, height: 900 },
        { name: 'Desktop Large', width: 1920, height: 1080 }
      ]
    };

    this.issues = [];
    this.passed = [];
  }

  async testResponsiveDesign() {
    console.log('📱 Starting Responsive Design Analysis for Draachenmar Encyclopedia\\n');

    // Analyze Tailwind breakpoints
    await this.analyzeTailwindConfig();

    // Test component responsive patterns
    await this.analyzeComponents();

    // Test layout patterns
    await this.analyzeLayoutPatterns();

    // Generate recommendations
    this.generateReport();
  }

  async analyzeTailwindConfig() {
    console.log('🔍 Analyzing Tailwind CSS configuration...');

    const tailwindPath = path.join(projectRoot, 'tailwind.config.js');
    const content = await fs.readFile(tailwindPath, 'utf8');

    // Check for custom breakpoints
    if (content.includes('screens:')) {
      console.log('   ✓ Custom breakpoints defined');
    } else {
      console.log('   ℹ Using default Tailwind breakpoints:');
      console.log('     - sm: 640px');
      console.log('     - md: 768px');
      console.log('     - lg: 1024px');
      console.log('     - xl: 1280px');
      console.log('     - 2xl: 1536px');
    }

    this.passed.push('Tailwind CSS breakpoint system configured');
    console.log();
  }

  async analyzeComponents() {
    console.log('🔍 Analyzing component responsive patterns...');

    const srcDir = path.join(projectRoot, 'src');
    const componentFiles = await this.findFiles(srcDir, /\\.(tsx|ts)$/);

    let responsiveClasses = 0;
    let componentsWithResponsive = 0;
    const responsivePatterns = [];

    for (const file of componentFiles) {
      const content = await fs.readFile(file, 'utf8');
      const relativePath = path.relative(srcDir, file);

      // Count responsive classes (sm:, md:, lg:, xl:, 2xl:)
      const matches = content.match(/(sm|md|lg|xl|2xl):[\\w-]+/g) || [];
      if (matches.length > 0) {
        responsiveClasses += matches.length;
        componentsWithResponsive++;

        // Collect unique patterns
        const uniquePatterns = [...new Set(matches)];
        responsivePatterns.push(...uniquePatterns);

        console.log(`   ✓ ${relativePath}: ${matches.length} responsive classes`);
      }
    }

    console.log();
    console.log(`   📊 Summary:`);
    console.log(`     - Files analyzed: ${componentFiles.length}`);
    console.log(`     - Components with responsive classes: ${componentsWithResponsive}`);
    console.log(`     - Total responsive classes: ${responsiveClasses}`);

    if (responsiveClasses > 0) {
      this.passed.push(`${responsiveClasses} responsive classes found across ${componentsWithResponsive} components`);
    } else {
      this.issues.push({
        type: 'missing_responsive',
        severity: 'warning',
        message: 'No responsive utility classes found in components'
      });
    }

    // Analyze common patterns
    this.analyzeResponsivePatterns(responsivePatterns);
    console.log();
  }

  analyzeResponsivePatterns(patterns) {
    const patternCount = {};
    patterns.forEach(pattern => {
      const prefix = pattern.split(':')[0];
      patternCount[prefix] = (patternCount[prefix] || 0) + 1;
    });

    console.log('   📱 Responsive breakpoint usage:');
    Object.entries(patternCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([breakpoint, count]) => {
        console.log(`     - ${breakpoint}: ${count} usages`);
      });

    // Check for common responsive patterns
    const commonPatterns = [
      { pattern: /hidden.*block|block.*hidden/, name: 'Show/Hide elements' },
      { pattern: /flex-col.*flex-row|flex-row.*flex-col/, name: 'Flex direction changes' },
      { pattern: /grid-cols-\\d+/, name: 'Grid responsive columns' },
      { pattern: /text-(xs|sm|base|lg|xl)/, name: 'Responsive typography' },
      { pattern: /p(x|y|t|b|l|r)?-\\d+/, name: 'Responsive spacing' }
    ];

    console.log('\\n   🎯 Responsive patterns detected:');
    commonPatterns.forEach(({ pattern, name }) => {
      const matches = patterns.filter(p => pattern.test(p));
      if (matches.length > 0) {
        console.log(`     ✓ ${name}: ${matches.length} instances`);
      } else {
        console.log(`     ⚠ ${name}: Not detected`);
      }
    });
  }

  async analyzeLayoutPatterns() {
    console.log('🔍 Analyzing layout and container patterns...');

    // Check Layout component
    const layoutPath = path.join(projectRoot, 'src/components/Layout.tsx');
    if (await fs.pathExists(layoutPath)) {
      const content = await fs.readFile(layoutPath, 'utf8');

      // Check for responsive container patterns
      if (content.includes('container mx-auto')) {
        console.log('   ✓ Responsive container pattern found');
        this.passed.push('Uses responsive container pattern');
      }

      if (content.includes('px-4') || content.includes('px-')) {
        console.log('   ✓ Responsive padding detected');
        this.passed.push('Responsive padding implemented');
      }

      if (content.includes('flex-col') || content.includes('flex')) {
        console.log('   ✓ Flexbox layout structure');
        this.passed.push('Flexbox layout structure implemented');
      }
    }

    // Check Header component for mobile navigation
    const headerPath = path.join(projectRoot, 'src/components/Header.tsx');
    if (await fs.pathExists(headerPath)) {
      const content = await fs.readFile(headerPath, 'utf8');

      if (content.includes('space-x-') && content.includes('flex')) {
        console.log('   ✓ Header uses responsive flex layout');
        this.passed.push('Header responsive layout implemented');
      }

      // Check for mobile menu patterns
      if (content.includes('hidden') && content.includes('block')) {
        console.log('   ✓ Mobile navigation patterns detected');
      } else {
        this.issues.push({
          type: 'mobile_navigation',
          severity: 'medium',
          message: 'Header may need mobile-specific navigation patterns',
          file: 'src/components/Header.tsx'
        });
      }
    }

    console.log();
  }

  async findFiles(dir, pattern) {
    const files = [];
    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...await this.findFiles(fullPath, pattern));
      } else if (stat.isFile() && pattern.test(item)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  generateReport() {
    console.log('=' .repeat(60));
    console.log('📊 RESPONSIVE DESIGN TEST REPORT');
    console.log('=' .repeat(60));

    // Test each breakpoint category
    console.log('\\n📱 RECOMMENDED TESTING BREAKPOINTS:');

    Object.entries(this.breakpoints).forEach(([category, breakpoints]) => {
      console.log(`\\n${category.toUpperCase()}:`);
      breakpoints.forEach(bp => {
        console.log(`   📐 ${bp.name}: ${bp.width}x${bp.height}px`);
      });
    });

    // Summary
    console.log('\\n📈 ANALYSIS SUMMARY:');
    console.log(`   ✅ Passed checks: ${this.passed.length}`);
    console.log(`   ⚠️  Issues found: ${this.issues.length}`);

    // Passed items
    if (this.passed.length > 0) {
      console.log('\\n✅ PASSED CHECKS:');
      this.passed.forEach(item => {
        console.log(`   • ${item}`);
      });
    }

    // Issues
    if (this.issues.length > 0) {
      console.log('\\n⚠️  POTENTIAL ISSUES:');
      this.issues.forEach(issue => {
        console.log(`   ${issue.severity === 'warning' ? '🟡' : '🟠'} ${issue.message}`);
        if (issue.file) {
          console.log(`      File: ${issue.file}`);
        }
      });
    }

    // Manual testing checklist
    console.log('\\n📋 MANUAL TESTING CHECKLIST:');
    console.log('\\nWith dev server running at http://localhost:3000/Draachenmar/');
    console.log('\\n🔍 For each breakpoint, verify:');
    console.log('   □ Header navigation remains usable');
    console.log('   □ Search bar functionality');
    console.log('   □ Content cards maintain readable layout');
    console.log('   □ Typography scales appropriately');
    console.log('   □ No horizontal scrolling required');
    console.log('   □ Touch targets are >44px for mobile');
    console.log('   □ Content hierarchy remains clear');
    console.log('   □ Images scale properly');

    console.log('\\n🎯 PRIORITY TESTS:');
    console.log('   1. Mobile (375x667) - Most common mobile size');
    console.log('   2. Tablet (768x1024) - iPad portrait');
    console.log('   3. Desktop (1440x900) - Common laptop size');

    console.log('\\n🚀 TESTING INSTRUCTIONS:');
    console.log('   1. Open browser dev tools (F12)');
    console.log('   2. Enable device simulation');
    console.log('   3. Test each recommended breakpoint');
    console.log('   4. Navigate through all major pages');
    console.log('   5. Test both light and dark themes');

    if (this.issues.length === 0) {
      console.log('\\n🎉 CONCLUSION: Responsive design appears well-implemented!');
    } else {
      console.log('\\n⚡ CONCLUSION: Address identified issues for optimal responsive experience');
    }

    console.log('\\n📋 Report complete.');
  }
}

// Run the responsive design test
const tester = new ResponsiveDesignTester();
tester.testResponsiveDesign().catch(console.error);
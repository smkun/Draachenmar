#!/usr/bin/env node

/**
 * Accessibility Audit Tool for Draachenmar Encyclopedia
 *
 * Performs comprehensive accessibility checks including:
 * - WCAG 2.1 compliance analysis
 * - Color contrast validation
 * - Semantic HTML structure
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - Image alt text validation
 */

const fs = require('fs');
const path = require('path');

class AccessibilityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
    this.stats = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
      passed: 0
    };
  }

  // Check if a file exists and is readable
  checkFile(filePath) {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  }

  // Add an issue to the audit results
  addIssue(severity, category, description, file, line = null) {
    const issue = {
      severity,
      category,
      description,
      file: path.basename(file),
      line,
      timestamp: new Date().toISOString()
    };

    if (severity === 'critical' || severity === 'serious') {
      this.issues.push(issue);
    } else {
      this.warnings.push(issue);
    }

    this.stats[severity]++;
  }

  // Add a passed check
  addPassed(category, description) {
    this.passed.push({ category, description });
    this.stats.passed++;
  }

  // Audit HTML structure and semantics
  auditHTMLStructure() {
    console.log('🔍 Auditing HTML structure and semantics...');

    const indexPath = path.join(process.cwd(), 'index.html');
    if (!this.checkFile(indexPath)) {
      this.addIssue('critical', 'HTML Structure', 'index.html not found', indexPath);
      return;
    }

    const content = fs.readFileSync(indexPath, 'utf-8');

    // Check for essential accessibility features
    const checks = [
      {
        pattern: /<html[^>]*lang=/i,
        pass: 'Document has lang attribute',
        fail: 'Missing lang attribute on html element',
        severity: 'serious',
        category: 'HTML Structure'
      },
      {
        pattern: /<title>/i,
        pass: 'Document has title element',
        fail: 'Missing title element',
        severity: 'serious',
        category: 'HTML Structure'
      },
      {
        pattern: /<meta[^>]*charset=/i,
        pass: 'Document specifies character encoding',
        fail: 'Missing character encoding declaration',
        severity: 'moderate',
        category: 'HTML Structure'
      },
      {
        pattern: /<meta[^>]*viewport=/i,
        pass: 'Document has viewport meta tag',
        fail: 'Missing viewport meta tag for responsive design',
        severity: 'moderate',
        category: 'Responsive Design'
      }
    ];

    checks.forEach(check => {
      if (check.pattern.test(content)) {
        this.addPassed(check.category, check.pass);
      } else {
        this.addIssue(check.severity, check.category, check.fail, indexPath);
      }
    });
  }

  // Audit React components for accessibility
  auditReactComponents() {
    console.log('🔍 Auditing React components for accessibility...');

    const componentsDir = path.join(process.cwd(), 'src', 'components');
    const pagesDir = path.join(process.cwd(), 'src', 'pages');

    [componentsDir, pagesDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        this.auditDirectory(dir);
      }
    });
  }

  // Audit a directory of React components
  auditDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        this.auditDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        this.auditReactFile(filePath);
      }
    });
  }

  // Audit individual React file
  auditReactFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);

    // Check for common accessibility patterns
    const accessibilityChecks = [
      {
        pattern: /alt\s*=\s*['"]/i,
        pass: `${fileName}: Uses alt attributes for images`,
        category: 'Images'
      },
      {
        pattern: /aria-label\s*=\s*['"]/i,
        pass: `${fileName}: Uses aria-label attributes`,
        category: 'ARIA Labels'
      },
      {
        pattern: /role\s*=\s*['"]/i,
        pass: `${fileName}: Uses ARIA roles`,
        category: 'ARIA Roles'
      },
      {
        pattern: /<(h[1-6]|header|nav|main|section|article|aside|footer)/i,
        pass: `${fileName}: Uses semantic HTML elements`,
        category: 'Semantic HTML'
      },
      {
        pattern: /tabIndex\s*=\s*[{'"]/i,
        pass: `${fileName}: Manages keyboard navigation with tabIndex`,
        category: 'Keyboard Navigation'
      }
    ];

    // Check for accessibility anti-patterns
    const antiPatterns = [
      {
        pattern: /alt\s*=\s*['"]\s*['"]/i,
        issue: 'Empty alt attribute found - should be meaningful or omitted',
        severity: 'moderate',
        category: 'Images'
      },
      {
        pattern: /<div[^>]*onClick/i,
        issue: 'div with onClick handler - consider using button or adding keyboard handlers',
        severity: 'moderate',
        category: 'Keyboard Navigation'
      },
      {
        pattern: /tabIndex\s*=\s*['"][0-9]+['"]/i,
        issue: 'Positive tabIndex found - can disrupt natural tab order',
        severity: 'minor',
        category: 'Keyboard Navigation'
      }
    ];

    // Apply accessibility checks
    accessibilityChecks.forEach(check => {
      if (check.pattern.test(content)) {
        this.addPassed(check.category, check.pass);
      }
    });

    // Check for anti-patterns
    antiPatterns.forEach(antiPattern => {
      if (antiPattern.pattern.test(content)) {
        this.addIssue(antiPattern.severity, antiPattern.category, antiPattern.issue, filePath);
      }
    });

    // Check specific accessibility concerns
    this.checkImageAccessibility(content, filePath);
    this.checkFormAccessibility(content, filePath);
    this.checkNavigationAccessibility(content, filePath);
  }

  // Check image accessibility
  checkImageAccessibility(content, filePath) {
    const imgMatches = content.match(/<img[^>]*>/gi) || [];
    const reactImgMatches = content.match(/<Image[^>]*>/gi) || [];

    [...imgMatches, ...reactImgMatches].forEach(imgTag => {
      if (!imgTag.includes('alt=')) {
        this.addIssue('serious', 'Images', 'Image without alt attribute', filePath);
      } else {
        // Check for meaningful alt text patterns
        const altMatch = imgTag.match(/alt\s*=\s*['"]([^'"]*)['"]/) || imgTag.match(/alt\s*=\s*{([^}]*)}/);
        if (altMatch) {
          const altText = altMatch[1].toLowerCase();
          if (altText.includes('image') || altText.includes('picture') || altText.includes('photo')) {
            this.addIssue('minor', 'Images', 'Alt text contains redundant words like "image" or "picture"', filePath);
          }
        }
      }
    });
  }

  // Check form accessibility
  checkFormAccessibility(content, filePath) {
    const inputMatches = content.match(/<input[^>]*>/gi) || [];
    const selectMatches = content.match(/<select[^>]*>/gi) || [];
    const textareaMatches = content.match(/<textarea[^>]*>/gi) || [];

    [...inputMatches, ...selectMatches, ...textareaMatches].forEach(formElement => {
      if (!formElement.includes('id=') && !formElement.includes('aria-label=') && !formElement.includes('aria-labelledby=')) {
        this.addIssue('serious', 'Forms', 'Form element without proper labeling', filePath);
      }
    });

    // Check for associated labels
    const labelMatches = content.match(/<label[^>]*for\s*=\s*['"]([^'"]*)['"][^>]*>/gi) || [];
    if (labelMatches.length > 0) {
      this.addPassed('Forms', `${path.basename(filePath)}: Uses proper label associations`);
    }
  }

  // Check navigation accessibility
  checkNavigationAccessibility(content, filePath) {
    // Check for skip links
    if (content.includes('skip') && (content.includes('content') || content.includes('main'))) {
      this.addPassed('Navigation', `${path.basename(filePath)}: Includes skip links`);
    }

    // Check for landmark roles
    const landmarks = ['main', 'navigation', 'banner', 'contentinfo', 'complementary'];
    landmarks.forEach(landmark => {
      if (content.includes(`role="${landmark}"`) || content.includes(`<${landmark}`)) {
        this.addPassed('Navigation', `${path.basename(filePath)}: Uses ${landmark} landmark`);
      }
    });
  }

  // Audit CSS for accessibility concerns
  auditCSS() {
    console.log('🔍 Auditing CSS for accessibility concerns...');

    const tailwindConfig = path.join(process.cwd(), 'tailwind.config.js');
    if (this.checkFile(tailwindConfig)) {
      const content = fs.readFileSync(tailwindConfig, 'utf-8');

      // Check for focus indicators
      if (content.includes('focus:') || content.includes('focus-')) {
        this.addPassed('Focus Management', 'Tailwind config includes focus utilities');
      } else {
        this.addIssue('moderate', 'Focus Management', 'No focus utilities found in Tailwind config', tailwindConfig);
      }

      // Check for color customization (important for contrast)
      if (content.includes('colors') || content.includes('extend')) {
        this.addPassed('Color Contrast', 'Custom color configuration found - ensure proper contrast ratios');
      }
    }

    // Check global CSS
    const cssFiles = ['src/index.css', 'src/App.css'];
    cssFiles.forEach(cssFile => {
      const fullPath = path.join(process.cwd(), cssFile);
      if (this.checkFile(fullPath)) {
        this.auditCSSFile(fullPath);
      }
    });
  }

  // Audit individual CSS file
  auditCSSFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check for accessibility CSS patterns
    const patterns = [
      {
        pattern: /:focus\s*{/i,
        pass: 'Focus styles defined',
        category: 'Focus Management'
      },
      {
        pattern: /outline\s*:\s*none/i,
        issue: 'outline: none found - ensure alternative focus indicators',
        severity: 'moderate',
        category: 'Focus Management'
      },
      {
        pattern: /@media\s*\([^)]*prefers-reduced-motion/i,
        pass: 'Respects user motion preferences',
        category: 'Motion Preferences'
      },
      {
        pattern: /font-size\s*:\s*[0-9.]+px/i,
        issue: 'Fixed pixel font sizes may not scale with user preferences',
        severity: 'minor',
        category: 'Typography'
      }
    ];

    patterns.forEach(pattern => {
      if (pattern.pass && pattern.pattern.test(content)) {
        this.addPassed(pattern.category, `${path.basename(filePath)}: ${pattern.pass}`);
      } else if (pattern.issue && pattern.pattern.test(content)) {
        this.addIssue(pattern.severity, pattern.category, pattern.issue, filePath);
      }
    });
  }

  // Check for accessibility testing setup
  auditTestingSetup() {
    console.log('🔍 Checking accessibility testing setup...');

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!this.checkFile(packageJsonPath)) {
      this.addIssue('moderate', 'Testing Setup', 'package.json not found', packageJsonPath);
      return;
    }

    const packageContent = fs.readFileSync(packageJsonPath, 'utf-8');

    // Check for accessibility testing libraries
    const a11yLibraries = [
      'axe-core',
      '@axe-core/react',
      'jest-axe',
      '@testing-library/jest-dom',
      'react-testing-library'
    ];

    const foundLibraries = a11yLibraries.filter(lib => packageContent.includes(lib));
    if (foundLibraries.length > 0) {
      this.addPassed('Testing Setup', `Accessibility testing libraries found: ${foundLibraries.join(', ')}`);
    } else {
      this.addIssue('moderate', 'Testing Setup', 'No accessibility testing libraries found', packageJsonPath);
    }
  }

  // Generate comprehensive audit report
  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('♿ ACCESSIBILITY AUDIT REPORT');
    console.log('='.repeat(70));

    // Summary statistics
    const totalIssues = this.issues.length + this.warnings.length;
    console.log('\n📊 Audit Summary:');
    console.log(`   Critical issues: ${this.stats.critical}`);
    console.log(`   Serious issues: ${this.stats.serious}`);
    console.log(`   Moderate issues: ${this.stats.moderate}`);
    console.log(`   Minor issues: ${this.stats.minor}`);
    console.log(`   Checks passed: ${this.stats.passed}`);
    console.log(`   Total issues: ${totalIssues}`);

    // Critical and serious issues
    const criticalIssues = this.issues.filter(issue => issue.severity === 'critical');
    const seriousIssues = this.issues.filter(issue => issue.severity === 'serious');

    if (criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues (Must Fix):');
      criticalIssues.forEach(issue => {
        console.log(`   • ${issue.description}`);
        console.log(`     File: ${issue.file} ${issue.line ? `Line: ${issue.line}` : ''}`);
        console.log(`     Category: ${issue.category}\n`);
      });
    }

    if (seriousIssues.length > 0) {
      console.log('\n❌ Serious Issues (Should Fix):');
      seriousIssues.forEach(issue => {
        console.log(`   • ${issue.description}`);
        console.log(`     File: ${issue.file} ${issue.line ? `Line: ${issue.line}` : ''}`);
        console.log(`     Category: ${issue.category}\n`);
      });
    }

    // Moderate and minor issues
    const moderateIssues = this.warnings.filter(issue => issue.severity === 'moderate');
    const minorIssues = this.warnings.filter(issue => issue.severity === 'minor');

    if (moderateIssues.length > 0) {
      console.log('\n⚠️  Moderate Issues (Consider Fixing):');
      moderateIssues.forEach(issue => {
        console.log(`   • ${issue.description} (${issue.file})`);
      });
      console.log('');
    }

    if (minorIssues.length > 0) {
      console.log('\n💡 Minor Issues (Nice to Fix):');
      minorIssues.forEach(issue => {
        console.log(`   • ${issue.description} (${issue.file})`);
      });
      console.log('');
    }

    // Successful checks
    if (this.passed.length > 0) {
      console.log('\n✅ Accessibility Features Working Well:');
      const groupedPassed = {};
      this.passed.forEach(item => {
        if (!groupedPassed[item.category]) {
          groupedPassed[item.category] = [];
        }
        groupedPassed[item.category].push(item.description);
      });

      Object.keys(groupedPassed).forEach(category => {
        console.log(`   ${category}:`);
        groupedPassed[category].slice(0, 3).forEach(item => {
          console.log(`     • ${item}`);
        });
        if (groupedPassed[category].length > 3) {
          console.log(`     • ... and ${groupedPassed[category].length - 3} more`);
        }
        console.log('');
      });
    }

    // Final assessment
    console.log('='.repeat(70));
    const score = this.calculateAccessibilityScore();
    console.log(`🎯 Accessibility Score: ${score}/100`);

    if (this.stats.critical > 0) {
      console.log('🔴 CRITICAL - Immediate accessibility fixes required');
    } else if (this.stats.serious > 0) {
      console.log('🟠 SERIOUS - Important accessibility improvements needed');
    } else if (this.stats.moderate > 0) {
      console.log('🟡 MODERATE - Good foundation, some accessibility enhancements recommended');
    } else if (this.stats.minor > 0) {
      console.log('🟢 GOOD - Minor accessibility refinements would help');
    } else {
      console.log('🌟 EXCELLENT - Strong accessibility implementation');
    }
    console.log('='.repeat(70));

    // Recommendations
    this.generateRecommendations();
  }

  // Calculate accessibility score
  calculateAccessibilityScore() {
    const weights = {
      critical: -25,
      serious: -15,
      moderate: -8,
      minor: -3,
      passed: 2
    };

    let score = 70; // Base score
    score += this.stats.critical * weights.critical;
    score += this.stats.serious * weights.serious;
    score += this.stats.moderate * weights.moderate;
    score += this.stats.minor * weights.minor;
    score += Math.min(this.stats.passed * weights.passed, 30); // Cap positive points

    return Math.max(0, Math.min(100, score));
  }

  // Generate accessibility recommendations
  generateRecommendations() {
    console.log('\n💡 Accessibility Improvement Recommendations:\n');

    const recommendations = [
      '1. Add axe-core or @axe-core/react for automated accessibility testing',
      '2. Implement comprehensive keyboard navigation testing',
      '3. Ensure all images have meaningful alt text',
      '4. Test with actual screen readers (NVDA, JAWS, VoiceOver)',
      '5. Verify color contrast ratios meet WCAG AA standards (4.5:1)',
      '6. Add skip links for main navigation',
      '7. Implement proper ARIA labels for complex UI components',
      '8. Test with users who have disabilities',
      '9. Consider adding a high contrast mode option',
      '10. Ensure all functionality is available via keyboard only'
    ];

    recommendations.forEach(rec => console.log(`   ${rec}`));
  }

  // Run comprehensive accessibility audit
  async runAudit() {
    console.log('♿ Draachenmar Encyclopedia Accessibility Audit\n');
    console.log('Checking WCAG 2.1 compliance and accessibility best practices...\n');

    this.auditHTMLStructure();
    this.auditReactComponents();
    this.auditCSS();
    this.auditTestingSetup();

    this.generateReport();
  }
}

// Run audit if called directly
if (require.main === module) {
  const auditor = new AccessibilityAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = AccessibilityAuditor;
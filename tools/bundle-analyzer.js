#!/usr/bin/env node

/**
 * Bundle Size Analyzer for Draachenmar Encyclopedia
 *
 * Analyzes and monitors:
 * - JavaScript bundle sizes (main, vendor, chunks)
 * - CSS bundle sizes
 * - Static asset sizes (images, fonts, etc.)
 * - Gzip compression ratios
 * - Performance recommendations
 */

const fs = require('fs');
const path = require('path');

class BundleAnalyzer {
  constructor() {
    this.distPath = path.join(process.cwd(), 'dist');
    this.publicPath = path.join(process.cwd(), 'public');
    this.results = {
      javascript: { files: [], totalSize: 0, gzipSize: 0 },
      css: { files: [], totalSize: 0, gzipSize: 0 },
      images: { files: [], totalSize: 0 },
      fonts: { files: [], totalSize: 0 },
      other: { files: [], totalSize: 0 },
      total: { size: 0, files: 0 }
    };
    this.recommendations = [];
  }

  // Get file size in bytes
  getFileSize(filePath) {
    try {
      return fs.statSync(filePath).size;
    } catch (error) {
      return 0;
    }
  }

  // Estimate gzip size (roughly 30-40% of original for text files)
  estimateGzipSize(size, fileType) {
    if (fileType === 'js' || fileType === 'css') {
      return Math.round(size * 0.35); // Approximate gzip ratio
    }
    return size; // Images and other assets don't compress much with gzip
  }

  // Format file size for display
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Scan a directory for files
  scanDirectory(dirPath, fileType, extensions = []) {
    if (!fs.existsSync(dirPath)) {
      return { files: [], totalSize: 0 };
    }

    const files = [];
    let totalSize = 0;

    const scanRecursive = (currentPath) => {
      const items = fs.readdirSync(currentPath);

      items.forEach(item => {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanRecursive(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();

          if (extensions.length === 0 || extensions.includes(ext)) {
            const size = stat.size;
            const relativePath = path.relative(dirPath, fullPath);

            files.push({
              name: item,
              path: relativePath,
              size: size,
              formattedSize: this.formatSize(size),
              gzipSize: this.estimateGzipSize(size, fileType)
            });

            totalSize += size;
          }
        }
      });
    };

    scanRecursive(dirPath);

    // Sort by size (largest first)
    files.sort((a, b) => b.size - a.size);

    return { files, totalSize };
  }

  // Analyze JavaScript bundles
  analyzeJavaScript() {
    console.log('📦 Analyzing JavaScript bundles...');

    const jsResult = this.scanDirectory(this.distPath, 'js', ['.js', '.mjs']);
    this.results.javascript = {
      ...jsResult,
      gzipSize: jsResult.files.reduce((sum, file) => sum + file.gzipSize, 0)
    };

    // Analyze bundle composition
    const mainBundle = jsResult.files.find(f => f.name.includes('index') || f.name.includes('main'));
    const vendorBundle = jsResult.files.find(f => f.name.includes('vendor') || f.name.includes('chunk'));

    if (mainBundle && mainBundle.size > 500 * 1024) { // 500KB
      this.recommendations.push({
        type: 'js',
        priority: 'high',
        message: `Main bundle is large (${mainBundle.formattedSize}). Consider code splitting.`
      });
    }

    if (jsResult.totalSize > 1024 * 1024) { // 1MB
      this.recommendations.push({
        type: 'js',
        priority: 'medium',
        message: `Total JS size is ${this.formatSize(jsResult.totalSize)}. Consider lazy loading and tree shaking.`
      });
    }
  }

  // Analyze CSS bundles
  analyzeCSS() {
    console.log('🎨 Analyzing CSS bundles...');

    const cssResult = this.scanDirectory(this.distPath, 'css', ['.css']);
    this.results.css = {
      ...cssResult,
      gzipSize: cssResult.files.reduce((sum, file) => sum + file.gzipSize, 0)
    };

    if (cssResult.totalSize > 100 * 1024) { // 100KB
      this.recommendations.push({
        type: 'css',
        priority: 'medium',
        message: `CSS bundle is ${this.formatSize(cssResult.totalSize)}. Consider purging unused styles.`
      });
    }
  }

  // Analyze static assets
  analyzeAssets() {
    console.log('🖼️  Analyzing static assets...');

    // Images
    const imageResult = this.scanDirectory(this.publicPath, 'img', ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg']);
    this.results.images = imageResult;

    // Fonts
    const fontResult = this.scanDirectory(this.publicPath, 'font', ['.woff', '.woff2', '.ttf', '.eot']);
    this.results.fonts = fontResult;

    // Other assets
    const otherResult = this.scanDirectory(this.publicPath, 'other', ['.json', '.xml', '.txt', '.ico']);
    this.results.other = otherResult;

    // Image recommendations
    const largeImages = imageResult.files.filter(f => f.size > 500 * 1024); // 500KB
    if (largeImages.length > 0) {
      this.recommendations.push({
        type: 'images',
        priority: 'medium',
        message: `${largeImages.length} images are >500KB. Consider further compression.`,
        details: largeImages.slice(0, 5).map(img => `${img.name} (${img.formattedSize})`)
      });
    }

    if (imageResult.totalSize > 50 * 1024 * 1024) { // 50MB
      this.recommendations.push({
        type: 'images',
        priority: 'high',
        message: `Total image size is ${this.formatSize(imageResult.totalSize)}. Consider lazy loading and CDN.`
      });
    }
  }

  // Calculate total bundle size
  calculateTotals() {
    const totalSize =
      this.results.javascript.totalSize +
      this.results.css.totalSize +
      this.results.images.totalSize +
      this.results.fonts.totalSize +
      this.results.other.totalSize;

    const totalFiles =
      this.results.javascript.files.length +
      this.results.css.files.length +
      this.results.images.files.length +
      this.results.fonts.files.length +
      this.results.other.files.length;

    this.results.total = { size: totalSize, files: totalFiles };
  }

  // Generate performance score
  calculatePerformanceScore() {
    let score = 100;

    // Deduct points for large bundles
    if (this.results.javascript.totalSize > 1024 * 1024) score -= 20; // 1MB JS
    else if (this.results.javascript.totalSize > 512 * 1024) score -= 10; // 512KB JS

    if (this.results.css.totalSize > 150 * 1024) score -= 10; // 150KB CSS

    if (this.results.images.totalSize > 100 * 1024 * 1024) score -= 30; // 100MB images
    else if (this.results.images.totalSize > 50 * 1024 * 1024) score -= 20; // 50MB images
    else if (this.results.images.totalSize > 20 * 1024 * 1024) score -= 10; // 20MB images

    if (this.results.total.files > 1000) score -= 10; // Too many files

    return Math.max(0, score);
  }

  // Generate detailed report
  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 BUNDLE SIZE ANALYSIS REPORT');
    console.log('='.repeat(70));

    // Summary
    const score = this.calculatePerformanceScore();
    console.log(`\n🎯 Performance Score: ${score}/100`);
    console.log(`📁 Total Files: ${this.results.total.files}`);
    console.log(`📦 Total Size: ${this.formatSize(this.results.total.size)}`);

    // Breakdown by type
    console.log('\n📋 Bundle Breakdown:');

    if (this.results.javascript.files.length > 0) {
      console.log(`\n  📜 JavaScript:`);
      console.log(`     Files: ${this.results.javascript.files.length}`);
      console.log(`     Size: ${this.formatSize(this.results.javascript.totalSize)}`);
      console.log(`     Gzipped: ${this.formatSize(this.results.javascript.gzipSize)}`);

      if (this.results.javascript.files.length > 0) {
        console.log(`     Largest: ${this.results.javascript.files[0].name} (${this.results.javascript.files[0].formattedSize})`);
      }
    }

    if (this.results.css.files.length > 0) {
      console.log(`\n  🎨 CSS:`);
      console.log(`     Files: ${this.results.css.files.length}`);
      console.log(`     Size: ${this.formatSize(this.results.css.totalSize)}`);
      console.log(`     Gzipped: ${this.formatSize(this.results.css.gzipSize)}`);
    }

    if (this.results.images.files.length > 0) {
      console.log(`\n  🖼️  Images:`);
      console.log(`     Files: ${this.results.images.files.length}`);
      console.log(`     Size: ${this.formatSize(this.results.images.totalSize)}`);

      const webpFiles = this.results.images.files.filter(f => f.name.endsWith('.webp'));
      console.log(`     WebP: ${webpFiles.length}/${this.results.images.files.length} files`);

      if (this.results.images.files.length > 0) {
        console.log(`     Largest: ${this.results.images.files[0].name} (${this.results.images.files[0].formattedSize})`);
      }
    }

    if (this.results.fonts.files.length > 0) {
      console.log(`\n  🔤 Fonts:`);
      console.log(`     Files: ${this.results.fonts.files.length}`);
      console.log(`     Size: ${this.formatSize(this.results.fonts.totalSize)}`);
    }

    if (this.results.other.files.length > 0) {
      console.log(`\n  📄 Other Assets:`);
      console.log(`     Files: ${this.results.other.files.length}`);
      console.log(`     Size: ${this.formatSize(this.results.other.totalSize)}`);
    }

    // Recommendations
    if (this.recommendations.length > 0) {
      console.log('\n💡 Optimization Recommendations:');

      const highPriority = this.recommendations.filter(r => r.priority === 'high');
      const mediumPriority = this.recommendations.filter(r => r.priority === 'medium');

      if (highPriority.length > 0) {
        console.log('\n  🔴 High Priority:');
        highPriority.forEach(rec => {
          console.log(`     • ${rec.message}`);
          if (rec.details) {
            rec.details.forEach(detail => console.log(`       - ${detail}`));
          }
        });
      }

      if (mediumPriority.length > 0) {
        console.log('\n  🟡 Medium Priority:');
        mediumPriority.forEach(rec => {
          console.log(`     • ${rec.message}`);
          if (rec.details) {
            rec.details.forEach(detail => console.log(`       - ${detail}`));
          }
        });
      }
    }

    // Performance assessment
    console.log('\n' + '='.repeat(70));
    if (score >= 90) {
      console.log('🟢 EXCELLENT - Bundle size is well optimized');
    } else if (score >= 75) {
      console.log('🟡 GOOD - Bundle size is acceptable, minor optimizations possible');
    } else if (score >= 60) {
      console.log('🟠 FAIR - Bundle size needs optimization');
    } else {
      console.log('🔴 POOR - Bundle size requires immediate optimization');
    }
    console.log('='.repeat(70));

    // Next steps
    console.log('\n📋 Monitoring Setup:');
    console.log('   1. Run this analyzer after each build');
    console.log('   2. Set up CI/CD bundle size alerts');
    console.log('   3. Track bundle size trends over time');
    console.log('   4. Consider webpack-bundle-analyzer for detailed JS analysis');
    console.log('   5. Monitor real-world loading performance');
  }

  // Save results to JSON for tracking
  saveResults() {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      score: this.calculatePerformanceScore(),
      results: this.results,
      recommendations: this.recommendations
    };

    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const reportFile = path.join(reportsDir, `bundle-analysis-${timestamp.split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log(`\n💾 Report saved to: ${reportFile}`);
  }

  // Run complete analysis
  async analyze() {
    console.log('📦 Draachenmar Encyclopedia Bundle Analysis\n');

    this.analyzeJavaScript();
    this.analyzeCSS();
    this.analyzeAssets();
    this.calculateTotals();

    this.generateReport();
    this.saveResults();
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = BundleAnalyzer;
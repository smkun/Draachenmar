#!/usr/bin/env node

/**
 * Image Performance Analysis Tool for Draachenmar Encyclopedia
 *
 * Analyzes:
 * 1. Image file sizes and optimization
 * 2. Loading patterns and lazy loading
 * 3. Format distribution (WebP vs fallbacks)
 * 4. Bundle impact assessment
 */

const fs = require('fs-extra');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

class ImagePerformanceAnalyzer {
  constructor() {
    this.registryPath = path.join(projectRoot, 'public/images/image-registry.json');
    this.publicImagesDir = path.join(projectRoot, 'public/images');

    this.stats = {
      totalImages: 0,
      totalSize: 0,
      avgSize: 0,
      largestImage: null,
      smallestImage: null,
      formatDistribution: {},
      categorySizes: {},
      optimizationScore: 0
    };

    this.issues = [];
    this.recommendations = [];
  }

  async analyzePerformance() {
    console.log('🚀 Starting Image Performance Analysis for Draachenmar Encyclopedia\\n');

    try {
      // Load image registry and analyze file sizes
      await this.analyzeImageRegistry();

      // Check actual file sizes on disk
      await this.analyzeFileSizes();

      // Analyze loading patterns in components
      await this.analyzeLoadingPatterns();

      // Check for optimization opportunities
      await this.checkOptimizationOpportunities();

      // Generate performance report
      this.generatePerformanceReport();

    } catch (error) {
      console.error('❌ Performance analysis failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeImageRegistry() {
    console.log('📊 Analyzing image registry...');

    if (!await fs.pathExists(this.registryPath)) {
      throw new Error(`Image registry not found at ${this.registryPath}`);
    }

    const registry = await fs.readJSON(this.registryPath);

    // Count images by category and format
    for (const [category, images] of Object.entries(registry.images)) {
      this.stats.categorySizes[category] = images.length;
      this.stats.totalImages += images.length;

      for (const image of images) {
        const format = image.format || path.extname(image.fileName).slice(1);
        this.stats.formatDistribution[format] = (this.stats.formatDistribution[format] || 0) + 1;
      }
    }

    console.log(`   ✓ Registry loaded: ${this.stats.totalImages} images across ${Object.keys(registry.images).length} categories`);
    console.log(`   📅 Last updated: ${new Date(registry.generated).toLocaleDateString()}`);
  }

  async analyzeFileSizes() {
    console.log('\\n📏 Analyzing file sizes...');

    const imageSizes = [];
    let totalSize = 0;

    // Scan all image directories
    for (const category of await fs.readdir(this.publicImagesDir)) {
      const categoryPath = path.join(this.publicImagesDir, category);

      // Skip non-directories and the registry file
      if (category === 'image-registry.json') continue;

      let stat;
      try {
        stat = await fs.stat(categoryPath);
      } catch (error) {
        console.log(`   ⚠️  Skipping ${category}: ${error.message}`);
        continue;
      }

      if (stat.isDirectory()) {
        const files = await fs.readdir(categoryPath);

        for (const file of files) {
          if (file.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
            try {
              const filePath = path.join(categoryPath, file);
              const fileStats = await fs.stat(filePath);
              const sizeKB = Math.round(fileStats.size / 1024);

              imageSizes.push({
                file,
                category,
                path: filePath,
                sizeKB,
                sizeBytes: fileStats.size,
                format: path.extname(file).slice(1).toLowerCase()
              });

              totalSize += fileStats.size;
            } catch (error) {
              console.log(`   ⚠️  Error processing ${file}: ${error.message}`);
            }
          }
        }
      }
    }

    // Calculate statistics
    this.stats.totalSize = totalSize;
    this.stats.avgSize = imageSizes.length > 0 ? Math.round(totalSize / imageSizes.length / 1024) : 0; // KB

    if (imageSizes.length > 0) {
      imageSizes.sort((a, b) => b.sizeBytes - a.sizeBytes);
      this.stats.largestImage = imageSizes[0];
      this.stats.smallestImage = imageSizes[imageSizes.length - 1];
    }

    console.log(`   📊 Total size: ${this.formatBytes(totalSize)}`);
    console.log(`   📈 Average size: ${this.stats.avgSize}KB`);

    if (this.stats.largestImage) {
      console.log(`   🔴 Largest: ${this.stats.largestImage.file} (${this.stats.largestImage.sizeKB}KB)`);
      console.log(`   🟢 Smallest: ${this.stats.smallestImage.file} (${this.stats.smallestImage.sizeKB}KB)`);
    } else {
      console.log(`   ⚠️  No image files found on disk`);
    }

    // Check for oversized images
    const oversizedImages = imageSizes.filter(img => img.sizeKB > 500);
    if (oversizedImages.length > 0) {
      this.issues.push({
        type: 'oversized_images',
        count: oversizedImages.length,
        images: oversizedImages.slice(0, 5),
        severity: 'medium'
      });
    }

    // Check format distribution
    const formatStats = {};
    imageSizes.forEach(img => {
      formatStats[img.format] = (formatStats[img.format] || 0) + 1;
    });

    console.log('\\n   📁 Format distribution:');
    Object.entries(formatStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([format, count]) => {
        const percentage = Math.round((count / imageSizes.length) * 100);
        console.log(`     ${format.toUpperCase()}: ${count} files (${percentage}%)`);
      });

    return imageSizes;
  }

  async analyzeLoadingPatterns() {
    console.log('\\n🔍 Analyzing image loading patterns...');

    const srcDir = path.join(projectRoot, 'src');
    const componentFiles = await this.findFiles(srcDir, /\\.(tsx|ts)$/);

    let lazyLoadingFound = false;
    let imageOptimizationFound = false;
    const loadingPatterns = [];

    for (const file of componentFiles) {
      const content = await fs.readFile(file, 'utf8');
      const relativePath = path.relative(srcDir, file);

      // Check for lazy loading patterns
      if (content.includes('loading="lazy"') || content.includes('lazy')) {
        lazyLoadingFound = true;
        loadingPatterns.push(`${relativePath}: lazy loading detected`);
      }

      // Check for image optimization patterns
      if (content.includes('srcSet') || content.includes('sizes') || content.includes('picture')) {
        imageOptimizationFound = true;
        loadingPatterns.push(`${relativePath}: responsive images detected`);
      }

      // Check for WebP usage
      if (content.includes('.webp')) {
        loadingPatterns.push(`${relativePath}: WebP format usage`);
      }
    }

    if (lazyLoadingFound) {
      console.log('   ✅ Lazy loading patterns found');
    } else {
      this.issues.push({
        type: 'no_lazy_loading',
        severity: 'medium',
        message: 'No lazy loading patterns detected'
      });
      console.log('   ⚠️  No lazy loading patterns detected');
    }

    if (imageOptimizationFound) {
      console.log('   ✅ Responsive image patterns found');
    } else {
      this.recommendations.push('Consider implementing responsive images with srcSet');
      console.log('   ℹ️  Consider responsive images (srcSet)');
    }

    if (loadingPatterns.length > 0) {
      console.log('\\n   🔍 Loading patterns detected:');
      loadingPatterns.forEach(pattern => {
        console.log(`     • ${pattern}`);
      });
    }
  }

  async checkOptimizationOpportunities() {
    console.log('\\n⚡ Checking optimization opportunities...');

    let score = 100;

    // Check WebP adoption rate
    const webpCount = this.stats.formatDistribution.webp || 0;
    const totalImages = this.stats.totalImages;
    const webpPercentage = Math.round((webpCount / totalImages) * 100);

    console.log(`   📸 WebP adoption: ${webpPercentage}% (${webpCount}/${totalImages})`);

    if (webpPercentage < 80) {
      score -= 20;
      this.recommendations.push(`Increase WebP adoption (currently ${webpPercentage}%)`);
    }

    // Check average file size
    if (this.stats.avgSize > 200) {
      score -= 15;
      this.recommendations.push(`Average image size is ${this.stats.avgSize}KB - consider further optimization`);
    }

    // Check for very large images
    if (this.stats.largestImage && this.stats.largestImage.sizeKB > 1000) {
      score -= 10;
      this.recommendations.push(`Largest image is ${this.stats.largestImage.sizeKB}KB - consider compression`);
    }

    // Check total bundle impact
    const bundleImpactMB = Math.round(this.stats.totalSize / 1024 / 1024);
    console.log(`   📦 Total image bundle: ${bundleImpactMB}MB`);

    if (bundleImpactMB > 50) {
      score -= 15;
      this.recommendations.push(`Large image bundle (${bundleImpactMB}MB) - consider lazy loading or progressive loading`);
    }

    this.stats.optimizationScore = Math.max(0, score);
    console.log(`   📊 Optimization score: ${this.stats.optimizationScore}/100`);
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

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generatePerformanceReport() {
    console.log('\\n' + '='.repeat(60));
    console.log('🚀 IMAGE PERFORMANCE REPORT');
    console.log('='.repeat(60));

    // Executive summary
    console.log('\\n📈 EXECUTIVE SUMMARY:');
    console.log(`   Total Images: ${this.stats.totalImages}`);
    console.log(`   Total Size: ${this.formatBytes(this.stats.totalSize)}`);
    console.log(`   Average Size: ${this.stats.avgSize}KB`);
    console.log(`   Optimization Score: ${this.stats.optimizationScore}/100`);

    // Format breakdown
    console.log('\\n📁 FORMAT BREAKDOWN:');
    Object.entries(this.stats.formatDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([format, count]) => {
        const percentage = Math.round((count / this.stats.totalImages) * 100);
        console.log(`   ${format.toUpperCase()}: ${count} files (${percentage}%)`);
      });

    // Category breakdown
    console.log('\\n📂 CATEGORY BREAKDOWN:');
    Object.entries(this.stats.categorySizes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} images`);
      });

    // Performance issues
    if (this.issues.length > 0) {
      console.log('\\n⚠️  PERFORMANCE ISSUES:');
      this.issues.forEach(issue => {
        switch (issue.type) {
          case 'oversized_images':
            console.log(`   🔴 ${issue.count} oversized images (>500KB):`);
            issue.images.forEach(img => {
              console.log(`     • ${img.file}: ${img.sizeKB}KB`);
            });
            break;
          case 'no_lazy_loading':
            console.log(`   🟡 ${issue.message}`);
            break;
        }
      });
    }

    // Recommendations
    if (this.recommendations.length > 0) {
      console.log('\\n🎯 OPTIMIZATION RECOMMENDATIONS:');
      this.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    // Performance rating
    console.log('\\n📊 PERFORMANCE RATING:');
    if (this.stats.optimizationScore >= 90) {
      console.log('   🟢 EXCELLENT - Image performance is optimized');
    } else if (this.stats.optimizationScore >= 75) {
      console.log('   🟡 GOOD - Minor optimizations recommended');
    } else if (this.stats.optimizationScore >= 60) {
      console.log('   🟠 FAIR - Several optimizations needed');
    } else {
      console.log('   🔴 POOR - Significant optimization required');
    }

    // Next steps
    console.log('\\n🚀 NEXT STEPS:');
    console.log('   1. Run tools/optimize-images.js for WebP conversion');
    console.log('   2. Implement lazy loading for below-the-fold images');
    console.log('   3. Consider progressive image loading for large assets');
    console.log('   4. Monitor bundle size impact on page load times');

    if (this.issues.length === 0 && this.stats.optimizationScore >= 90) {
      console.log('\\n🎉 CONCLUSION: Image performance is excellent!');
    } else {
      console.log('\\n⚡ CONCLUSION: Follow recommendations to improve performance');
    }

    console.log('\\n📋 Analysis complete.');
  }
}

// Run the image performance analysis
const analyzer = new ImagePerformanceAnalyzer();
analyzer.analyzePerformance().catch(console.error);
# Draachenmar Encyclopedia - Development Tools

This directory contains analysis and monitoring tools for the Draachenmar Encyclopedia project.

## Bundle Size Monitoring

### Bundle Analyzer (`bundle-analyzer.js`)

Comprehensive tool for monitoring application bundle size and performance.

**Usage:**
```bash
npm run analyze-bundle
```

**Features:**
- Analyzes JavaScript, CSS, image, and font bundle sizes
- Estimates gzip compression ratios
- Provides performance scoring (0-100)
- Identifies optimization opportunities
- Saves historical reports to `reports/` directory

**Key Metrics:**
- Performance Score: 70/100 (Fair - needs optimization)
- Total Bundle: 232.31 MB (mainly images)
- JavaScript: 381.78 KB (114.64 KB gzipped)
- CSS: 44.84 KB (15.69 KB gzipped)

**Recommendations:**
- Implement lazy loading for images
- Consider CDN for static assets
- Further compress 86 oversized images (>500KB)

## Image Performance

### Image Performance Analyzer (`analyze-image-performance.js`)

Analyzes image assets for optimization opportunities.

**Usage:**
```bash
npm run analyze-images
```

**Features:**
- Scans all image directories
- Identifies oversized images
- Reports WebP adoption rate
- Calculates total image bundle size

## Accessibility Monitoring

### Accessibility Auditor (`accessibility-audit.js`)

WCAG 2.1 compliance checker for accessibility issues.

**Usage:**
```bash
npm run test-accessibility
```

**Features:**
- Checks form labeling and ARIA attributes
- Validates semantic HTML structure
- Tests keyboard navigation support
- Identifies missing alt text
- Scores accessibility compliance

**Current Status:**
- Score: 47/100 (Serious - improvements needed)
- 1 serious issue (missing alt attribute)
- 4 moderate issues (focus utilities, testing libraries)
- 2 minor issues (redundant alt text)

## Quality Assurance Tools

### Link Validator (`validate-links.js`)

Validates cross-references between content entities.

**Usage:**
```bash
node tools/validate-links.js
```

### Search Tester (`test-search.js`)

Tests search functionality across all content types.

**Usage:**
```bash
node tools/test-search.js
```

### Placeholder Tester (`test-placeholders.js`)

Validates image placeholder system implementation.

**Usage:**
```bash
node tools/test-placeholders.js
```

## Monitoring Best Practices

### Regular Checks

Run these commands regularly during development:

```bash
# Before committing changes
npm run lint
npm run typecheck
npm run test-accessibility

# Before releases
npm run analyze-bundle
npm run analyze-images
```

### CI/CD Integration

Consider adding these checks to your CI/CD pipeline:

1. **Bundle Size Limits**: Alert if JavaScript bundle exceeds 500KB
2. **Image Optimization**: Alert if images >1MB are added
3. **Accessibility Regression**: Alert if accessibility score drops
4. **Performance Budget**: Monitor total bundle size growth

### Performance Targets

**Current vs Target:**
- JavaScript Bundle: 381KB → Target: <400KB ✅
- CSS Bundle: 44KB → Target: <100KB ✅
- Image Bundle: 231MB → Target: <100MB ❌
- Accessibility Score: 47/100 → Target: >80 ❌

### Optimization Roadmap

1. **Immediate (High Priority):**
   - Implement image lazy loading
   - Set up CDN for static assets
   - Fix remaining accessibility issues

2. **Short Term (Medium Priority):**
   - Compress 86 oversized images
   - Add accessibility testing libraries
   - Implement focus utilities in Tailwind

3. **Long Term (Future):**
   - Progressive image loading
   - Service worker for caching
   - Real user monitoring (RUM)

## Report Storage

All analysis reports are saved to the `reports/` directory with timestamps for historical tracking:

- `bundle-analysis-YYYY-MM-DD.json`
- Historical performance trends
- Regression detection

## Contributing

When adding new features:

1. Run bundle analysis before and after changes
2. Document any significant size increases
3. Update performance targets if needed
4. Consider performance impact in code reviews

## Available Tools

### `optimize-images.js`
**Purpose**: Bulk convert and optimize entire directories of images to WebP format.

**Usage**:
```bash
# From project root directory
node tools/optimize-images.js
```

**Features**:
- Converts PNG/JPG/JPEG to WebP format
- Optimizes file sizes (typically 80-95% reduction for PNG, 10-15% for JPG)
- Processes entire directories recursively
- Maintains directory structure
- Shows compression statistics
- Only processes files larger than 500KB (copies smaller files as-is)

**Configuration**:
- Quality: 75% (configurable)
- Max width: 1200px (configurable)
- Input directory: `./public/images`
- Output directory: `./public/images-optimized`

### `convert-single-images.js`
**Purpose**: Convert individual images or small batches to WebP format.

**Usage**:
```bash
# 1. Edit the imagesToConvert array in the script
# 2. Run from project root directory
node tools/convert-single-images.js
```

**Features**:
- Converts specific individual files
- Automatically copies to both public/ and dist/ directories
- Quality: 85% (optimized for individual conversions)
- Shows conversion statistics per file
- Creates output directories if they don't exist

---

## 📝 **Claude Code Assistant Notes**

### Image Conversion Process
When converting images to WebP format in the future:

1. **Use the existing tool**: `node tools/optimize-images.js`
2. **For individual files**: Create a custom script based on the optimize-images.js template
3. **Sharp library**: Already installed and configured in the project
4. **Target quality**: 85% for artifacts, 75% for bulk optimization
5. **Always update both**: `public/images/` and `dist/images/` directories

### Project Structure Notes
- **tools/**: Utility scripts and development tools
- **scripts/**: Build and migration scripts
- **src/**: Source code
- **public/images/**: Development images (WebP optimized)
- **dist/images/**: Production images (mirrors public/images)

### Recent Work Completed
- Converted 10 missing images from Pictures folder to WebP (98%+ migration complete)
- Optimized all duplicate PNG files removed
- Fixed duplicate image properties in characters.ts
- Project fully cleaned and optimized for production
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { glob } from 'glob';

export interface ImageInfo {
  originalPath: string;
  webPath: string;
  fileName: string;
  category: string;
  size: {
    width: number;
    height: number;
  };
}

export class ImageManager {
  private sourceDir: string;
  private targetDir: string;

  constructor(sourceDir: string, targetDir: string = 'public/images') {
    this.sourceDir = sourceDir;
    this.targetDir = targetDir;
  }

  async copyAndOptimizeImages(): Promise<ImageInfo[]> {
    const imageFiles = await this.findImageFiles();
    const results: ImageInfo[] = [];

    for (const imagePath of imageFiles) {
      try {
        const imageInfo = await this.processImage(imagePath);
        results.push(imageInfo);
        console.log(`✓ Processed: ${imageInfo.fileName}`);
      } catch (error) {
        console.error(`✗ Failed to process ${imagePath}:`, error);
      }
    }

    return results;
  }

  private async findImageFiles(): Promise<string[]> {
    const patterns = [
      '**/*.{jpg,jpeg,png,gif,webp}',
      '**/*.{JPG,JPEG,PNG,GIF,WEBP}'
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: this.sourceDir,
        absolute: true
      });
      files.push(...matches);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  private async processImage(imagePath: string): Promise<ImageInfo> {
    const relativePath = path.relative(this.sourceDir, imagePath);
    const category = this.determineCategory(relativePath);
    const fileName = this.generateFileName(imagePath);

    const targetPath = path.join(this.targetDir, category, fileName);
    await fs.ensureDir(path.dirname(targetPath));

    // Optimize image using Sharp
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Resize if too large (max 1200px width for web)
    let processedImage = image;
    if (metadata.width && metadata.width > 1200) {
      processedImage = image.resize(1200, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }

    // Convert to WebP for better compression, but keep originals for compatibility
    const webpPath = targetPath.replace(/\.[^.]+$/, '.webp');
    await processedImage.webp({ quality: 85 }).toFile(webpPath);

    // Also save optimized original format
    await processedImage.jpeg({ quality: 90 }).toFile(targetPath);

    return {
      originalPath: imagePath,
      webPath: `/images/${category}/${fileName}`,
      fileName,
      category,
      size: {
        width: metadata.width || 0,
        height: metadata.height || 0
      }
    };
  }

  private determineCategory(relativePath: string): string {
    const pathLower = relativePath.toLowerCase();

    if (pathLower.includes('map')) return 'maps';
    if (pathLower.includes('character') || pathLower.includes('npc')) return 'characters';
    if (pathLower.includes('location') || pathLower.includes('place')) return 'locations';
    if (pathLower.includes('item') || pathLower.includes('artifact') || pathLower.includes('weapon')) return 'items';
    if (pathLower.includes('player')) return 'characters';

    // Default category
    return 'artifacts';
  }

  private generateFileName(imagePath: string): string {
    const baseName = path.basename(imagePath, path.extname(imagePath));
    const extension = path.extname(imagePath);

    // Clean filename: remove spaces, special chars, make lowercase
    const cleanName = baseName
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();

    return `${cleanName}${extension}`;
  }

  async generateImageRegistry(): Promise<void> {
    const images = await this.copyAndOptimizeImages();
    const registry = {
      generated: new Date().toISOString(),
      images: images.reduce((acc, img) => {
        if (!acc[img.category]) acc[img.category] = [];
        acc[img.category].push(img);
        return acc;
      }, {} as Record<string, ImageInfo[]>)
    };

    await fs.writeJSON(path.join(this.targetDir, 'image-registry.json'), registry, { spaces: 2 });
    console.log(`✓ Generated image registry with ${images.length} images`);
  }
}
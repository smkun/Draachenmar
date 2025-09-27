import { GalleryImage, ContentCategory } from '../types';

// Image registry interface (matches the generated file)
interface ImageRegistry {
  generated: string;
  images: Record<string, ImageInfo[]>;
}

interface ImageInfo {
  originalPath: string;
  webPath: string;
  fileName: string;
  category: string;
  size: {
    width: number;
    height: number;
  };
}

export class ImageIntegrationService {
  private imageRegistry: ImageRegistry | null = null;
  private nameToImageMap: Map<string, ImageInfo[]> = new Map();

  async initialize() {
    try {
      // Load the image registry - handle both dev and production paths
      const basePath = (import.meta as any).env?.BASE_URL || '/';
      const registryPath = `${basePath}images/image-registry.json`.replace('//', '/');
      const response = await fetch(registryPath);
      this.imageRegistry = await response.json();

      // Build name-to-image mapping for quick lookups
      this.buildNameMapping();

      console.log(`🖼️ Image registry loaded with ${this.getTotalImageCount()} images`);
    } catch (error) {
      console.warn('Could not load image registry:', error);
    }
  }

  private buildNameMapping() {
    if (!this.imageRegistry) return;

    for (const [category, images] of Object.entries(this.imageRegistry.images)) {
      for (const image of images) {
        // Extract potential names from filename
        const potentialNames = this.extractNamesFromFilename(image.fileName);

        for (const name of potentialNames) {
          if (!this.nameToImageMap.has(name)) {
            this.nameToImageMap.set(name, []);
          }
          this.nameToImageMap.get(name)!.push(image);
        }
      }
    }
  }

  private extractNamesFromFilename(fileName: string): string[] {
    // Remove extension and clean up filename
    const baseName = fileName.replace(/\.[^.]+$/, '');

    // Split on common separators and create variations
    const names: string[] = [];

    // Original name
    names.push(baseName);

    // Replace underscores with spaces
    names.push(baseName.replace(/_/g, ' '));

    // Split on underscores and take meaningful parts
    const parts = baseName.split('_').filter(part => part.length > 2);
    if (parts.length > 1) {
      names.push(parts.join(' '));
      // Also add individual significant parts
      parts.forEach(part => {
        if (part.length > 3) {
          names.push(part);
        }
      });
    }

    return [...new Set(names)]; // Remove duplicates
  }

  /**
   * Find images that might belong to a specific content entry
   */
  findImagesForEntry(entryName: string, category: ContentCategory): GalleryImage[] {
    if (!this.imageRegistry) return [];

    const normalizedName = this.normalizeName(entryName);
    const images: GalleryImage[] = [];

    // Direct name match
    const directMatches = this.nameToImageMap.get(normalizedName) || [];

    // Fuzzy matching - look for names that contain parts of the entry name
    const fuzzyMatches: ImageInfo[] = [];
    const searchTerms = normalizedName.split(' ').filter(term => term.length > 2);

    for (const [imageName, imageInfos] of this.nameToImageMap.entries()) {
      const matchScore = this.calculateMatchScore(searchTerms, imageName);
      if (matchScore > 0.5) {
        fuzzyMatches.push(...imageInfos);
      }
    }

    // Convert to GalleryImage format
    const allMatches = [...directMatches, ...fuzzyMatches];
    const uniqueMatches = this.removeDuplicateImages(allMatches);

    return uniqueMatches.map(imageInfo => ({
      url: imageInfo.webPath,
      alt: `${entryName} - ${imageInfo.fileName}`,
      caption: this.generateCaption(imageInfo, entryName),
      thumbnail: imageInfo.webPath.replace(/\.[^.]+$/, '_thumb$&'), // Assume thumbnails exist
      type: this.determineImageType(imageInfo, category)
    }));
  }

  /**
   * Get all images for a specific category
   */
  getImagesByCategory(category: string): GalleryImage[] {
    if (!this.imageRegistry) return [];

    const categoryImages = this.imageRegistry.images[category] || [];
    return categoryImages.map(imageInfo => ({
      url: imageInfo.webPath,
      alt: imageInfo.fileName,
      caption: this.generateCaption(imageInfo),
      type: this.determineImageType(imageInfo, category as ContentCategory)
    }));
  }

  /**
   * Search images by name or description
   */
  searchImages(query: string): GalleryImage[] {
    if (!this.imageRegistry) return [];

    const normalizedQuery = this.normalizeName(query);
    const searchTerms = normalizedQuery.split(' ').filter(term => term.length > 2);
    const matches: ImageInfo[] = [];

    for (const [imageName, imageInfos] of this.nameToImageMap.entries()) {
      const matchScore = this.calculateMatchScore(searchTerms, imageName);
      if (matchScore > 0.3) { // Lower threshold for search
        matches.push(...imageInfos);
      }
    }

    return this.removeDuplicateImages(matches).map(imageInfo => ({
      url: imageInfo.webPath,
      alt: imageInfo.fileName,
      caption: this.generateCaption(imageInfo),
      type: this.determineImageType(imageInfo, 'artifacts' as ContentCategory)
    }));
  }

  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculateMatchScore(searchTerms: string[], targetName: string): number {
    const normalizedTarget = this.normalizeName(targetName);
    let matches = 0;

    for (const term of searchTerms) {
      if (normalizedTarget.includes(term)) {
        matches++;
      }
    }

    return matches / searchTerms.length;
  }

  private removeDuplicateImages(images: ImageInfo[]): ImageInfo[] {
    const seen = new Set<string>();
    return images.filter(image => {
      if (seen.has(image.webPath)) {
        return false;
      }
      seen.add(image.webPath);
      return true;
    });
  }

  private generateCaption(imageInfo: ImageInfo, entryName?: string): string | undefined {
    const cleanFileName = imageInfo.fileName
      .replace(/\.[^.]+$/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    if (entryName && cleanFileName.toLowerCase().includes(entryName.toLowerCase())) {
      return undefined; // Caption would be redundant
    }

    return cleanFileName;
  }

  private determineImageType(imageInfo: ImageInfo, category: ContentCategory): GalleryImage['type'] {
    const fileName = imageInfo.fileName.toLowerCase();

    if (category === 'characters' || fileName.includes('character') || fileName.includes('portrait')) {
      return 'character-portrait';
    }

    if (category === 'items' || fileName.includes('item') || fileName.includes('weapon') || fileName.includes('armor')) {
      return 'item-art';
    }

    if (category === 'locations' || fileName.includes('map') || fileName.includes('city') || fileName.includes('location')) {
      return 'location-map';
    }

    if (fileName.includes('scene') || fileName.includes('battle') || fileName.includes('event')) {
      return 'scene';
    }

    return 'other';
  }

  private getTotalImageCount(): number {
    if (!this.imageRegistry) return 0;

    return Object.values(this.imageRegistry.images)
      .reduce((total, images) => total + images.length, 0);
  }

  /**
   * Get featured images for the homepage
   */
  getFeaturedImages(count: number = 6): GalleryImage[] {
    if (!this.imageRegistry) return [];

    const allImages: ImageInfo[] = [];
    for (const images of Object.values(this.imageRegistry.images)) {
      allImages.push(...images);
    }

    // Sort by interesting criteria (size, category diversity)
    const featured = allImages
      .sort((a, b) => {
        // Prefer larger images
        const aSize = a.size.width * a.size.height;
        const bSize = b.size.width * b.size.height;
        return bSize - aSize;
      })
      .slice(0, count);

    return featured.map(imageInfo => ({
      url: imageInfo.webPath,
      alt: imageInfo.fileName,
      caption: this.generateCaption(imageInfo),
      type: this.determineImageType(imageInfo, 'artifacts' as ContentCategory)
    }));
  }
}

// Singleton instance
export const imageService = new ImageIntegrationService();
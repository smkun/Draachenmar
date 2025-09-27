import mammoth from 'mammoth';
import fs from 'fs-extra';
import path from 'path';

export interface StructuredContent {
  title: string;
  worldLore: WorldLore;
  places: Place[];
  characters: Character[];
  deities: Deity[];
  organizations: Organization[];
  items: Item[];
  adventures: Adventure[];
  metadata: DocumentMetadata;
}

export interface WorldLore {
  overview: string;
  history: string;
  geography: string;
  politics: string;
  magic: string;
  religion: string;
}

export interface Place {
  id: string;
  name: string;
  title?: string;
  type: 'kingdom' | 'city' | 'town' | 'fortress' | 'region' | 'landmark';
  description: string;
  government?: string;
  population?: number;
  economy?: string;
  history?: string;
  people: Character[];
  subLocations: Place[];
  ruler?: string;
  image?: string;
  coordinates?: { x: number; y: number };
}

export interface Character {
  id: string;
  name: string;
  title?: string;
  race?: string;
  class?: string;
  level?: number;
  location?: string;
  description: string;
  background?: string;
  personality?: string;
  appearance?: string;
  role?: string;
  relationships?: string[];
  image?: string;
  category: 'ruler' | 'noble' | 'merchant' | 'guard' | 'citizen' | 'hero' | 'villain' | 'deity';
}

export interface Deity {
  id: string;
  name: string;
  title: string;
  domain: string[];
  description: string;
  history?: string;
  worshippers?: string;
  temples?: string[];
  alignment?: string;
  symbol?: string;
  image?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'guild' | 'order' | 'government' | 'military' | 'religion';
  description: string;
  headquarters?: string;
  leader?: string;
  members?: string[];
  goals?: string[];
  history?: string;
}

export interface Item {
  id: string;
  name: string;
  title?: string;
  type: 'weapon' | 'armor' | 'artifact' | 'treasure';
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact';
  description: string;
  properties?: string[];
  history?: string;
  owner?: string;
  location?: string;
  image?: string;
}

export interface Adventure {
  id: string;
  name: string;
  title: string;
  description: string;
  level?: string;
  duration?: string;
  locations: string[];
  characters: string[];
  summary?: string;
}

export interface DocumentMetadata {
  fileName: string;
  filePath: string;
  lastModified: Date;
  extractedSections: string[];
  imageReferences: string[];
}

export class StructuredDocumentParser {
  async parseMainDocument(filePath: string): Promise<StructuredContent> {
    console.log(`📖 Parsing structured document: ${path.basename(filePath)}`);

    const stats = await fs.stat(filePath);
    const fileName = path.basename(filePath);

    // Convert Word document to HTML and plain text
    const htmlResult = await mammoth.convertToHtml({ path: filePath });
    const textResult = await mammoth.extractRawText({ path: filePath });

    const content = textResult.value;
    const htmlContent = htmlResult.value;

    // Initialize the structured content
    const structured: StructuredContent = {
      title: this.extractTitle(fileName, content),
      worldLore: this.extractWorldLore(content),
      places: [],
      characters: [],
      deities: [],
      organizations: [],
      items: [],
      adventures: [],
      metadata: {
        fileName,
        filePath,
        lastModified: stats.mtime,
        extractedSections: [],
        imageReferences: this.extractImageReferences(htmlContent)
      }
    };

    // Parse different sections based on document structure
    if (fileName.toLowerCase().includes('people and places')) {
      this.parsePeopleAndPlaces(content, structured);
    } else if (fileName.toLowerCase().includes('draachenmar 3.')) {
      this.parseMainCampaignGuide(content, structured);
    }

    console.log(`✅ Parsed: ${structured.places.length} places, ${structured.characters.length} characters, ${structured.deities.length} deities`);

    return structured;
  }

  private extractTitle(fileName: string, content: string): string {
    const lines = content.split('\n').filter(line => line.trim());
    const firstLine = lines[0]?.trim();

    // Look for document title in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line && line.length < 100 && line.toUpperCase() === line && line.includes('DRAACHENMAR')) {
        return line;
      }
    }

    return fileName.replace(/\.(docx?|pdf)$/i, '');
  }

  private extractWorldLore(content: string): WorldLore {
    const sections = this.splitIntoSections(content);

    return {
      overview: this.findSectionContent(sections, ['overview', 'introduction', 'about']) || '',
      history: this.findSectionContent(sections, ['history', 'timeline', 'past']) || '',
      geography: this.findSectionContent(sections, ['geography', 'lands', 'realms']) || '',
      politics: this.findSectionContent(sections, ['politics', 'government', 'kingdoms']) || '',
      magic: this.findSectionContent(sections, ['magic', 'arcane', 'spells']) || '',
      religion: this.findSectionContent(sections, ['religion', 'gods', 'deities', 'divine']) || ''
    };
  }

  private parsePeopleAndPlaces(content: string, structured: StructuredContent) {
    console.log('📍 Parsing People and Places document...');

    // Split content into major sections based on place names
    // Look for patterns like "Gulanbarak", "The Great Woods of Averlys", "Henge", etc.
    const sections = content.split(/(?=^(?:The\s+)?[A-Z][a-zA-Z\s"'-]*(?:\s+"[^"]+")?\s*$)/m);

    for (const section of sections) {
      const trimmedSection = section.trim();
      if (trimmedSection.length > 50 && this.isPlaceSection(trimmedSection)) {
        const place = this.parsePlace(trimmedSection);
        if (place) {
          structured.places.push(place);
          structured.metadata.extractedSections.push(`Place: ${place.name}`);
          console.log(`✓ Found place: ${place.name} with ${place.people.length} characters`);
        }
      }
    }
  }

  private parseMainCampaignGuide(content: string, structured: StructuredContent) {
    console.log('📚 Parsing main campaign guide...');

    const sections = this.splitIntoSections(content);

    // Extract deities
    const deitySection = this.findSectionContent(sections, ['deities', 'gods', 'pantheon', 'divine']);
    if (deitySection) {
      structured.deities = this.parseDeities(deitySection);
      structured.metadata.extractedSections.push('Deities');
    }

    // Extract major locations
    const locationSections = this.findSectionContent(sections, ['locations', 'places', 'realms', 'kingdoms']);
    if (locationSections) {
      structured.places.push(...this.parseLocations(locationSections));
      structured.metadata.extractedSections.push('Locations');
    }

    // Extract organizations
    const orgSection = this.findSectionContent(sections, ['organizations', 'guilds', 'orders', 'factions']);
    if (orgSection) {
      structured.organizations = this.parseOrganizations(orgSection);
      structured.metadata.extractedSections.push('Organizations');
    }

    // Extract adventures
    const adventureSection = this.findSectionContent(sections, ['adventures', 'quests', 'campaigns']);
    if (adventureSection) {
      structured.adventures = this.parseAdventures(adventureSection);
      structured.metadata.extractedSections.push('Adventures');
    }
  }

  private parsePlace(sectionText: string): Place | null {
    const lines = sectionText.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) return null;

    // Extract place name from first line
    const firstLine = lines[0].trim();
    let placeName = firstLine;
    let placeTitle = undefined;

    // Handle names with titles like 'Gulanbarak "The Wall"'
    const titleMatch = firstLine.match(/^([^"]+)"([^"]+)"/);
    if (titleMatch) {
      placeName = titleMatch[1].trim();
      placeTitle = titleMatch[2].trim();
    }

    // Determine place type
    const type = this.determinePlaceType(sectionText);

    // Extract description and parse embedded characters
    let description = '';
    const people: Character[] = [];
    const fullText = lines.slice(1).join(' ');

    // Look for character patterns in the full text
    // Pattern for "Character Name: description"
    const characterMatches = fullText.match(/([A-Z][a-zA-Z\s"'-]+):\s*([^.]*\.)/g);

    if (characterMatches) {
      for (const match of characterMatches) {
        const character = this.parseCharacterFromText(match, placeName);
        if (character) {
          people.push(character);
        }
      }
    }

    // Also look for specific patterns like "rules over the seven dwarven Klngs (list)"
    const kingsMatch = fullText.match(/rules over the seven dwarven Klngs \(([^)]+)\)/);
    if (kingsMatch) {
      const kingNames = kingsMatch[1].split(';').map(name => name.trim());
      for (const kingName of kingNames) {
        if (kingName) {
          const king: Character = {
            id: this.generateId(kingName),
            name: kingName,
            location: placeName,
            description: `One of the seven dwarven kings who serve under High King Rathgar.`,
            category: 'ruler',
            image: this.findImageForName(kingName)
          };
          people.push(king);
        }
      }
    }

    // Build description without character details
    description = fullText.substring(0, Math.min(500, fullText.length));
    if (fullText.length > 500) description += '...';

    const id = this.generateId(placeName);

    return {
      id,
      name: placeName,
      title: placeTitle,
      type,
      description,
      people,
      subLocations: [],
      image: this.findImageForName(placeName)
    };
  }

  private parseCharacterFromText(text: string, location: string): Character | null {
    // Parse character patterns like "High King Rathgar "Stoneforge" Ironhammer: description"
    const characterMatch = text.match(/^([^:]+):\s*(.+)/);
    if (!characterMatch) return null;

    const fullName = characterMatch[1].trim();
    const description = characterMatch[2].trim();

    // Extract title if present in quotes
    let name = fullName;
    let title = undefined;

    const titleMatch = fullName.match(/^(.+?)\s+"([^"]+)"\s+(.+)$/);
    if (titleMatch) {
      const prefix = titleMatch[1].trim();
      title = titleMatch[2].trim();
      const suffix = titleMatch[3].trim();
      name = `${prefix} ${suffix}`.trim();
    }

    const id = this.generateId(name);

    return {
      id,
      name,
      title,
      location,
      description,
      category: this.determineCharacterCategory(fullName, description),
      image: this.findImageForName(name)
    };
  }

  private parseCharacterFromSection(text: string, location: string): Character | null {
    // Legacy method - redirect to new method
    return this.parseCharacterFromText(text, location);
  }

  private parseDeities(sectionText: string): Deity[] {
    const deities: Deity[] = [];
    const deityBlocks = sectionText.split(/\n\s*\n/).filter(block => block.trim());

    for (const block of deityBlocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 2) continue;

      const firstLine = lines[0].trim();

      // Look for deity name pattern
      const deityMatch = firstLine.match(/^([^,]+),?\s*(.*)$/);
      if (!deityMatch) continue;

      const name = deityMatch[1].trim();
      const titleAndDomain = deityMatch[2].trim();

      const deity: Deity = {
        id: this.generateId(name),
        name,
        title: titleAndDomain || 'Divine Entity',
        domain: this.extractDomains(block),
        description: lines.slice(1).join(' ').trim(),
        image: this.findImageForName(name)
      };

      deities.push(deity);
    }

    return deities;
  }

  private parseLocations(sectionText: string): Place[] {
    const places: Place[] = [];
    // Implementation for parsing location sections
    return places;
  }

  private parseOrganizations(sectionText: string): Organization[] {
    const organizations: Organization[] = [];
    // Implementation for parsing organization sections
    return organizations;
  }

  private parseAdventures(sectionText: string): Adventure[] {
    const adventures: Adventure[] = [];
    // Implementation for parsing adventure sections
    return adventures;
  }

  // Helper methods
  private splitIntoSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = content.split('\n');
    let currentSection = 'introduction';
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if this is a section header
      if (this.isSectionHeader(trimmedLine)) {
        // Save previous section
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }

        // Start new section
        currentSection = this.normalizeSectionName(trimmedLine);
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    // Save final section
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }

  private isSectionHeader(line: string): boolean {
    return line.length > 0 &&
           line.length < 100 &&
           (line === line.toUpperCase() ||
            /^[A-Z][^a-z]*[A-Z]/.test(line) ||
            line.endsWith(':'));
  }

  private normalizeSectionName(header: string): string {
    return header.toLowerCase()
                 .replace(/[^a-z0-9\s]/g, '')
                 .replace(/\s+/g, '_')
                 .trim();
  }

  private findSectionContent(sections: Record<string, string>, keywords: string[]): string | null {
    for (const [sectionName, content] of Object.entries(sections)) {
      for (const keyword of keywords) {
        if (sectionName.includes(keyword)) {
          return content;
        }
      }
    }
    return null;
  }

  private isPlaceSection(text: string): boolean {
    const firstLine = text.split('\n')[0]?.trim();
    if (!firstLine || firstLine.length > 100) return false;

    // Check if it's a place name pattern
    const placePatterns = [
      /^[A-Z][a-zA-Z\s"'-]+$/,  // Basic place names like "Gulanbarak" or 'Gulanbarak "The Wall"'
      /^The\s+[A-Z][a-zA-Z\s"'-]+$/,  // Names starting with "The" like "The Great Woods of Averlys"
      /^[A-Z][a-zA-Z\s]+\s+of\s+[A-Z][a-zA-Z\s]+$/  // Names with "of" like "City of Kronus"
    ];

    const isPlaceName = placePatterns.some(pattern => pattern.test(firstLine));
    const isNotPeopleHeader = !this.isPeopleHeader(firstLine);
    const isNotCommonWord = !['BACKGROUND', 'RESPONSIBILITIES', 'PERSONALITY', 'GEOGRAPHY', 'CLIMATE'].includes(firstLine.toUpperCase());

    return isPlaceName && isNotPeopleHeader && isNotCommonWord;
  }

  private isPeopleHeader(line: string): boolean {
    const keywords = ['people of', 'inhabitants', 'notable figures', 'characters', 'rulers'];
    return keywords.some(keyword => line.toLowerCase().includes(keyword));
  }

  private determinePlaceType(text: string): Place['type'] {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('kingdom') || lowerText.includes('realm')) return 'kingdom';
    if (lowerText.includes('city')) return 'city';
    if (lowerText.includes('town')) return 'town';
    if (lowerText.includes('fortress') || lowerText.includes('wall')) return 'fortress';
    if (lowerText.includes('region')) return 'region';

    return 'landmark';
  }

  private determineCharacterCategory(name: string, description: string): Character['category'] {
    const lowerName = name.toLowerCase();
    const lowerDesc = description.toLowerCase();

    if (lowerName.includes('king') || lowerName.includes('queen') || lowerName.includes('ruler')) return 'ruler';
    if (lowerName.includes('lord') || lowerName.includes('lady') || lowerDesc.includes('noble')) return 'noble';
    if (lowerDesc.includes('merchant') || lowerDesc.includes('trader')) return 'merchant';
    if (lowerDesc.includes('guard') || lowerDesc.includes('soldier')) return 'guard';
    if (lowerDesc.includes('villain') || lowerDesc.includes('evil')) return 'villain';
    if (lowerDesc.includes('hero') || lowerDesc.includes('champion')) return 'hero';

    return 'citizen';
  }

  private extractDomains(text: string): string[] {
    const domains: string[] = [];
    const domainKeywords = ['war', 'peace', 'magic', 'wisdom', 'strength', 'nature', 'death', 'life', 'knowledge', 'trickery'];

    const lowerText = text.toLowerCase();
    for (const domain of domainKeywords) {
      if (lowerText.includes(domain)) {
        domains.push(domain);
      }
    }

    return domains.length > 0 ? domains : ['divine'];
  }

  private findImageForName(name: string): string | undefined {
    // This would connect to the image registry to find matching images
    const normalizedName = this.generateId(name);
    return `/images/characters/${normalizedName}.jpg`; // Placeholder
  }

  private extractImageReferences(htmlContent: string): string[] {
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const references: string[] = [];
    let match;

    while ((match = imgRegex.exec(htmlContent)) !== null) {
      references.push(match[1]);
    }

    return references;
  }

  private generateId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
import mammoth from 'mammoth';
import fs from 'fs-extra';
import path from 'path';

export interface ParsedDocument {
  title: string;
  content: string;
  htmlContent: string;
  metadata: {
    fileName: string;
    filePath: string;
    size: number;
    lastModified: Date;
    creator?: string;
  };
  extractedData: {
    characters: ExtractedCharacter[];
    items: ExtractedItem[];
    locations: ExtractedLocation[];
    organizations: ExtractedOrganization[];
  };
}

export interface ExtractedCharacter {
  name: string;
  title?: string;
  description: string;
  race?: string;
  class?: string;
  location?: string;
  background?: string;
  creator?: string;
  tags: string[];
}

export interface ExtractedItem {
  name: string;
  title?: string;
  type: string;
  rarity?: string;
  description: string;
  properties?: string[];
  history?: string;
  creator?: string;
  tags: string[];
}

export interface ExtractedLocation {
  name: string;
  title?: string;
  type: string;
  description: string;
  population?: number;
  government?: string;
  economy?: string;
  history?: string;
  tags: string[];
}

export interface ExtractedOrganization {
  name: string;
  type: string;
  description: string;
  headquarters?: string;
  leader?: string;
  goals?: string[];
  tags: string[];
}

export class DocumentParser {
  async parseWordDocument(filePath: string): Promise<ParsedDocument> {
    const stats = await fs.stat(filePath);
    const fileName = path.basename(filePath);

    // Convert Word document to HTML and plain text
    const result = await mammoth.convertToHtml({
      path: filePath
    });

    const textResult = await mammoth.extractRawText({
      path: filePath
    });

    const document: ParsedDocument = {
      title: this.extractTitle(fileName, textResult.value),
      content: textResult.value,
      htmlContent: result.value,
      metadata: {
        fileName,
        filePath,
        size: stats.size,
        lastModified: stats.mtime,
        creator: this.extractCreator(fileName, textResult.value)
      },
      extractedData: {
        characters: this.extractCharacters(textResult.value, fileName),
        items: this.extractItems(textResult.value, fileName),
        locations: this.extractLocations(textResult.value, fileName),
        organizations: this.extractOrganizations(textResult.value, fileName)
      }
    };

    return document;
  }

  private extractTitle(fileName: string, content: string): string {
    // Try to extract title from first line or filename
    const lines = content.split('\n').filter(line => line.trim());
    const firstLine = lines[0]?.trim();

    if (firstLine && firstLine.length < 100 && !firstLine.includes('.')) {
      return firstLine;
    }

    // Fall back to cleaned filename
    return fileName
      .replace(/\.(docx?|pdf)$/i, '')
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractCreator(fileName: string, content: string): string | undefined {
    // Look for creator patterns in filename
    const creatorMatch = fileName.match(/by\s+([^.]+)/i);
    if (creatorMatch) {
      return creatorMatch[1].trim();
    }

    // Look for "Created by", "Author:", etc. in content
    const contentCreatorPatterns = [
      /(?:created|authored|written|made)\s+by\s+([^\n.]+)/i,
      /author\s*:\s*([^\n.]+)/i,
      /creator\s*:\s*([^\n.]+)/i
    ];

    for (const pattern of contentCreatorPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractCharacters(content: string, fileName: string): ExtractedCharacter[] {
    const characters: ExtractedCharacter[] = [];

    // Look for character-like patterns
    const characterPatterns = [
      // Standard D&D character format
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:\([^)]+\))?\s*\n(?:.*(?:Fighter|Wizard|Rogue|Cleric|Paladin|Ranger|Barbarian|Sorcerer|Warlock|Bard|Druid|Monk|Artificer|Elf|Dwarf|Human|Halfling|Gnome|Tiefling|Dragonborn|Half-Elf|Half-Orc))/gi,
      // Name with title pattern
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s+(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
    ];

    // If filename suggests it's a character document
    if (fileName.toLowerCase().includes('character') ||
        fileName.toLowerCase().includes('npc') ||
        this.isCharacterDocument(content)) {

      const name = this.extractMainCharacterName(fileName, content);
      if (name) {
        characters.push({
          name,
          title: this.extractCharacterTitle(content),
          description: this.extractCharacterDescription(content),
          race: this.extractRace(content),
          class: this.extractClass(content),
          background: this.extractBackground(content),
          creator: this.extractCreator(fileName, content),
          tags: this.generateTags(content, 'character')
        });
      }
    }

    return characters;
  }

  private extractItems(content: string, fileName: string): ExtractedItem[] {
    const items: ExtractedItem[] = [];

    // Common item keywords
    const itemKeywords = ['sword', 'armor', 'amulet', 'ring', 'staff', 'wand', 'potion', 'scroll', 'artifact'];

    if (itemKeywords.some(keyword => fileName.toLowerCase().includes(keyword)) ||
        this.isItemDocument(content)) {

      const name = this.extractMainItemName(fileName, content);
      if (name) {
        items.push({
          name,
          title: this.extractItemTitle(content),
          type: this.extractItemType(content),
          rarity: this.extractRarity(content),
          description: this.extractItemDescription(content),
          properties: this.extractItemProperties(content),
          history: this.extractHistory(content),
          creator: this.extractCreator(fileName, content),
          tags: this.generateTags(content, 'item')
        });
      }
    }

    return items;
  }

  private extractLocations(content: string, fileName: string): ExtractedLocation[] {
    const locations: ExtractedLocation[] = [];

    if (this.isLocationDocument(content) || fileName.toLowerCase().includes('city') || fileName.toLowerCase().includes('location')) {
      const name = this.extractMainLocationName(fileName, content);
      if (name) {
        locations.push({
          name,
          title: this.extractLocationTitle(content),
          type: this.extractLocationType(content),
          description: this.extractLocationDescription(content),
          population: this.extractPopulation(content),
          government: this.extractGovernment(content),
          economy: this.extractEconomy(content),
          history: this.extractHistory(content),
          tags: this.generateTags(content, 'location')
        });
      }
    }

    return locations;
  }

  private extractOrganizations(content: string, fileName: string): ExtractedOrganization[] {
    const organizations: ExtractedOrganization[] = [];

    if (this.isOrganizationDocument(content)) {
      const name = this.extractMainOrganizationName(fileName, content);
      if (name) {
        organizations.push({
          name,
          type: this.extractOrganizationType(content),
          description: this.extractOrganizationDescription(content),
          headquarters: this.extractHeadquarters(content),
          leader: this.extractLeader(content),
          goals: this.extractGoals(content),
          tags: this.generateTags(content, 'organization')
        });
      }
    }

    return organizations;
  }

  // Helper methods for extraction
  private isCharacterDocument(content: string): boolean {
    const indicators = ['race:', 'class:', 'level:', 'strength:', 'dexterity:', 'constitution:'];
    return indicators.some(indicator => content.toLowerCase().includes(indicator));
  }

  private isItemDocument(content: string): boolean {
    const indicators = ['rarity:', 'requires attunement', 'magical item', 'weapon', 'armor class'];
    return indicators.some(indicator => content.toLowerCase().includes(indicator));
  }

  private isLocationDocument(content: string): boolean {
    const indicators = ['population:', 'government:', 'economy:', 'notable locations'];
    return indicators.some(indicator => content.toLowerCase().includes(indicator));
  }

  private isOrganizationDocument(content: string): boolean {
    const indicators = ['leader:', 'headquarters:', 'members:', 'goals:', 'organization'];
    return indicators.some(indicator => content.toLowerCase().includes(indicator));
  }

  private extractMainCharacterName(fileName: string, content: string): string {
    // Extract from filename first
    const cleanName = fileName
      .replace(/\.(docx?|pdf)$/i, '')
      .replace(/\s+by\s+.+/i, '')
      .replace(/[_-]/g, ' ')
      .trim();

    if (cleanName && !cleanName.toLowerCase().includes('character')) {
      return cleanName;
    }

    // Look for name in content
    const lines = content.split('\n');
    for (const line of lines.slice(0, 5)) {
      const trimmed = line.trim();
      if (trimmed && trimmed.length < 50 && /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(trimmed)) {
        return trimmed;
      }
    }

    return cleanName;
  }

  private extractMainItemName(fileName: string, content: string): string {
    return fileName.replace(/\.(docx?|pdf)$/i, '').replace(/\s+by\s+.+/i, '').replace(/[_-]/g, ' ').trim();
  }

  private extractMainLocationName(fileName: string, content: string): string {
    return fileName.replace(/\.(docx?|pdf)$/i, '').replace(/\s+by\s+.+/i, '').replace(/[_-]/g, ' ').trim();
  }

  private extractMainOrganizationName(fileName: string, content: string): string {
    return fileName.replace(/\.(docx?|pdf)$/i, '').replace(/\s+by\s+.+/i, '').replace(/[_-]/g, ' ').trim();
  }

  private extractCharacterTitle(content: string): string | undefined {
    const titlePattern = /(?:title|epithet|known as)\s*:?\s*([^\n.]+)/i;
    const match = content.match(titlePattern);
    return match ? match[1].trim() : undefined;
  }

  private extractCharacterDescription(content: string): string {
    // Take first few sentences as description
    const sentences = content.split(/[.!?]+/).slice(0, 3);
    return sentences.join('. ').trim() + (sentences.length > 0 ? '.' : '');
  }

  private extractRace(content: string): string | undefined {
    const racePattern = /race\s*:?\s*([^\n.]+)/i;
    const match = content.match(racePattern);
    return match ? match[1].trim() : undefined;
  }

  private extractClass(content: string): string | undefined {
    const classPattern = /class\s*:?\s*([^\n.]+)/i;
    const match = content.match(classPattern);
    return match ? match[1].trim() : undefined;
  }

  private extractBackground(content: string): string | undefined {
    const backgroundPattern = /background\s*:?\s*([^\n]+(?:\n[^\n]+)*)/i;
    const match = content.match(backgroundPattern);
    return match ? match[1].trim() : undefined;
  }

  private extractItemTitle(content: string): string | undefined {
    const titlePattern = /(?:subtitle|aka|also known as)\s*:?\s*([^\n.]+)/i;
    const match = content.match(titlePattern);
    return match ? match[1].trim() : undefined;
  }

  private extractItemType(content: string): string {
    const typePattern = /(?:type|category|item type)\s*:?\s*([^\n.]+)/i;
    const match = content.match(typePattern);
    if (match) return match[1].trim();

    // Fallback to common item types
    const itemTypes = ['weapon', 'armor', 'artifact', 'consumable', 'accessory'];
    for (const type of itemTypes) {
      if (content.toLowerCase().includes(type)) {
        return type;
      }
    }

    return 'misc';
  }

  private extractRarity(content: string): string | undefined {
    const rarityPattern = /rarity\s*:?\s*(common|uncommon|rare|very\s+rare|legendary|artifact)/i;
    const match = content.match(rarityPattern);
    return match ? match[1].trim().toLowerCase() : undefined;
  }

  private extractItemDescription(content: string): string {
    const sentences = content.split(/[.!?]+/).slice(0, 2);
    return sentences.join('. ').trim() + (sentences.length > 0 ? '.' : '');
  }

  private extractItemProperties(content: string): string[] | undefined {
    const propertiesPattern = /properties?\s*:?\s*([^\n]+(?:\n[^\n:]+)*)/i;
    const match = content.match(propertiesPattern);
    if (match) {
      return match[1].split(/[,\n]/).map(p => p.trim()).filter(p => p);
    }
    return undefined;
  }

  private extractHistory(content: string): string | undefined {
    const historyPattern = /history\s*:?\s*([^\n]+(?:\n[^\n]+)*)/i;
    const match = content.match(historyPattern);
    return match ? match[1].trim() : undefined;
  }

  private extractLocationTitle(content: string): string | undefined {
    return this.extractCharacterTitle(content); // Same pattern
  }

  private extractLocationType(content: string): string {
    const typePattern = /(?:type|settlement type)\s*:?\s*([^\n.]+)/i;
    const match = content.match(typePattern);
    if (match) return match[1].trim();

    const locationTypes = ['city', 'town', 'village', 'fortress', 'dungeon', 'landmark'];
    for (const type of locationTypes) {
      if (content.toLowerCase().includes(type)) {
        return type;
      }
    }

    return 'landmark';
  }

  private extractLocationDescription(content: string): string {
    return this.extractCharacterDescription(content); // Same pattern
  }

  private extractPopulation(content: string): number | undefined {
    const populationPattern = /population\s*:?\s*([0-9,]+)/i;
    const match = content.match(populationPattern);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''));
    }
    return undefined;
  }

  private extractGovernment(content: string): string | undefined {
    const governmentPattern = /government\s*:?\s*([^\n.]+)/i;
    const match = content.match(governmentPattern);
    return match ? match[1].trim() : undefined;
  }

  private extractEconomy(content: string): string | undefined {
    const economyPattern = /economy\s*:?\s*([^\n.]+)/i;
    const match = content.match(economyPattern);
    return match ? match[1].trim() : undefined;
  }

  private extractOrganizationType(content: string): string {
    const typePattern = /(?:type|organization type)\s*:?\s*([^\n.]+)/i;
    const match = content.match(typePattern);
    if (match) return match[1].trim();

    const orgTypes = ['guild', 'order', 'government', 'religion', 'military', 'criminal'];
    for (const type of orgTypes) {
      if (content.toLowerCase().includes(type)) {
        return type;
      }
    }

    return 'guild';
  }

  private extractOrganizationDescription(content: string): string {
    return this.extractCharacterDescription(content); // Same pattern
  }

  private extractHeadquarters(content: string): string | undefined {
    const hqPattern = /headquarters\s*:?\s*([^\n.]+)/i;
    const match = content.match(hqPattern);
    return match ? match[1].trim() : undefined;
  }

  private extractLeader(content: string): string | undefined {
    const leaderPattern = /leader\s*:?\s*([^\n.]+)/i;
    const match = content.match(leaderPattern);
    return match ? match[1].trim() : undefined;
  }

  private extractGoals(content: string): string[] | undefined {
    const goalsPattern = /goals?\s*:?\s*([^\n]+(?:\n[^\n:]+)*)/i;
    const match = content.match(goalsPattern);
    if (match) {
      return match[1].split(/[,\n]/).map(g => g.trim()).filter(g => g);
    }
    return undefined;
  }

  private generateTags(content: string, type: string): string[] {
    const tags = [type];

    // Add common D&D tags based on content
    const tagMap = {
      'magic': ['magic', 'spell', 'arcane', 'divine'],
      'combat': ['weapon', 'armor', 'battle', 'fight'],
      'social': ['merchant', 'noble', 'diplomat', 'guild'],
      'exploration': ['dungeon', 'adventure', 'quest', 'treasure'],
      'undead': ['undead', 'skeleton', 'zombie', 'vampire'],
      'dragon': ['dragon', 'dragonborn', 'wyrm'],
      'fey': ['fey', 'fairy', 'pixie', 'archfey'],
      'fiend': ['fiend', 'demon', 'devil', 'infernal']
    };

    for (const [tag, keywords] of Object.entries(tagMap)) {
      if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
        tags.push(tag);
      }
    }

    return tags;
  }
}
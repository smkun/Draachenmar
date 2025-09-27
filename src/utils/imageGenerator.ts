interface CharacterDescription {
  name: string;
  description: string;
  type: 'character' | 'location' | 'item';
  chapter: string;
}

export class ImageGenerator {
  // Parse visual descriptions from text
  static parseDescriptions(text: string, chapter: string): CharacterDescription[] {
    const descriptions: CharacterDescription[] = [];

    // Character patterns
    const characterMatches = text.match(/### (.+?)\n\n(.+?)(?=\n### |\n## |$)/gs);
    if (characterMatches) {
      characterMatches.forEach(match => {
        const nameMatch = match.match(/### (.+)/);
        const descMatch = match.match(/\n\n(.+)/s);

        if (nameMatch && descMatch) {
          const name = nameMatch[1].trim();
          const desc = descMatch[1].trim();

          // Look for visual descriptors
          if (this.hasVisualDescriptors(desc)) {
            descriptions.push({
              name,
              description: desc,
              type: 'character',
              chapter
            });
          }
        }
      });
    }

    // Location patterns
    const locationMatches = text.match(/## (.+?)\n\n(.+?)(?=\n## |\n# |$)/gs);
    if (locationMatches) {
      locationMatches.forEach(match => {
        const nameMatch = match.match(/## (.+)/);
        const descMatch = match.match(/\n\n(.+)/s);

        if (nameMatch && descMatch) {
          const name = nameMatch[1].trim();
          const desc = descMatch[1].trim();

          // Look for architectural or environmental descriptors
          if (this.hasLocationDescriptors(desc)) {
            descriptions.push({
              name,
              description: desc,
              type: 'location',
              chapter
            });
          }
        }
      });
    }

    return descriptions;
  }

  private static hasVisualDescriptors(text: string): boolean {
    const visualKeywords = [
      'hair', 'eyes', 'beard', 'appearance', 'robes', 'armor', 'wearing',
      'silver', 'golden', 'emerald', 'blue', 'red', 'black', 'white',
      'tall', 'short', 'stout', 'elegant', 'beautiful', 'handsome',
      'shimmer', 'radiate', 'glow', 'ethereal', 'piercing'
    ];

    return visualKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private static hasLocationDescriptors(text: string): boolean {
    const locationKeywords = [
      'tower', 'castle', 'fortress', 'city', 'village', 'forest',
      'mountain', 'valley', 'river', 'stone', 'wood', 'marble',
      'ancient', 'massive', 'sprawling', 'magnificent', 'towering',
      'crystalline', 'golden', 'silver', 'carved', 'built'
    ];

    return locationKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Generate image prompt for AI image generation
  static generateImagePrompt(description: CharacterDescription): string {
    const baseStyle = "fantasy art, detailed, high quality, medieval fantasy setting, Dungeons & Dragons style";

    switch (description.type) {
      case 'character':
        return `${baseStyle}, fantasy character portrait, ${this.extractVisualElements(description.description)}`;

      case 'location':
        return `${baseStyle}, fantasy location, ${this.extractArchitecturalElements(description.description)}`;

      case 'item':
        return `${baseStyle}, fantasy magic item, ${this.extractItemElements(description.description)}`;

      default:
        return `${baseStyle}, ${description.description}`;
    }
  }

  private static extractVisualElements(text: string): string {
    const elements: string[] = [];

    // Hair
    if (text.includes('silver hair')) elements.push('silver hair');
    if (text.includes('golden hair')) elements.push('golden hair');
    if (text.includes('beard')) elements.push('bearded');

    // Eyes
    if (text.includes('emerald eyes')) elements.push('green eyes');
    if (text.includes('piercing eyes')) elements.push('piercing gaze');

    // Build
    if (text.includes('stout')) elements.push('stocky build');
    if (text.includes('tall')) elements.push('tall figure');
    if (text.includes('elegant')) elements.push('graceful');

    // Clothing/Armor
    if (text.includes('armor')) elements.push('wearing armor');
    if (text.includes('robes')) elements.push('wearing robes');
    if (text.includes('regal')) elements.push('royal attire');

    // Race hints
    if (text.toLowerCase().includes('dwarf')) elements.push('dwarf, dwarven');
    if (text.toLowerCase().includes('elf')) elements.push('elf, elven');
    if (text.toLowerCase().includes('human')) elements.push('human');

    return elements.join(', ');
  }

  private static extractArchitecturalElements(text: string): string {
    const elements: string[] = [];

    if (text.includes('fortress')) elements.push('massive fortress');
    if (text.includes('tower')) elements.push('tower');
    if (text.includes('castle')) elements.push('castle');
    if (text.includes('mountain')) elements.push('mountainous');
    if (text.includes('forest')) elements.push('forest setting');
    if (text.includes('stone')) elements.push('stone construction');
    if (text.includes('dwarven')) elements.push('dwarven architecture');
    if (text.includes('elven')) elements.push('elven architecture');

    return elements.join(', ');
  }

  private static extractItemElements(text: string): string {
    const elements: string[] = [];

    if (text.includes('sword')) elements.push('magical sword');
    if (text.includes('axe')) elements.push('battle axe');
    if (text.includes('hammer')) elements.push('war hammer');
    if (text.includes('amulet')) elements.push('mystical amulet');
    if (text.includes('ring')) elements.push('magic ring');
    if (text.includes('glowing')) elements.push('glowing with magic');
    if (text.includes('runes')) elements.push('runic inscriptions');

    return elements.join(', ');
  }

  // Generate placeholder image URL (could be replaced with actual AI generation service)
  static generatePlaceholderImage(description: CharacterDescription): string {
    const prompt = this.generateImagePrompt(description);
    const encodedPrompt = encodeURIComponent(prompt);

    // Using placeholder service that could be replaced with actual AI image generation
    // For now, using a service that generates images based on text
    return `https://api.placeholder.com/fantasy/${description.type}?prompt=${encodedPrompt}&width=400&height=400`;
  }

  // Create character card with image
  static createCharacterCard(description: CharacterDescription): string {
    const imageUrl = this.generatePlaceholderImage(description);
    const prompt = this.generateImagePrompt(description);

    return `
      <div class="character-card">
        <div class="character-image">
          <img src="/api/placeholder/400/400" alt="${description.name}" class="rounded-lg shadow-lg" />
          <div class="image-prompt" style="display: none;">${prompt}</div>
        </div>
        <div class="character-info">
          <h4 class="character-name">${description.name}</h4>
          <div class="character-description">${description.description}</div>
        </div>
      </div>
    `;
  }

  // Extract all descriptions from a markdown file
  static async extractDescriptionsFromChapter(chapterKey: string): Promise<CharacterDescription[]> {
    try {
      const response = await fetch(`/extracted-md/${this.getChapterFile(chapterKey)}`);
      const markdown = await response.text();
      return this.parseDescriptions(markdown, chapterKey);
    } catch (error) {
      console.error(`Error extracting descriptions from ${chapterKey}:`, error);
      return [];
    }
  }

  private static getChapterFile(chapterKey: string): string {
    const chapterFileMap: Record<string, string> = {
      'tribute': '01_tribute_dedication.md',
      'opening-story': '02_opening_story_chapter1.md',
      'gulanbarak': '03_gulanbarak_the_wall.md',
      'gray-order': '12_gray_order_bargothia.md',
      'pantheons': '04_pantheons_mythical_deities.md',
      'chronicles': '05_chronicles_legend_legacy.md',
      'great-woods': '06_great_woods_averlys.md',
      'dale-lands': '07_dale_lands_henge.md',
      'clockwork-city': '08_clockwork_city_kronus.md',
      'avalon-lineton': '09_avalon_lineton_vilos.md',
      'dark-territories': '10_dark_territories_badlands.md',
      'island-nations': '11_island_nations_uxmal_vandrhaf.md',
      'timeline': '13_timeline_calendar_system.md'
    };

    return chapterFileMap[chapterKey] || '';
  }
}
import { Character, Location, Item, Adventure, Organization } from '../types';

export class ExtractedDataParser {

  // Parse character data from extracted MD files
  static async parseCharacters(): Promise<Character[]> {
    const characters: Character[] = [];

    try {
      // Parse Gulanbarak characters
      const gulanabarakResponse = await fetch('/extracted-md/03_gulanbarak_the_wall.md');
      const gulanabarakText = await gulanabarakResponse.text();
      characters.push(...this.extractCharactersFromText(gulanabarakText, 'gulanbarak'));

      // Parse Great Woods characters
      const greatWoodsResponse = await fetch('/extracted-md/06_great_woods_averlys.md');
      const greatWoodsText = await greatWoodsResponse.text();
      characters.push(...this.extractCharactersFromText(greatWoodsText, 'great-woods'));

      // Parse Dale Lands characters
      const daleLandsResponse = await fetch('/extracted-md/07_dale_lands_henge.md');
      const daleLandsText = await daleLandsResponse.text();
      characters.push(...this.extractCharactersFromText(daleLandsText, 'dale-lands'));

      // Parse Clockwork City characters
      const clockworkResponse = await fetch('/extracted-md/08_clockwork_city_kronus.md');
      const clockworkText = await clockworkResponse.text();
      characters.push(...this.extractCharactersFromText(clockworkText, 'clockwork-city'));

      // Parse other regions...
      const avalonResponse = await fetch('/extracted-md/09_avalon_lineton_vilos.md');
      const avalonText = await avalonResponse.text();
      characters.push(...this.extractCharactersFromText(avalonText, 'avalon'));

      const darkTerritoriesResponse = await fetch('/extracted-md/10_dark_territories_badlands.md');
      const darkTerritoriesText = await darkTerritoriesResponse.text();
      characters.push(...this.extractCharactersFromText(darkTerritoriesText, 'dark-territories'));

      const islandNationsResponse = await fetch('/extracted-md/11_island_nations_uxmal_vandrhaf.md');
      const islandNationsText = await islandNationsResponse.text();
      characters.push(...this.extractCharactersFromText(islandNationsText, 'island-nations'));

    } catch (error) {
      console.error('Error parsing characters:', error);
    }

    return characters;
  }

  static extractCharactersFromText(text: string, region: string): Character[] {
    const characters: Character[] = [];

    // Find character sections (### headers with character names)
    const characterMatches = text.match(/### (.+?)\n\n([\s\S]*?)(?=\n### |\n## |\n# |$)/g);

    if (characterMatches) {
      characterMatches.forEach((match, index) => {
        const nameMatch = match.match(/### (.+)/);
        const contentMatch = match.match(/\n\n([\s\S]+)/);

        if (nameMatch && contentMatch) {
          const name = nameMatch[1].trim();
          const description = contentMatch[1].trim();

          // Skip if it's not actually a character (e.g., location headers)
          if (this.isCharacter(name, description)) {
            const character: Character = {
              id: this.generateId(name, region),
              name: name,
              category: 'npc',
              description: description,
              creator: 'Campaign Setting',
              tags: this.generateTags(name, description, region),
              race: this.extractRace(description),
              class: this.extractClass(description),
              location: region
            };

            characters.push(character);
          }
        }
      });
    }

    return characters;
  }

  static isCharacter(name: string, description: string): boolean {
    // Check if this is actually a character vs a location/building
    const characterIndicators = [
      'king', 'queen', 'prince', 'princess', 'captain', 'lord', 'lady',
      'high counselor', 'archdruid', 'ambassador', 'master', 'elder',
      'ruler', 'leader', 'commander', 'advisor', 'mage', 'wizard',
      'dwarf', 'elf', 'human', 'gnome', 'halfling'
    ];

    const nonCharacterIndicators = [
      'building', 'tower', 'hall', 'district', 'academy', 'market',
      'quarter', 'section', 'area', 'location', 'place'
    ];

    const lowerName = name.toLowerCase();
    const lowerDesc = description.toLowerCase();

    // If it has non-character indicators, skip it
    if (nonCharacterIndicators.some(indicator =>
      lowerName.includes(indicator) || lowerDesc.includes(indicator))) {
      return false;
    }

    // If it has character indicators or personal pronouns, it's likely a character
    return characterIndicators.some(indicator =>
      lowerName.includes(indicator) || lowerDesc.includes(indicator)) ||
      lowerDesc.includes(' he ') || lowerDesc.includes(' she ') ||
      lowerDesc.includes(' his ') || lowerDesc.includes(' her ');
  }

  static generateId(name: string, region: string): string {
    return `${region}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }

  static generateTags(name: string, description: string, region: string): string[] {
    const tags = ['character', region];

    const lowerDesc = description.toLowerCase();
    const lowerName = name.toLowerCase();

    // Role-based tags
    if (lowerName.includes('king') || lowerName.includes('queen')) tags.push('royalty');
    if (lowerName.includes('captain') || lowerName.includes('commander')) tags.push('military');
    if (lowerName.includes('mage') || lowerName.includes('wizard') || lowerDesc.includes('magic')) tags.push('magic');
    if (lowerName.includes('priest') || lowerName.includes('cleric') || lowerDesc.includes('divine')) tags.push('divine');
    if (lowerName.includes('merchant') || lowerDesc.includes('trade')) tags.push('commerce');

    // Race-based tags
    if (lowerDesc.includes('dwarf')) tags.push('dwarf');
    if (lowerDesc.includes('elf')) tags.push('elf');
    if (lowerDesc.includes('human')) tags.push('human');
    if (lowerDesc.includes('gnome')) tags.push('gnome');

    return tags;
  }

  static extractRace(description: string): string | undefined {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('dwarf')) return 'Dwarf';
    if (lowerDesc.includes('elf')) return 'Elf';
    if (lowerDesc.includes('human')) return 'Human';
    if (lowerDesc.includes('gnome')) return 'Gnome';
    if (lowerDesc.includes('halfling')) return 'Halfling';
    if (lowerDesc.includes('dragonborn')) return 'Dragonborn';

    return undefined;
  }

  static extractClass(description: string): string | undefined {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('warrior') || lowerDesc.includes('fighter')) return 'Fighter';
    if (lowerDesc.includes('mage') || lowerDesc.includes('wizard')) return 'Wizard';
    if (lowerDesc.includes('priest') || lowerDesc.includes('cleric')) return 'Cleric';
    if (lowerDesc.includes('ranger')) return 'Ranger';
    if (lowerDesc.includes('rogue') || lowerDesc.includes('scout')) return 'Rogue';
    if (lowerDesc.includes('paladin')) return 'Paladin';
    if (lowerDesc.includes('bard')) return 'Bard';
    if (lowerDesc.includes('druid')) return 'Druid';

    return 'Noble'; // Default for rulers/nobles
  }

  // Parse location data
  static async parseLocations(): Promise<Location[]> {
    const locations: Location[] = [];

    try {
      // Parse major locations from each file
      const files = [
        '03_gulanbarak_the_wall.md',
        '06_great_woods_averlys.md',
        '07_dale_lands_henge.md',
        '08_clockwork_city_kronus.md',
        '09_avalon_lineton_vilos.md',
        '10_dark_territories_badlands.md',
        '11_island_nations_uxmal_vandrhaf.md'
      ];

      for (const file of files) {
        const response = await fetch(`/extracted-md/${file}`);
        const text = await response.text();
        const region = file.split('_')[1] || 'unknown';
        locations.push(...this.extractLocationsFromText(text, region));
      }

    } catch (error) {
      console.error('Error parsing locations:', error);
    }

    return locations;
  }

  static extractLocationsFromText(text: string, region: string): Location[] {
    const locations: Location[] = [];

    // Find location sections (## headers for major locations)
    const locationMatches = text.match(/## (.+?)\n\n([\s\S]*?)(?=\n## |\n# |$)/g);

    if (locationMatches) {
      locationMatches.forEach(match => {
        const nameMatch = match.match(/## (.+)/);
        const contentMatch = match.match(/\n\n([\s\S]+)/);

        if (nameMatch && contentMatch) {
          const name = nameMatch[1].trim();
          const description = contentMatch[1].trim();

          if (this.isLocation(name, description)) {
            const location: Location = {
              id: this.generateId(name, region),
              name: name,
              category: 'settlement',
              description: description,
              creator: 'Campaign Setting',
              tags: this.generateLocationTags(name, description, region),
              region: region
            };

            locations.push(location);
          }
        }
      });
    }

    return locations;
  }

  static isLocation(name: string, description: string): boolean {
    const locationIndicators = [
      'city', 'town', 'village', 'fortress', 'castle', 'tower',
      'academy', 'market', 'quarter', 'district', 'hall',
      'temple', 'shrine', 'palace', 'stronghold'
    ];

    const lowerName = name.toLowerCase();
    const lowerDesc = description.toLowerCase();

    return locationIndicators.some(indicator =>
      lowerName.includes(indicator) || lowerDesc.includes(indicator)) ||
      lowerDesc.includes('located') || lowerDesc.includes('situated');
  }

  static generateLocationTags(name: string, description: string, region: string): string[] {
    const tags = ['location', region];

    const lowerDesc = description.toLowerCase();
    const lowerName = name.toLowerCase();

    if (lowerName.includes('city') || lowerName.includes('capital')) tags.push('city');
    if (lowerName.includes('fortress') || lowerName.includes('stronghold')) tags.push('fortress');
    if (lowerName.includes('academy') || lowerName.includes('university')) tags.push('education');
    if (lowerName.includes('market') || lowerDesc.includes('trade')) tags.push('commerce');
    if (lowerName.includes('temple') || lowerName.includes('shrine')) tags.push('religious');

    return tags;
  }
}
export interface ChapterData {
  title: string;
  subtitle?: string;
  content: string;
  nextChapter?: string;
  prevChapter?: string;
  pageNumbers: string;
}

export class MarkdownLoader {
  private static chapterOrder = [
    'tribute',
    'opening-story',
    'gulanbarak',
    'gray-order',
    'pantheons',
    'chronicles',
    'great-woods',
    'dale-lands',
    'clockwork-city',
    'avalon-lineton',
    'dark-territories',
    'island-nations',
    'timeline'
  ];

  private static chapterFileMap: Record<string, string> = {
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

  private static chapterTitles: Record<string, string> = {
    'tribute': 'Tribute & Dedication',
    'opening-story': 'Chapter I: Shining Bargothia Lies in Ruins',
    'gulanbarak': 'Chapter II: Gulanbarak - The Wall',
    'gray-order': 'Chapter III: The Gray Order - Seekers of Bargothia\'s Secrets',
    'pantheons': 'Chapter IV: A World Beyond Mortals - Draachenmar\'s Mythical Deities',
    'chronicles': 'Chapter V: Chronicles of Legend and Legacy',
    'great-woods': 'Appendix A: The Great Woods of Averlys',
    'dale-lands': 'Appendix B: The Dale Lands and Henge',
    'clockwork-city': 'Appendix C: The Clockwork City of Kronus',
    'avalon-lineton': 'Appendix D: Avalon, Lineton, and Vilos',
    'dark-territories': 'Appendix E: The Dark Territories and Badlands',
    'island-nations': 'Appendix F: Island Nations - Uxmal and Vandrhaf',
    'timeline': 'Appendix G: Timeline and Calendar System'
  };

  private static pageNumbers: Record<string, string> = {
    'tribute': '1-2',
    'opening-story': '3-18',
    'gulanbarak': '19-45',
    'gray-order': '46-58',
    'pantheons': '59-78',
    'chronicles': '79-94',
    'great-woods': '95-102',
    'dale-lands': '103-125',
    'clockwork-city': '126-150',
    'avalon-lineton': '151-175',
    'dark-territories': '176-200',
    'island-nations': '201-225',
    'timeline': '226-235'
  };

  static async loadChapter(chapterKey: string): Promise<ChapterData | null> {
    try {
      const fileName = this.chapterFileMap[chapterKey];
      if (!fileName) {
        return null;
      }

      const response = await fetch(`/extracted-md/${fileName}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${fileName}`);
      }

      const markdownContent = await response.text();
      const processedContent = this.processMarkdown(markdownContent);

      return {
        title: this.chapterTitles[chapterKey] || 'Unknown Chapter',
        content: processedContent,
        pageNumbers: this.pageNumbers[chapterKey] || '1',
        nextChapter: this.getNextChapter(chapterKey),
        prevChapter: this.getPrevChapter(chapterKey)
      };
    } catch (error) {
      console.error(`Error loading chapter ${chapterKey}:`, error);

      // Return fallback content
      return {
        title: this.chapterTitles[chapterKey] || 'Unknown Chapter',
        content: this.getFallbackContent(chapterKey),
        pageNumbers: this.pageNumbers[chapterKey] || '1',
        nextChapter: this.getNextChapter(chapterKey),
        prevChapter: this.getPrevChapter(chapterKey)
      };
    }
  }

  private static processMarkdown(markdown: string): string {
    // Convert markdown to HTML
    let html = markdown;

    // Handle headers
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');

    // Special handling for timeline entries
    if (markdown.includes('Timeline') || markdown.includes('Historical Timeline')) {
      // Convert timeline bullets to proper timeline entries
      html = html.replace(/^- \*\*Year (\d+) AF\*\* - (.+)$/gm,
        '<div class="timeline-entry"><span class="timeline-year">Year $1 AF</span><span class="timeline-event">$2</span></div>');

      // Handle era headers in timeline
      html = html.replace(/^### (.+Era.*)$/gm, '<h3 class="timeline-era">$1</h3>');
    }

    // Handle character sections with visual descriptions
    html = this.processCharacterSections(html);

    // Handle location sections
    html = this.processLocationSections(html);

    // Handle emphasis
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Handle lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li>.*<\/li>\s*)+/gs, '<ul>$&</ul>');

    // Handle paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<div class="timeline-entry">)/g, '$1');
    html = html.replace(/(<\/div>)<\/p>/g, '$1');
    html = html.replace(/<p>(<div class="character-card">)/g, '$1');
    html = html.replace(/(<\/div>)<\/p>/g, '$1');

    // Handle blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    return html;
  }

  private static processCharacterSections(html: string): string {
    // Find character sections (### headers followed by descriptions with visual elements)
    const characterPattern = /(<h3>(.+?)<\/h3>)(.*?)(?=<h[23]>|$)/gs;

    return html.replace(characterPattern, (match, header, name, content) => {
      // Check if content has visual descriptors
      if (this.hasVisualDescriptors(content)) {
        const cleanName = name.trim();
        const imagePrompt = this.generateCharacterPrompt(content);

        return `
          <div class="character-card">
            <div class="character-image">
              <img src="https://via.placeholder.com/200x240/f3f4f6/374151?text=${encodeURIComponent(cleanName)}"
                   alt="${cleanName}"
                   title="AI Prompt: ${imagePrompt}" />
            </div>
            <div class="character-info">
              <h4 class="character-name">${cleanName}</h4>
              <div class="character-description">${content}</div>
            </div>
          </div>
        `;
      }
      return match;
    });
  }

  private static processLocationSections(html: string): string {
    // Find location sections that are major landmarks
    const locationPattern = /(<h2>(.+?)<\/h2>)(.*?)(?=<h[12]>|$)/gs;

    return html.replace(locationPattern, (match, header, name, content) => {
      // Check if it's a significant location (not just organizational headers)
      if (this.hasLocationDescriptors(content) && content.length > 200) {
        const cleanName = name.trim();
        const imagePrompt = this.generateLocationPrompt(content);

        return `
          <div class="location-card">
            <div class="location-image">
              <img src="https://via.placeholder.com/250x128/f0fdf4/166534?text=${encodeURIComponent(cleanName)}"
                   alt="${cleanName}"
                   title="AI Prompt: ${imagePrompt}" />
            </div>
            <div class="location-info">
              <h3 class="location-name">${cleanName}</h3>
              <div class="location-description">${content}</div>
            </div>
          </div>
        `;
      }
      return match;
    });
  }

  private static hasVisualDescriptors(text: string): boolean {
    const visualKeywords = [
      'hair', 'eyes', 'beard', 'appearance', 'wearing', 'robes', 'armor',
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
      'fortress', 'castle', 'city', 'tower', 'palace', 'temple',
      'mountain', 'forest', 'valley', 'river', 'bridge',
      'stone', 'marble', 'crystal', 'golden', 'silver',
      'massive', 'towering', 'ancient', 'magnificent', 'sprawling'
    ];

    return locationKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private static generateCharacterPrompt(description: string): string {
    const elements: string[] = ['fantasy character portrait', 'detailed', 'medieval fantasy'];

    // Race detection
    if (description.toLowerCase().includes('dwarf')) elements.push('dwarf', 'dwarven');
    if (description.toLowerCase().includes('elf')) elements.push('elf', 'elven');
    if (description.toLowerCase().includes('human')) elements.push('human');

    // Physical features
    if (description.includes('silver hair')) elements.push('silver hair');
    if (description.includes('emerald eyes')) elements.push('green eyes');
    if (description.includes('beard')) elements.push('bearded');
    if (description.includes('stout')) elements.push('stocky build');
    if (description.includes('elegant')) elements.push('graceful');

    // Clothing/Role
    if (description.includes('armor')) elements.push('wearing armor');
    if (description.includes('robes')) elements.push('wearing robes');
    if (description.includes('king') || description.includes('queen')) elements.push('royal');
    if (description.includes('warrior')) elements.push('warrior');
    if (description.includes('mage')) elements.push('spellcaster');

    return elements.join(', ');
  }

  private static generateLocationPrompt(description: string): string {
    const elements: string[] = ['fantasy location', 'detailed', 'medieval fantasy setting'];

    if (description.includes('fortress')) elements.push('massive fortress');
    if (description.includes('castle')) elements.push('castle');
    if (description.includes('tower')) elements.push('towers');
    if (description.includes('mountain')) elements.push('mountainous');
    if (description.includes('forest')) elements.push('forest setting');
    if (description.includes('dwarven')) elements.push('dwarven architecture');
    if (description.includes('elven')) elements.push('elven architecture');
    if (description.includes('stone')) elements.push('stone construction');

    return elements.join(', ');
  }

  private static getNextChapter(chapterKey: string): string | undefined {
    const currentIndex = this.chapterOrder.indexOf(chapterKey);
    return currentIndex < this.chapterOrder.length - 1 ? this.chapterOrder[currentIndex + 1] : undefined;
  }

  private static getPrevChapter(chapterKey: string): string | undefined {
    const currentIndex = this.chapterOrder.indexOf(chapterKey);
    return currentIndex > 0 ? this.chapterOrder[currentIndex - 1] : undefined;
  }

  private static getFallbackContent(chapterKey: string): string {
    switch (chapterKey) {
      case 'tribute':
        return `<h1>Tribute & Dedication</h1>
        <p>In memory of Tony, whose imagination helped bring this world to life.</p>
        <p>Special thanks to all the players and contributors who have shaped the Chronicles of Draachenmar through their adventures, creativity, and dedication to this campaign world.</p>`;

      case 'opening-story':
        return `<h1>Chapter 1: Shining Bargothia Lies in Ruins</h1>
        <h2>The Fall of a Great Civilization</h2>
        <p>The Jade and Pearl towers are cracked and broken, crumbling away into dust on the city streets and flotsam in the wrecked harbors of her ancient cities. The great fields of Achenor have been sown with bones and watered with the blood of the fallen people of Bargothia.</p>
        <p>The Great Vale of Khartun, once renowned for rolling hills painted with Dragon Poppies, Lily Trees, and wildflowers is now grey and ruined, a desolate wasteland. Flowers will no longer grow there, at the site of the final stand of the Bargothian armies.</p>
        <h2>The Emissary's Crash and The Wound</h2>
        <p>Over two hundred and fifty years ago, a fragment splintered from the centennial comet called The Emissary as it passed over the skies of Bargothia and crashed to earth in the Orc Kettles...</p>`;

      default:
        return `<h1>${this.chapterTitles[chapterKey] || 'Unknown Chapter'}</h1>
        <p><em>This chapter's content is being prepared from the extracted documents.</em></p>
        <p>The rich narrative content for this section will include detailed descriptions, character backgrounds, location information, and historical context as found in the original Draachenmar documentation.</p>
        <p><em>Please check back as we continue to integrate the complete extracted content.</em></p>`;
    }
  }

  static getAllChapters() {
    return this.chapterOrder.map(key => ({
      key,
      title: this.chapterTitles[key],
      pages: this.pageNumbers[key]
    }));
  }
}
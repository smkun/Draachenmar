# Draachenmar Encyclopedia

A comprehensive online encyclopedia for the Draachenmar campaign world, built with modern web technologies.

## Features

### 🏰 **Campaign World Content**

- **Characters**: Heroes, villains, NPCs, and notable figures
- **Locations**: Cities, towns, fortresses, and mysterious places
- **Items**: Magical artifacts, weapons, and wondrous items
- **Adventures**: Epic quests and campaign scenarios
- **Organizations**: Guilds, orders, and factions

### 🔍 **Advanced Search & Filtering**

- Fuzzy search with Fuse.js
- Category-based filtering
- Tag-based organization
- Type and rarity filters
- Real-time search results

### 🎨 **Fantasy-Themed Design**

- Parchment-style backgrounds
- Medieval fantasy color palette
- Responsive card layouts
- Custom typography with fantasy fonts
- Icon-based navigation

### 📱 **Modern User Experience**

- Fully responsive design
- Fast client-side routing
- Interactive search suggestions
- Detailed entry pages
- Statistics dashboard

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom fantasy theme
- **Icons**: Lucide React
- **Search**: Fuse.js for fuzzy search
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Development**: ESLint + TypeScript

## Project Structure

```plaintext
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Site footer
│   └── EntryCard.tsx   # Content card component
├── pages/              # Route components
│   ├── HomePage.tsx    # Landing page
│   ├── CategoryPage.tsx # Category listing
│   ├── DetailPage.tsx  # Individual entry details
│   └── SearchPage.tsx  # Search interface
├── data/               # Campaign data
│   ├── characters.ts   # Character definitions
│   ├── locations.ts    # Location definitions
│   ├── items.ts        # Item definitions
│   ├── adventures.ts   # Adventure definitions
│   ├── organizations.ts # Organization definitions
│   └── index.ts        # Data aggregation
├── hooks/              # Custom React hooks
│   └── useSearch.ts    # Search functionality
├── types/              # TypeScript definitions
│   └── index.ts        # Type definitions
└── index.css          # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Data Structure

The encyclopedia is built around five main content types:

### Characters

```typescript
interface Character {
  id: string;
  name: string;
  title?: string;
  race?: string;
  class?: string;
  location?: string;
  description?: string;
  background?: string;
  category: 'npc' | 'player' | 'deity' | 'antagonist' | 'historical';
  tags: string[];
  creator?: string;
}
```

### Locations

```typescript
interface Location {
  id: string;
  name: string;
  type: 'city' | 'town' | 'village' | 'fortress' | 'landmark' | 'region' | 'dungeon';
  population?: number;
  description?: string;
  history?: string;
  government?: string;
  economy?: string;
  tags: string[];
}
```

### Items

```typescript
interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'artifact' | 'mundane';
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact';
  description?: string;
  properties?: string[];
  history?: string;
  tags: string[];
  creator?: string;
}
```

## Adding New Content

### Adding Characters

1. Open `src/data/characters.ts`
2. Add a new character object to the array:

   ```typescript
   {
     id: 'unique-character-id',
     name: 'Character Name',
     race: 'Human',
     class: 'Fighter',
     description: 'Character description...',
     category: 'npc',
     tags: ['warrior', 'noble'],
     creator: 'Player Name'
   }
   ```

### Adding Locations

1. Open `src/data/locations.ts`
2. Add a new location object with coordinates for map placement

### Adding Items

1. Open `src/data/items.ts`
2. Include rarity and properties for mechanical effects

## Content Statistics

- **Characters**: 10 entries (NPCs, player characters)
- **Locations**: 10 major cities, towns, and landmarks
- **Items**: 10 magical artifacts and weapons
- **Adventures**: 10 campaign scenarios
- **Organizations**: 10 guilds, orders, and factions
- **Total Tags**: 100+ for detailed categorization

## Player Contributions

The encyclopedia includes content created by players:

- Custom characters and backstories
- Unique magical items
- Original locations and lore
- Personal campaign additions

## Features Roadmap

### Phase 1 ✅ (Current)

- [x] Basic encyclopedia structure
- [x] Search and filtering
- [x] Responsive design
- [x] Content categorization

### Phase 2 🔄 (Future)

- [ ] Interactive world map
- [ ] Image gallery integration
- [ ] Content relationships/linking
- [ ] Advanced statistics
- [ ] Export functionality

### Phase 3 📋 (Planned)

- [ ] User accounts and favorites
- [ ] Community contributions
- [ ] Campaign session tracking
- [ ] PDF generation
- [ ] Mobile app

## Contributing

To add new content or features:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-content`
3. **Add your content** to the appropriate data files
4. **Test locally**: `npm run dev`
5. **Submit a pull request**

## License

This project is built for personal campaign use. All campaign content belongs to the respective creators and the campaign world.

## Acknowledgments

- **Campaign Creator**: Original Draachenmar world design
- **Player Contributors**: Custom characters, items, and lore
- **Community**: Feedback and content suggestions

---

Built with ⚔️ for the Draachenmar campaign world

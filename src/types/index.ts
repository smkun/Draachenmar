export interface Character {
  id: string;
  name: string;
  title?: string;
  race?: string;
  class?: string;
  level?: number;
  location?: string;
  description?: string;
  background?: string;
  personality?: string;
  appearance?: string;
  image?: string;
  category: 'npc' | 'player' | 'deity' | 'antagonist' | 'historical';
  tags: string[];
  creator?: string;
  source?: ContentSource;
  relationships?: Relationship[];
  stats?: CharacterStats;
  abilities?: string[];
}

export interface LocationEstablishment {
  name: string;
  type: string;
  description: string;
  proprietor?: string;
}

export interface LocationFigure {
  name: string;
  race: string;
  role: string;
  description: string;
}

export interface LocationFestival {
  name: string;
  description: string;
}

export interface Location {
  id: string;
  name: string;
  title?: string;
  type: 'city' | 'town' | 'village' | 'fortress' | 'landmark' | 'region' | 'dungeon' | 'forest' | 'kingdom' | 'realm' | 'island';
  category?: string;
  region?: string;
  population?: string;
  description?: string;
  history?: string;
  government?: string;
  economy?: string;
  challenges?: string;
  image?: string;
  establishments?: LocationEstablishment[];
  notableFigures?: LocationFigure[];
  festivals?: LocationFestival[];
  tags: string[];
  creator?: string;
  coordinates?: {
    x: number;
    y: number;
  };
}

export interface Item {
  id: string;
  name: string;
  title?: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'artifact' | 'mundane';
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact';
  description?: string;
  properties?: string[];
  history?: string;
  lore?: string;
  image?: string;
  gallery?: string[];
  tags: string[];
  creator?: string;
  owner?: string;
  source?: ContentSource;
  relatedItems?: string[];
  relatedCharacters?: string[];
  currentLocation?: string;
  gameStats?: ItemStats;
}

export interface Adventure {
  id: string;
  name: string;
  title: string;
  description?: string;
  level?: string;
  duration?: string;
  locations: string[];
  characters: string[];
  items?: string[];
  image?: string;
  tags: string[];
  summary?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'guild' | 'order' | 'government' | 'religion' | 'military' | 'criminal' | 'pantheon';
  description?: string;
  headquarters?: string;
  leader?: string;
  members?: string[];
  goals?: string[];
  image?: string;
  tags: string[];
}

export interface Deity {
  id: string;
  name: string;
  title?: string;
  pantheon?: string;
  domain: string[];
  alignment: string;
  description?: string;
  appearance?: string;
  location?: string;
  holySymbol?: string;
  festivals?: string[];
  worshipers?: string[];
  image?: string;
  tags: string[];
  creator?: string;
  source?: ContentSource;
}

export type ContentCategory = 'people' | 'places' | 'items' | 'adventures' | 'organizations' | 'pantheons';

export interface SearchFilters {
  category?: ContentCategory;
  tags?: string[];
  type?: string;
  rarity?: string;
  creator?: string;
}

export interface EncyclopediaEntry {
  id: string;
  category: ContentCategory;
  data: Character | Location | Item | Adventure | Organization | Deity;
}

// Enhanced supporting types
export interface ContentSource {
  document?: string;
  creator?: string;
  dateCreated?: string;
  lastModified?: string;
  campaign?: string;
  session?: number;
}

export interface Relationship {
  type: 'ally' | 'enemy' | 'family' | 'friend' | 'rival' | 'mentor' | 'student' | 'neutral';
  targetId: string;
  targetName: string;
  targetCategory: ContentCategory;
  description?: string;
}

export interface CharacterStats {
  level?: number;
  hitPoints?: number;
  armorClass?: number;
  attributes?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  savingThrows?: string[];
  skills?: string[];
}

export interface ItemStats {
  attackBonus?: string;
  damage?: string;
  damageType?: string;
  armorClass?: number;
  weight?: number;
  value?: string;
  attunement?: boolean;
  charges?: number;
  spellSaveDC?: number;
}

export interface ImageGallery {
  id: string;
  entryId: string;
  category: ContentCategory;
  images: GalleryImage[];
}

export interface GalleryImage {
  url: string;
  caption?: string;
  alt: string;
  thumbnail?: string;
  type: 'character-portrait' | 'item-art' | 'location-map' | 'scene' | 'other';
}

export interface CrossReference {
  fromId: string;
  fromCategory: ContentCategory;
  toId: string;
  toCategory: ContentCategory;
  relationship: string;
  context?: string;
}

export interface ContentMetadata {
  totalEntries: number;
  lastUpdated: string;
  contributors: string[];
  campaigns: string[];
  version: string;
}
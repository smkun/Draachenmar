import { characters } from './characters';
import { locations } from './locations';
import { items } from './items';
import { adventures } from './adventures';
import { organizations } from './organizations';
import { deities } from './deities';
import { EncyclopediaEntry, ContentCategory } from '../types';

export const allData = {
  characters,
  locations,
  items,
  adventures,
  organizations,
  deities,
};

export const getAllEntries = (): EncyclopediaEntry[] => {
  const entries: EncyclopediaEntry[] = [];

  characters.forEach(character => {
    entries.push({
      id: character.id,
      category: 'people',
      data: character,
    });
  });

  locations.forEach(location => {
    entries.push({
      id: location.id,
      category: 'places',
      data: location,
    });
  });

  items.forEach(item => {
    entries.push({
      id: item.id,
      category: 'items',
      data: item,
    });
  });

  adventures.forEach(adventure => {
    entries.push({
      id: adventure.id,
      category: 'adventures',
      data: adventure,
    });
  });

  organizations.forEach(organization => {
    entries.push({
      id: organization.id,
      category: 'organizations',
      data: organization,
    });
  });

  deities.forEach(deity => {
    entries.push({
      id: deity.id,
      category: 'pantheons',
      data: deity,
    });
  });

  return entries;
};

export const getEntriesByCategory = (category: ContentCategory) => {
  return getAllEntries().filter(entry => entry.category === category);
};

export const getEntryById = (id: string) => {
  return getAllEntries().find(entry => entry.id === id);
};

export const getAllTags = () => {
  const tags = new Set<string>();
  getAllEntries().forEach(entry => {
    const data = entry.data as any;
    if (data.tags) {
      data.tags.forEach((tag: string) => tags.add(tag));
    }
  });
  return Array.from(tags).sort();
};

export const getStatistics = () => {
  const entries = getAllEntries();
  const pantheons = organizations.filter(org => org.type === 'pantheon').length;

  return {
    total: entries.length,
    characters: characters.length,
    locations: locations.length,
    items: items.length,
    adventures: adventures.length,
    organizations: organizations.length,
    deities: deities.length,
    pantheons: pantheons,
    totalTags: getAllTags().length,
  };
};
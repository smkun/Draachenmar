import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { getAllEntries } from '../data';
import { EncyclopediaEntry, SearchFilters } from '../types';

export function useSearch() {
  const [filters, setFilters] = useState<SearchFilters>({});

  const allEntries = getAllEntries();

  const fuse = useMemo(() => {
    return new Fuse(allEntries, {
      keys: [
        { name: 'data.name', weight: 2 },
        { name: 'data.title', weight: 1.5 },
        { name: 'data.description', weight: 1 },
        { name: 'data.tags', weight: 1.2 },
        { name: 'data.creator', weight: 0.8 },
        { name: 'data.location', weight: 0.8 },
        { name: 'data.type', weight: 0.9 },
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
    });
  }, [allEntries]);

  const search = (query: string): EncyclopediaEntry[] => {
    if (!query.trim()) {
      return applyFilters(allEntries);
    }

    const results = fuse.search(query.trim());
    const entries = results.map(result => result.item);
    return applyFilters(entries);
  };

  const applyFilters = (entries: EncyclopediaEntry[]): EncyclopediaEntry[] => {
    let filtered = entries;

    if (filters.category) {
      filtered = filtered.filter(entry => entry.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(entry => {
        const entryTags = (entry.data as any).tags || [];
        return filters.tags!.some(tag => entryTags.includes(tag));
      });
    }

    if (filters.type) {
      filtered = filtered.filter(entry => {
        const entryType = (entry.data as any).type;
        return entryType === filters.type;
      });
    }

    if (filters.rarity) {
      filtered = filtered.filter(entry => {
        const entryRarity = (entry.data as any).rarity;
        return entryRarity === filters.rarity;
      });
    }

    if (filters.creator) {
      filtered = filtered.filter(entry => {
        const entryCreator = (entry.data as any).creator;
        return entryCreator === filters.creator;
      });
    }

    return filtered;
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    search,
    filters,
    updateFilters,
    clearFilters,
    applyFilters,
  };
}
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Tag, User, MapPin, Sword, Scroll, Shield, SlidersHorizontal } from 'lucide-react';
import { allData } from '../data';
import { ContentCategory } from '../types';

interface SearchFilters {
  categories: ContentCategory[];
  tags: string[];
  creators: string[];
  races: string[];
  classes: string[];
  locations: string[];
  hasImage: boolean | null;
  hasRelationships: boolean | null;
  sortBy: 'relevance' | 'name' | 'category' | 'creator';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClear: () => void;
  className?: string;
}

export function AdvancedSearch({ onSearch, onClear, className = '' }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    tags: [],
    creators: [],
    races: [],
    classes: [],
    locations: [],
    hasImage: null,
    hasRelationships: null,
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  // Get all available filter options from data
  const data = allData;
  const [filterOptions, setFilterOptions] = useState({
    tags: [] as string[],
    creators: [] as string[],
    races: [] as string[],
    classes: [] as string[],
    locations: [] as string[]
  });

  useEffect(() => {
    // Extract unique values for filter options
    const allEntries = [
      ...data.characters,
      ...data.locations,
      ...data.items,
      ...data.adventures,
      ...data.organizations
    ];

    const tags = new Set<string>();
    const creators = new Set<string>();
    const races = new Set<string>();
    const classes = new Set<string>();
    const locations = new Set<string>();

    allEntries.forEach(entry => {
      // Tags
      if (entry.tags) {
        entry.tags.forEach(tag => tags.add(tag));
      }

      // Creators
      if (entry.creator && entry.creator !== 'Campaign Setting') {
        creators.add(entry.creator);
      }

      // Character-specific filters
      if ('race' in entry && entry.race) {
        races.add(entry.race);
      }
      if ('class' in entry && entry.class) {
        classes.add(entry.class);
      }

      // Location names for geographic filtering
      if ('location' in entry && entry.location) {
        locations.add(entry.location);
      }
      if (entry.category === 'places') {
        locations.add(entry.name);
      }
    });

    setFilterOptions({
      tags: Array.from(tags).sort(),
      creators: Array.from(creators).sort(),
      races: Array.from(races).sort(),
      classes: Array.from(classes).sort(),
      locations: Array.from(locations).sort()
    });
  }, [data]);

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleClear = () => {
    setQuery('');
    setFilters({
      categories: [],
      tags: [],
      creators: [],
      races: [],
      classes: [],
      locations: [],
      hasImage: null,
      hasRelationships: null,
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
    onClear();
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Auto-search when filters change
    onSearch(query, newFilters);
  };

  const toggleArrayFilter = <K extends keyof Pick<SearchFilters, 'categories' | 'tags' | 'creators' | 'races' | 'classes' | 'locations'>>(
    key: K,
    value: string
  ) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];

    updateFilter(key, newArray as SearchFilters[K]);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.creators.length > 0) count++;
    if (filters.races.length > 0) count++;
    if (filters.classes.length > 0) count++;
    if (filters.locations.length > 0) count++;
    if (filters.hasImage !== null) count++;
    if (filters.hasRelationships !== null) count++;
    return count;
  };

  const categoryOptions = [
    { id: 'people', name: 'Characters', icon: User, color: 'text-blue-600 bg-blue-100' },
    { id: 'places', name: 'Locations', icon: MapPin, color: 'text-green-600 bg-green-100' },
    { id: 'items', name: 'Items', icon: Sword, color: 'text-purple-600 bg-purple-100' },
    { id: 'adventures', name: 'Adventures', icon: Scroll, color: 'text-orange-600 bg-orange-100' },
    { id: 'organizations', name: 'Organizations', icon: Shield, color: 'text-red-600 bg-red-100' }
  ];

  return (
    <div className={`fantasy-card p-6 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search the encyclopedia..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-3 border border-amber-200 dark:border-amber-700 rounded-lg bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-50 placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`fantasy-button-secondary flex items-center gap-2 ${getActiveFilterCount() > 0 ? 'bg-amber-200 dark:bg-amber-600' : ''}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filters
          {getActiveFilterCount() > 0 && (
            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </button>

        <button onClick={handleSearch} className="fantasy-button">
          <Search className="w-5 h-5" />
        </button>

        {(query || getActiveFilterCount() > 0) && (
          <button onClick={handleClear} className="fantasy-button-secondary">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="space-y-6 pt-4 border-t border-amber-200 dark:border-amber-700">
          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-50 mb-3">Content Types</h4>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => {
                const Icon = category.icon;
                const isSelected = filters.categories.includes(category.id as ContentCategory);

                return (
                  <button
                    key={category.id}
                    onClick={() => toggleArrayFilter('categories', category.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-amber-500 bg-amber-100 dark:bg-amber-600 text-amber-800 dark:text-amber-50'
                        : 'border-amber-200 dark:border-amber-700 bg-white dark:bg-amber-800 text-amber-600 dark:text-amber-50 hover:bg-amber-50 dark:hover:bg-amber-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          {filterOptions.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-50 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {filterOptions.tags.slice(0, 20).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleArrayFilter('tags', tag)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.tags.includes(tag)
                        ? 'border-amber-500 bg-amber-100 dark:bg-amber-600 text-amber-800 dark:text-amber-50'
                        : 'border-amber-200 dark:border-amber-700 bg-white dark:bg-amber-800 text-amber-600 dark:text-amber-50 hover:bg-amber-50 dark:hover:bg-amber-700'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Character-specific filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Races */}
            {filterOptions.races.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-50 mb-2">Race</h4>
                <select
                  multiple
                  value={filters.races}
                  onChange={(e) => updateFilter('races', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full p-2 border border-amber-200 dark:border-amber-700 rounded bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-50 text-sm max-h-24"
                >
                  {filterOptions.races.map(race => (
                    <option key={race} value={race}>{race}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Classes */}
            {filterOptions.classes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-50 mb-2">Class</h4>
                <select
                  multiple
                  value={filters.classes}
                  onChange={(e) => updateFilter('classes', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full p-2 border border-amber-200 dark:border-amber-700 rounded bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-50 text-sm max-h-24"
                >
                  {filterOptions.classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Boolean filters */}
            <div>
              <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-50 mb-2">Content</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasImage === true}
                    onChange={(e) => updateFilter('hasImage', e.target.checked ? true : null)}
                    className="mr-2"
                  />
                  <span className="text-sm text-amber-600 dark:text-amber-50">Has Image</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasRelationships === true}
                    onChange={(e) => updateFilter('hasRelationships', e.target.checked ? true : null)}
                    className="mr-2"
                  />
                  <span className="text-sm text-amber-600 dark:text-amber-50">Has Relationships</span>
                </label>
              </div>
            </div>

            {/* Sort options */}
            <div>
              <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-50 mb-2">Sort</h4>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  updateFilter('sortBy', sortBy as SearchFilters['sortBy']);
                  updateFilter('sortOrder', sortOrder as SearchFilters['sortOrder']);
                }}
                className="w-full p-2 border border-amber-200 dark:border-amber-700 rounded bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-50 text-sm"
              >
                <option value="relevance-desc">Relevance</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="category-asc">Category</option>
                <option value="creator-asc">Creator</option>
              </select>
            </div>
          </div>

          {/* Active filters summary */}
          {getActiveFilterCount() > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-200 dark:border-amber-700">
              <span className="text-sm text-amber-600 dark:text-amber-50 font-medium">Active filters:</span>

              {filters.categories.map(cat => (
                <span key={cat} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-50 text-xs rounded">
                  {cat}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArrayFilter('categories', cat)} />
                </span>
              ))}

              {filters.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-50 text-xs rounded">
                  #{tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArrayFilter('tags', tag)} />
                </span>
              ))}

              {filters.hasImage && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-700 text-purple-800 dark:text-purple-50 text-xs rounded">
                  Has Image
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('hasImage', null)} />
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
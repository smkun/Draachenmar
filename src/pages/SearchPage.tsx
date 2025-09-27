import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { EntryCard } from '../components/EntryCard';
import { getAllTags } from '../data';
import { ContentCategory } from '../types';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const { search, filters, updateFilters, clearFilters } = useSearch();

  const results = search(query);
  const allTags = getAllTags();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  const categories: { value: ContentCategory; label: string }[] = [
    { value: 'people', label: 'People' },
    { value: 'places', label: 'Places' },
    { value: 'items', label: 'Items' },
    { value: 'adventures', label: 'Adventures' },
    { value: 'organizations', label: 'Organizations' },
  ];

  const rarities = ['common', 'uncommon', 'rare', 'very-rare', 'legendary', 'artifact'];
  const itemTypes = ['weapon', 'armor', 'accessory', 'consumable', 'artifact', 'mundane'];
  const locationTypes = ['city', 'town', 'village', 'fortress', 'landmark', 'region', 'dungeon'];

  const hasActiveFilters = Object.values(filters).some(value =>
    value && (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="fantasy-card p-6">
        <h1 className="text-3xl font-fantasy font-bold text-amber-800 dark:text-amber-50 mb-6 text-center">
          Search the Realm
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 dark:text-amber-50 w-5 h-5" />
            <input
              type="text"
              id="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for people, places, items, and more..."
              aria-label="Search encyclopedia content"
              className="fantasy-input w-full pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </form>

        {/* Filter Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              showFilters || hasActiveFilters
                ? 'bg-amber-200 text-amber-800 dark:text-amber-50'
                : 'bg-amber-100 text-amber-700 dark:text-amber-50 hover:bg-amber-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">!</span>}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-700 dark:text-amber-50 text-red-700 rounded-lg hover:bg-red-200 dark:hover:bg-red-600 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label htmlFor="category-filter" className="block text-sm font-semibold text-amber-800 dark:text-amber-50 mb-2">
                  Category
                </label>
                <select
                  id="category-filter"
                  value={filters.category || ''}
                  onChange={(e) => updateFilters({ category: e.target.value as ContentCategory || undefined })}
                  className="fantasy-input w-full"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label htmlFor="type-filter" className="block text-sm font-semibold text-amber-800 dark:text-amber-50 mb-2">
                  Type
                </label>
                <select
                  id="type-filter"
                  value={filters.type || ''}
                  onChange={(e) => updateFilters({ type: e.target.value || undefined })}
                  className="fantasy-input w-full"
                >
                  <option value="">All Types</option>
                  {filters.category === 'items' && itemTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                  {filters.category === 'places' && locationTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rarity Filter (for items) */}
              {filters.category === 'items' && (
                <div>
                  <label htmlFor="rarity-filter" className="block text-sm font-semibold text-amber-800 dark:text-amber-50 mb-2">
                    Rarity
                  </label>
                  <select
                    id="rarity-filter"
                    value={filters.rarity || ''}
                    onChange={(e) => updateFilters({ rarity: e.target.value || undefined })}
                    className="fantasy-input w-full"
                  >
                    <option value="">All Rarities</option>
                    {rarities.map(rarity => (
                      <option key={rarity} value={rarity}>
                        {rarity.charAt(0).toUpperCase() + rarity.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tags Filter */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold text-amber-800 dark:text-amber-50 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const currentTags = filters.tags || [];
                        const newTags = currentTags.includes(tag)
                          ? currentTags.filter(t => t !== tag)
                          : [...currentTags, tag];
                        updateFilters({ tags: newTags.length > 0 ? newTags : undefined });
                      }}
                      className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                        filters.tags?.includes(tag)
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-100 dark:bg-amber-700 text-amber-700 dark:text-amber-50 hover:bg-amber-200 dark:hover:bg-amber-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50">
            {query ? `Search Results for "${query}"` : 'All Entries'}
          </h2>
          <span className="text-amber-600 dark:text-amber-50">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-amber-600 dark:text-amber-50 text-lg">
              {query ? 'No results found for your search.' : 'No entries match your filters.'}
            </p>
            <p className="text-amber-500 dark:text-amber-50 mt-2">
              Try adjusting your search terms or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Users, MapPin, Sword, Scroll, Shield, Filter, SortAsc, SortDesc, Zap } from 'lucide-react';
import { getEntriesByCategory } from '../data';
import { EntryCard } from '../components/EntryCard';
import { ContentCategory } from '../types';

export function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'creator'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterTag, setFilterTag] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  const entries = getEntriesByCategory(category as ContentCategory);

  const categoryInfo = {
    people: {
      icon: Users,
      title: 'People',
      description: 'Heroes, villains, and notable figures of Draachenmar',
      color: 'from-blue-500 to-blue-600',
    },
    places: {
      icon: MapPin,
      title: 'Places',
      description: 'Cities, towns, and mysterious places across the realm',
      color: 'from-green-500 to-green-600',
    },
    items: {
      icon: Sword,
      title: 'Items',
      description: 'Magical artifacts, weapons, and wondrous items',
      color: 'from-purple-500 to-purple-600',
    },
    adventures: {
      icon: Scroll,
      title: 'Adventures',
      description: 'Epic quests and thrilling campaign adventures',
      color: 'from-orange-500 to-orange-600',
    },
    organizations: {
      icon: Shield,
      title: 'Organizations',
      description: 'Guilds, orders, and factions that shape the world',
      color: 'from-red-500 to-red-600',
    },
    pantheons: {
      icon: Zap,
      title: 'Pantheons',
      description: 'Divine powers and pantheons that govern the cosmos',
      color: 'from-yellow-500 to-yellow-600',
    },
  };

  const currentCategory = categoryInfo[category as keyof typeof categoryInfo];

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries;

    // Apply tag filter
    if (filterTag) {
      filtered = filtered.filter(entry => {
        const tags = (entry.data as any).tags || [];
        return tags.includes(filterTag);
      });
    }

    // Apply type filter
    if (filterType) {
      filtered = filtered.filter(entry => {
        const type = (entry.data as any).type;
        return type === filterType;
      });
    }

    // Sort entries
    filtered.sort((a, b) => {
      let aValue: string = '';
      let bValue: string = '';

      switch (sortBy) {
        case 'name':
          aValue = a.data.name.toLowerCase();
          bValue = b.data.name.toLowerCase();
          break;
        case 'type':
          aValue = ((a.data as any).type || '').toLowerCase();
          bValue = ((b.data as any).type || '').toLowerCase();
          break;
        case 'creator':
          aValue = ((a.data as any).creator || 'unknown').toLowerCase();
          bValue = ((b.data as any).creator || 'unknown').toLowerCase();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [entries, filterTag, filterType, sortBy, sortOrder]);

  // Get unique types for the current category
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    entries.forEach(entry => {
      const type = (entry.data as any).type;
      if (type) types.add(type);
    });
    return Array.from(types).sort();
  }, [entries]);

  // Get tags used in current category
  const categoryTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach(entry => {
      const entryTags = (entry.data as any).tags || [];
      entryTags.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [entries]);

  if (!currentCategory) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-fantasy text-amber-800 dark:text-amber-50">Category not found</h1>
      </div>
    );
  }

  const IconComponent = currentCategory.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fantasy-card p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className={`w-16 h-16 bg-gradient-to-r ${currentCategory.color} rounded-xl flex items-center justify-center shadow-lg`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-fantasy font-bold text-amber-800 dark:text-amber-50 mb-4">
          {currentCategory.title}
        </h1>
        <p className="text-lg text-amber-600 dark:text-amber-50 font-serif max-w-2xl mx-auto">
          {currentCategory.description}
        </p>
        <div className="mt-4 text-sm text-amber-500 dark:text-amber-50">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="fantasy-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sort By */}
          <div>
            <label htmlFor="sort-by-select" className="block text-sm font-semibold text-amber-800 dark:text-amber-50 mb-2">
              Sort by
            </label>
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'type' | 'creator')}
              className="fantasy-input w-full"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="creator">Creator</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-semibold text-amber-800 dark:text-amber-50 mb-2">
              Order
            </label>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="fantasy-input w-full flex items-center justify-center space-x-2 cursor-pointer hover:bg-amber-50"
            >
              {sortOrder === 'asc' ? (
                <>
                  <SortAsc className="w-4 h-4" />
                  <span>A to Z</span>
                </>
              ) : (
                <>
                  <SortDesc className="w-4 h-4" />
                  <span>Z to A</span>
                </>
              )}
            </button>
          </div>

          {/* Type Filter */}
          {availableTypes.length > 0 && (
            <div>
              <label htmlFor="type-filter-select" className="block text-sm font-semibold text-amber-800 dark:text-amber-50 mb-2">
                Type
              </label>
              <select
                id="type-filter-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="fantasy-input w-full"
              >
                <option value="">All Types</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tag Filter */}
          <div>
            <label htmlFor="tag-filter-select" className="block text-sm font-semibold text-amber-800 dark:text-amber-50 mb-2">
              Tag
            </label>
            <select
              id="tag-filter-select"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="fantasy-input w-full"
            >
              <option value="">All Tags</option>
              {categoryTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(filterTag || filterType) && (
          <div className="mt-4 flex items-center space-x-2">
            <Filter className="w-4 h-4 text-amber-600 dark:text-amber-50" />
            <span className="text-sm text-amber-600 dark:text-amber-50">Active filters:</span>
            {filterType && (
              <span className="bg-amber-100 text-amber-700 dark:text-amber-50 px-2 py-1 rounded text-sm">
                Type: {filterType}
              </span>
            )}
            {filterTag && (
              <span className="bg-amber-100 text-amber-700 dark:text-amber-50 px-2 py-1 rounded text-sm">
                Tag: {filterTag}
              </span>
            )}
            <button
              onClick={() => {
                setFilterType('');
                setFilterTag('');
              }}
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        <div className="mb-6 text-center">
          <span className="text-amber-600 dark:text-amber-50">
            Showing {filteredAndSortedEntries.length} of {entries.length} {currentCategory.title.toLowerCase()}
          </span>
        </div>

        {filteredAndSortedEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedEntries.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-amber-600 dark:text-amber-50 text-lg">
              No {currentCategory.title.toLowerCase()} match your current filters.
            </p>
            <p className="text-amber-500 dark:text-amber-50 mt-2">
              Try adjusting your filters to see more results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
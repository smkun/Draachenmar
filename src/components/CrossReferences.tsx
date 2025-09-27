import { Link } from 'react-router-dom';
import { Users, MapPin, Sword, Scroll, Shield, ExternalLink } from 'lucide-react';
import { ContentCategory } from '../types';

interface CrossReference {
  id: string;
  name: string;
  category: ContentCategory;
  relationship?: string;
  description?: string;
}

interface CrossReferencesProps {
  references: CrossReference[];
  title?: string;
}

export function CrossReferences({ references, title = "Related Content" }: CrossReferencesProps) {
  if (!references.length) return null;

  const getCategoryIcon = (category: ContentCategory) => {
    switch (category) {
      case 'people': return Users;
      case 'places': return MapPin;
      case 'items': return Sword;
      case 'adventures': return Scroll;
      case 'organizations': return Shield;
      default: return ExternalLink;
    }
  };

  const getCategoryColor = (category: ContentCategory) => {
    switch (category) {
      case 'people': return 'text-blue-600 bg-blue-100 dark:bg-blue-700 dark:text-amber-50';
      case 'places': return 'text-green-600 bg-green-100 dark:bg-green-700 dark:text-amber-50';
      case 'items': return 'text-purple-600 bg-purple-100 dark:bg-purple-700 dark:text-amber-50';
      case 'adventures': return 'text-orange-600 bg-orange-100 dark:bg-orange-700 dark:text-amber-50';
      case 'organizations': return 'text-red-600 bg-red-100 dark:bg-red-700 dark:text-amber-50';
      default: return 'text-gray-600 dark:text-amber-50 bg-gray-100';
    }
  };

  // Group references by category
  const groupedReferences = references.reduce((acc, ref) => {
    if (!acc[ref.category]) {
      acc[ref.category] = [];
    }
    acc[ref.category].push(ref);
    return acc;
  }, {} as Record<ContentCategory, CrossReference[]>);

  return (
    <div className="fantasy-card p-6">
      <h3 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4 flex items-center">
        <ExternalLink className="w-5 h-5 mr-2" />
        {title}
      </h3>

      <div className="space-y-6">
        {Object.entries(groupedReferences).map(([category, refs]) => {
          const Icon = getCategoryIcon(category as ContentCategory);
          const colorClass = getCategoryColor(category as ContentCategory);

          return (
            <div key={category}>
              <h4 className="text-lg font-fantasy font-medium text-amber-700 dark:text-amber-50 mb-3 flex items-center">
                <div className={`w-6 h-6 rounded ${colorClass} flex items-center justify-center mr-2`}>
                  <Icon className="w-4 h-4" />
                </div>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {refs.map((ref) => (
                  <Link
                    key={ref.id}
                    to={`/${ref.category}/${ref.id}`}
                    className="block p-3 bg-amber-50 dark:bg-amber-800 border border-amber-200 dark:border-amber-700 rounded hover:bg-amber-100 dark:hover:bg-amber-700 transition-colors duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-amber-800 dark:text-amber-50 group-hover:text-amber-900 dark:text-amber-50 line-clamp-1">
                          {ref.name}
                        </h5>
                        {ref.relationship && (
                          <p className="text-sm text-amber-600 dark:text-amber-50 mt-1">
                            <span className="font-medium">{ref.relationship}</span>
                          </p>
                        )}
                        {ref.description && (
                          <p className="text-xs text-amber-500 dark:text-amber-50 mt-1 line-clamp-2">
                            {ref.description}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-amber-500 dark:text-amber-50 group-hover:text-amber-700 dark:text-amber-50 transition-colors duration-200 flex-shrink-0 ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to build cross-references from content data
export function buildCrossReferences(
  content: any,
  category: ContentCategory,
  allData: { characters: any[]; locations: any[]; items: any[]; adventures: any[]; organizations: any[] }
): CrossReference[] {
  const references: CrossReference[] = [];

  // Look for references in description text
  const searchText = `${content.description || ''} ${content.background || ''} ${content.history || ''}`.toLowerCase();

  // Search for character names in other content
  if (category !== 'people') {
    for (const character of allData.characters) {
      if (searchText.includes(character.name.toLowerCase())) {
        references.push({
          id: character.id,
          name: character.name,
          category: 'people',
          relationship: 'mentioned'
        });
      }
    }
  }

  // Search for location names
  if (category !== 'places') {
    for (const location of allData.locations) {
      if (searchText.includes(location.name.toLowerCase())) {
        references.push({
          id: location.id,
          name: location.name,
          category: 'places',
          relationship: 'located in'
        });
      }
    }
  }

  // Search for item names
  if (category !== 'items') {
    for (const item of allData.items) {
      if (searchText.includes(item.name.toLowerCase())) {
        references.push({
          id: item.id,
          name: item.name,
          category: 'items',
          relationship: 'related item'
        });
      }
    }
  }

  // For locations: add characters from notableFigures array
  if (category === 'places' && content.notableFigures) {
    for (const figure of content.notableFigures) {
      // Find matching character in the database
      const character = allData.characters.find(c =>
        c.name.toLowerCase() === figure.name.toLowerCase() ||
        c.name.toLowerCase().includes(figure.name.toLowerCase()) ||
        figure.name.toLowerCase().includes(c.name.toLowerCase())
      );

      if (character && !references.find(r => r.id === character.id)) {
        references.push({
          id: character.id,
          name: character.name,
          category: 'people',
          relationship: figure.role || 'notable figure'
        });
      }
    }
  }

  // For locations: add characters mentioned in establishments (but not already in notableFigures)
  if (category === 'places' && content.establishments) {
    for (const establishment of content.establishments) {
      const estText = `${establishment.description || ''} ${establishment.proprietor || ''}`.toLowerCase();

      for (const character of allData.characters) {
        // Skip if character is already in notable figures or already in references
        const isNotableFigure = content.notableFigures?.some((figure: any) =>
          figure.name.toLowerCase() === character.name.toLowerCase() ||
          figure.name.toLowerCase().includes(character.name.toLowerCase()) ||
          character.name.toLowerCase().includes(figure.name.toLowerCase())
        );

        if (estText.includes(character.name.toLowerCase()) &&
            !references.find(r => r.id === character.id) &&
            !isNotableFigure) {
          references.push({
            id: character.id,
            name: character.name,
            category: 'people',
            relationship: 'associated with ' + establishment.name
          });
        }
      }
    }
  }

  // Add creator-based relationships (only for specific creators, not generic "Campaign Setting")
  if (content.creator && content.creator !== 'Campaign Setting') {
    const creatorContent = [
      ...allData.characters.filter(c => c.creator === content.creator && c.id !== content.id),
      ...allData.items.filter(i => i.creator === content.creator && i.id !== content.id),
      ...allData.locations.filter(l => l.creator === content.creator && l.id !== content.id),
      ...allData.organizations.filter(o => o.creator === content.creator && o.id !== content.id)
    ];

    // Limit to max 5 creator-based references to avoid clutter
    for (const item of creatorContent.slice(0, 5)) {
      const cat = item.category || (allData.characters.includes(item) ? 'people' :
                   allData.items.includes(item) ? 'items' :
                   allData.locations.includes(item) ? 'places' : 'organizations');

      references.push({
        id: item.id,
        name: item.name,
        category: cat as ContentCategory,
        relationship: `created by ${content.creator}`
      });
    }
  }

  // Remove duplicates
  const seen = new Set<string>();
  return references.filter(ref => {
    const key = `${ref.category}-${ref.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
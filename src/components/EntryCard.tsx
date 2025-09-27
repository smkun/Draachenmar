import { Link } from 'react-router-dom';
import { Users, MapPin, Sword, Scroll, Shield, Star, Crown, Zap } from 'lucide-react';
import { EncyclopediaEntry, Character, Location, Item, Adventure, Organization } from '../types';
import { LazyCardImage } from './LazyImage';

interface EntryCardProps {
  entry: EncyclopediaEntry;
}

export function EntryCard({ entry }: EntryCardProps) {
  const { category, data } = entry;

  const getCategoryIcon = () => {
    switch (category) {
      case 'people': return Users;
      case 'places': return MapPin;
      case 'items': return Sword;
      case 'adventures': return Scroll;
      case 'organizations': return Shield;
      default: return Users;
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'people': return 'text-blue-600 bg-blue-100 dark:bg-blue-700 dark:text-amber-50';
      case 'places': return 'text-green-600 bg-green-100 dark:bg-green-700 dark:text-amber-50';
      case 'items': return 'text-purple-600 bg-purple-100 dark:bg-purple-700 dark:text-amber-50';
      case 'adventures': return 'text-orange-600 bg-orange-100 dark:bg-orange-700 dark:text-amber-50';
      case 'organizations': return 'text-red-600 bg-red-100 dark:bg-red-700 dark:text-amber-50';
      default: return 'text-gray-600 dark:text-amber-50 bg-gray-100';
    }
  };

  const getRarityIcon = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'artifact': return <Star className="w-4 h-4 text-purple-500" />;
      case 'very-rare': return <Zap className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const renderContent = () => {
    const IconComponent = getCategoryIcon();
    const colorClass = getCategoryColor();

    return (
      <Link
        to={`/${category}/${entry.id}`}
        className="fantasy-card p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group block"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-fantasy font-semibold text-amber-800 dark:text-amber-50 group-hover:text-amber-900 dark:group-hover:text-amber-50 transition-colors duration-200 line-clamp-1">
                {data.name}
              </h3>
              {'title' in data && data.title && (
                <p className="text-sm text-amber-600 dark:text-amber-50 font-serif italic">
                  {data.title}
                </p>
              )}
            </div>
          </div>

          {/* Rarity indicator for items */}
          {'rarity' in data && data.rarity && (
            <div className="flex items-center space-x-1">
              {getRarityIcon(data.rarity)}
            </div>
          )}
        </div>

        {/* Image display with lazy loading */}
        {'image' in data && data.image && (
          <div className="mb-4">
            <LazyCardImage
              src={`${(import.meta as any).env?.BASE_URL || '/'}images/${
                category === 'places' ? 'locations' :
                category === 'people' ? 'characters' :
                category === 'pantheons' ? 'deities' :
                'items'
              }/${data.image}.webp`}
              alt={data.name}
              category={category === 'places' ? 'places' :
                       category === 'people' ? 'people' :
                       category === 'pantheons' ? 'pantheons' :
                       'items'}
              name={data.name}
            />
          </div>
        )}

        {/* Content specific to each type */}
        <div className="space-y-2 mb-4">
          {category === 'people' && (
            <div className="text-sm text-amber-600 dark:text-amber-50">
              {(data as Character).race && (
                <span className="inline-block bg-amber-100 dark:bg-amber-700 dark:text-amber-50 px-2 py-1 rounded mr-2">
                  {(data as Character).race}
                </span>
              )}
              {(data as Character).class && (
                <span className="inline-block bg-amber-100 dark:bg-amber-700 dark:text-amber-50 px-2 py-1 rounded">
                  {(data as Character).class}
                </span>
              )}
            </div>
          )}

          {category === 'places' && (
            <div className="text-sm text-amber-600 dark:text-amber-50">
              <span className="inline-block bg-green-100 dark:bg-green-700 dark:text-amber-50 px-2 py-1 rounded mr-2">
                {(data as Location).type}
              </span>
              {(data as Location).population && (
                <span className="text-xs text-amber-500 dark:text-amber-50">
                  Pop: {(data as Location).population?.toLocaleString()}
                </span>
              )}
            </div>
          )}

          {category === 'items' && (
            <div className="text-sm text-amber-600 dark:text-amber-50">
              <span className="inline-block bg-purple-100 dark:bg-purple-700 dark:text-amber-50 px-2 py-1 rounded mr-2">
                {(data as Item).type}
              </span>
              <span className={`inline-block px-2 py-1 rounded text-xs ${
                (data as Item).rarity === 'legendary' ? 'bg-yellow-100 dark:bg-yellow-700 dark:text-amber-50 text-yellow-700' :
                (data as Item).rarity === 'artifact' ? 'bg-purple-100 dark:bg-purple-700 dark:text-amber-50 text-purple-700' :
                (data as Item).rarity === 'very-rare' ? 'bg-blue-100 dark:bg-blue-700 dark:text-amber-50 text-blue-700' :
                'bg-gray-100 text-gray-700 dark:text-amber-50'
              }`}>
                {(data as Item).rarity?.replace('-', ' ')}
              </span>
            </div>
          )}

          {category === 'adventures' && (
            <div className="text-sm text-amber-600 dark:text-amber-50">
              {(data as Adventure).level && (
                <span className="inline-block bg-orange-100 dark:bg-orange-700 dark:text-amber-50 px-2 py-1 rounded mr-2">
                  Level {(data as Adventure).level}
                </span>
              )}
              {(data as Adventure).duration && (
                <span className="text-xs text-amber-500 dark:text-amber-50">
                  {(data as Adventure).duration}
                </span>
              )}
            </div>
          )}

          {category === 'organizations' && (
            <div className="text-sm text-amber-600 dark:text-amber-50">
              <span className="inline-block bg-red-100 dark:bg-red-700 dark:text-amber-50 px-2 py-1 rounded">
                {(data as Organization).type}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {data.description && (
          <p className="text-amber-700 dark:text-amber-50 font-serif text-sm leading-relaxed line-clamp-3 mb-4">
            {data.description}
          </p>
        )}

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {data.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-block bg-amber-50 dark:bg-amber-800 text-amber-600 dark:text-amber-50 text-xs px-2 py-1 rounded border border-amber-200 dark:border-amber-700"
              >
                {tag}
              </span>
            ))}
            {data.tags.length > 3 && (
              <span className="text-xs text-amber-500 dark:text-amber-50">
                +{data.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Creator */}
        {'creator' in data && data.creator && (
          <div className="text-xs text-amber-500 dark:text-amber-50 italic">
            Created by {data.creator}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-amber-200 flex items-center justify-between">
          <span className="text-xs text-amber-500 dark:text-amber-50 capitalize">
            {category.slice(0, -1)}
          </span>
          <span className="text-amber-500 dark:text-amber-50 group-hover:text-amber-700 transition-colors duration-200">
            →
          </span>
        </div>
      </Link>
    );
  };

  return renderContent();
}
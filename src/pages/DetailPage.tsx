import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Sword, Scroll, Shield, Star, Crown, Zap, ExternalLink } from 'lucide-react';
import { getEntryById } from '../data';
import { Character, Location, Item, Adventure, Organization } from '../types';

export function DetailPage() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const entry = getEntryById(id!);

  if (!entry) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-fantasy text-amber-800 dark:text-amber-50 mb-4">Entry not found</h1>
        <Link to={`/${category}`} className="fantasy-button">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {category}
        </Link>
      </div>
    );
  }

  const { data } = entry;

  const getCategoryIcon = () => {
    switch (entry.category) {
      case 'characters': return Users;
      case 'locations': return MapPin;
      case 'items': return Sword;
      case 'adventures': return Scroll;
      case 'organizations': return Shield;
      default: return Users;
    }
  };

  const getCategoryColor = () => {
    switch (entry.category) {
      case 'characters': return 'from-blue-500 to-blue-600';
      case 'locations': return 'from-green-500 to-green-600';
      case 'items': return 'from-purple-500 to-purple-600';
      case 'adventures': return 'from-orange-500 to-orange-600';
      case 'organizations': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityIcon = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'artifact': return <Star className="w-5 h-5 text-purple-500" />;
      case 'very-rare': return <Zap className="w-5 h-5 text-blue-500" />;
      default: return null;
    }
  };

  const IconComponent = getCategoryIcon();
  const colorClass = getCategoryColor();

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <Link
          to={`/${category}`}
          className="flex items-center space-x-2 text-amber-600 dark:text-amber-50 hover:text-amber-800 dark:text-amber-50 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {entry.category}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="fantasy-card p-8">
        <div className="flex items-start space-x-6">
          <div className={`w-20 h-20 bg-gradient-to-r ${colorClass} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
            <IconComponent className="w-10 h-10 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-fantasy font-bold text-amber-800 dark:text-amber-50 mb-2">
                  {data.name}
                </h1>
                {'title' in data && data.title && (
                  <p className="text-xl text-amber-600 dark:text-amber-50 font-serif italic mb-4">
                    {data.title}
                  </p>
                )}
              </div>

              {/* Rarity indicator for items */}
              {'rarity' in data && data.rarity && (
                <div className="flex items-center space-x-2">
                  {getRarityIcon(data.rarity)}
                  <span className="text-lg font-semibold text-amber-700 dark:text-amber-50 capitalize">
                    {(data as Item).rarity?.replace('-', ' ')}
                  </span>
                </div>
              )}
            </div>

            {/* Category-specific header info */}
            <div className="flex flex-wrap gap-2 mb-4">
              {entry.category === 'people' && (
                <>
                  {(data as Character).race && (
                    <span className="bg-blue-100 dark:bg-blue-700 dark:text-amber-50 text-blue-700 px-3 py-1 rounded-lg font-medium">
                      {(data as Character).race}
                    </span>
                  )}
                  {(data as Character).class && (
                    <span className="bg-blue-100 dark:bg-blue-700 dark:text-amber-50 text-blue-700 px-3 py-1 rounded-lg font-medium">
                      {(data as Character).class}
                    </span>
                  )}
                  {(data as Character).location && (
                    <span className="bg-green-100 dark:bg-green-700 dark:text-amber-50 text-green-700 px-3 py-1 rounded-lg font-medium">
                      📍 {(data as Character).location}
                    </span>
                  )}
                </>
              )}

              {entry.category === 'places' && (
                <>
                  <span className="bg-green-100 dark:bg-green-700 dark:text-amber-50 text-green-700 px-3 py-1 rounded-lg font-medium capitalize">
                    {(data as Location).type}
                  </span>
                  {(data as Location).population && (
                    <span className="bg-green-100 dark:bg-green-700 dark:text-amber-50 text-green-700 px-3 py-1 rounded-lg font-medium">
                      Population: {(data as Location).population?.toLocaleString()}
                    </span>
                  )}
                </>
              )}

              {entry.category === 'items' && (
                <>
                  <span className="bg-purple-100 dark:bg-purple-700 dark:text-amber-50 text-purple-700 px-3 py-1 rounded-lg font-medium capitalize">
                    {(data as Item).type}
                  </span>
                </>
              )}

              {entry.category === 'adventures' && (
                <>
                  {(data as Adventure).level && (
                    <span className="bg-orange-100 dark:bg-orange-700 dark:text-amber-50 text-orange-700 px-3 py-1 rounded-lg font-medium">
                      Level {(data as Adventure).level}
                    </span>
                  )}
                  {(data as Adventure).duration && (
                    <span className="bg-orange-100 dark:bg-orange-700 dark:text-amber-50 text-orange-700 px-3 py-1 rounded-lg font-medium">
                      Duration: {(data as Adventure).duration}
                    </span>
                  )}
                </>
              )}

              {entry.category === 'organizations' && (
                <span className="bg-red-100 dark:bg-red-700 dark:text-amber-50 text-red-700 px-3 py-1 rounded-lg font-medium capitalize">
                  {(data as Organization).type}
                </span>
              )}
            </div>

            {/* Creator */}
            {'creator' in data && data.creator && (
              <p className="text-amber-600 dark:text-amber-50 italic">
                Created by {data.creator}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {data.description && (
            <div className="fantasy-card p-6">
              <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                Description
              </h2>
              <p className="text-amber-700 dark:text-amber-50 font-serif leading-relaxed whitespace-pre-line">
                {data.description}
              </p>
            </div>
          )}

          {/* Background/History */}
          {(('background' in data && data.background) || ('history' in data && data.history)) && (
            <div className="fantasy-card p-6">
              <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                {entry.category === 'people' ? 'Background' : 'History'}
              </h2>
              <p className="text-amber-700 dark:text-amber-50 font-serif leading-relaxed whitespace-pre-line">
                {(() => {
                  if ('background' in data && data.background) return data.background;
                  if ('history' in data && data.history) return data.history;
                  return 'No additional information available.';
                })()}
              </p>
            </div>
          )}

          {/* Properties (for items) */}
          {'properties' in data && data.properties && (data as Item).properties!.length > 0 && (
            <div className="fantasy-card p-6">
              <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                Properties
              </h2>
              <ul className="space-y-2">
                {(data as Item).properties!.map((property, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span className="text-amber-700 dark:text-amber-50 font-serif">{property}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Goals (for organizations) */}
          {'goals' in data && data.goals && (data as Organization).goals!.length > 0 && (
            <div className="fantasy-card p-6">
              <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                Goals
              </h2>
              <ul className="space-y-2">
                {(data as Organization).goals!.map((goal, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span className="text-amber-700 dark:text-amber-50 font-serif">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Info for Locations */}
          {entry.category === 'locations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data as Location).government && (
                <div className="fantasy-card p-6">
                  <h3 className="text-lg font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-3">
                    Government
                  </h3>
                  <p className="text-amber-700 dark:text-amber-50 font-serif">
                    {(data as Location).government}
                  </p>
                </div>
              )}

              {(data as Location).economy && (
                <div className="fantasy-card p-6">
                  <h3 className="text-lg font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-3">
                    Economy
                  </h3>
                  <p className="text-amber-700 dark:text-amber-50 font-serif">
                    {(data as Location).economy}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="fantasy-card p-6">
            <h3 className="text-lg font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
              Quick Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-600 dark:text-amber-50">Category:</span>
                <span className="text-amber-800 dark:text-amber-50 font-medium capitalize">
                  {entry.category.slice(0, -1)}
                </span>
              </div>

              {/* Organization HQ */}
              {'headquarters' in data && data.headquarters && (
                <div className="flex justify-between">
                  <span className="text-amber-600 dark:text-amber-50">Headquarters:</span>
                  <span className="text-amber-800 dark:text-amber-50 font-medium">{data.headquarters}</span>
                </div>
              )}

              {/* Adventure Summary */}
              {'summary' in data && data.summary && (
                <div>
                  <span className="text-amber-600 dark:text-amber-50 block mb-2">Summary:</span>
                  <p className="text-amber-800 dark:text-amber-50 font-serif text-xs leading-relaxed">
                    {data.summary}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {data.tags && data.tags.length > 0 && (
            <div className="fantasy-card p-6">
              <h3 className="text-lg font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-amber-100 dark:bg-amber-700 text-amber-700 dark:text-amber-50 px-3 py-1 rounded-full text-sm font-medium border border-amber-200 dark:border-amber-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Content */}
          {((entry.category === 'adventures' && ((data as Adventure).locations.length > 0 || (data as Adventure).characters.length > 0)) ||
            (entry.category === 'organizations' && ('members' in data && data.members && (data as Organization).members!.length > 0))) && (
            <div className="fantasy-card p-6">
              <h3 className="text-lg font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                Related Content
              </h3>
              <div className="space-y-2">
                {entry.category === 'adventures' && (
                  <>
                    {(data as Adventure).locations.map(locationId => (
                      <Link
                        key={locationId}
                        to={`/places/${locationId}`}
                        className="flex items-center space-x-2 text-amber-600 dark:text-amber-50 hover:text-amber-800 dark:text-amber-50 transition-colors duration-200 text-sm"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>{locationId.replace('-', ' ')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ))}
                    {(data as Adventure).characters.map(characterId => (
                      <Link
                        key={characterId}
                        to={`/people/${characterId}`}
                        className="flex items-center space-x-2 text-amber-600 dark:text-amber-50 hover:text-amber-800 dark:text-amber-50 transition-colors duration-200 text-sm"
                      >
                        <Users className="w-4 h-4" />
                        <span>{characterId.replace('-', ' ')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ))}
                  </>
                )}

                {entry.category === 'organizations' && 'members' in data && data.members && (
                  <>
                    {(data as Organization).members!.map(memberId => (
                      <Link
                        key={memberId}
                        to={`/people/${memberId}`}
                        className="flex items-center space-x-2 text-amber-600 dark:text-amber-50 hover:text-amber-800 dark:text-amber-50 transition-colors duration-200 text-sm"
                      >
                        <Users className="w-4 h-4" />
                        <span>{memberId.replace('-', ' ')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
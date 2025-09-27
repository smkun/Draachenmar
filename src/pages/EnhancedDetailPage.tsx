import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Users, MapPin, Sword, Scroll, Shield, Star, Crown, Zap, User, Calendar, FileText } from 'lucide-react';
import { getEntryById, getAllEntries } from '../data';
import { Character, Location, Item, Adventure, Organization, Deity, GalleryImage } from '../types';
import { ImageGallery } from '../components/ImageGallery';
import { CrossReferences, buildCrossReferences } from '../components/CrossReferences';
import { LazyDetailImage } from '../components/LazyImage';

export function EnhancedDetailPage() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const entry = getEntryById(id!);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [crossRefs, setCrossRefs] = useState<any[]>([]);

  useEffect(() => {
    if (entry) {
      // For locations, add images of Notable Figures
      if (entry.category === 'places' && (entry.data as Location).notableFigures) {
        const locationData = entry.data as Location;
        const characterImages: GalleryImage[] = locationData.notableFigures!.map(figure => ({
          url: `${(import.meta as any).env?.BASE_URL || '/'}images/characters/${figure.name}.webp`,
          alt: figure.name,
          caption: `${figure.name} - ${figure.role}`,
          type: 'character-portrait' as const
        }));

        setImages(characterImages);
      } else {
        setImages([]);
      }

      // Build cross-references
      const allEntries = getAllEntries();
      const allData = {
        characters: allEntries.filter(e => e.category === 'people').map(e => e.data),
        locations: allEntries.filter(e => e.category === 'places').map(e => e.data),
        items: allEntries.filter(e => e.category === 'items').map(e => e.data),
        adventures: allEntries.filter(e => e.category === 'adventures').map(e => e.data),
        organizations: allEntries.filter(e => e.category === 'organizations').map(e => e.data),
      };

      const refs = buildCrossReferences(entry.data, entry.category, allData);
      setCrossRefs(refs);
    }
  }, [entry]);

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
      case 'people': return Users;
      case 'places': return MapPin;
      case 'items': return Sword;
      case 'adventures': return Scroll;
      case 'organizations': return Shield;
      case 'pantheons': return Zap;
      default: return Users;
    }
  };

  const getCategoryColor = () => {
    switch (entry.category) {
      case 'people': return 'from-blue-500 to-blue-600';
      case 'places': return 'from-green-500 to-green-600';
      case 'items': return 'from-purple-500 to-purple-600';
      case 'adventures': return 'from-orange-500 to-orange-600';
      case 'organizations': return 'from-red-500 to-red-600';
      case 'pantheons': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryDisplayName = (cat: string) => {
    switch (cat) {
      case 'people': return 'People';
      case 'places': return 'Places';
      case 'items': return 'Items';
      case 'adventures': return 'Adventures';
      case 'organizations': return 'Organizations';
      case 'pantheons': return 'Pantheons';
      default: return cat.charAt(0).toUpperCase() + cat.slice(1);
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
          <span>Back to {getCategoryDisplayName(category!)}</span>
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
                  {(data as Character).level && (
                    <span className="bg-blue-100 dark:bg-blue-700 dark:text-amber-50 text-blue-700 px-3 py-1 rounded-lg font-medium">
                      Level {(data as Character).level}
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

              {entry.category === 'pantheons' && (
                <>
                  {(data as Deity).pantheon && (
                    <span className="bg-yellow-100 dark:bg-yellow-700 dark:text-amber-50 text-yellow-700 px-3 py-1 rounded-lg font-medium">
                      {(data as Deity).pantheon}
                    </span>
                  )}
                  {(data as Deity).alignment && (
                    <span className="bg-yellow-100 dark:bg-yellow-700 dark:text-amber-50 text-yellow-700 px-3 py-1 rounded-lg font-medium">
                      {(data as Deity).alignment}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Creator and metadata */}
            <div className="flex items-center space-x-4 text-sm text-amber-600 dark:text-amber-50">
              {data.creator && (
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Created by {data.creator}</span>
                </div>
              )}
              {'source' in data && data.source?.document && (
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>Source: {data.source.document}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deity Image */}
      {entry.category === 'pantheons' && (data as Deity).image && (
        <div className="fantasy-card p-6">
          <div className="w-full max-w-md mx-auto">
            <LazyDetailImage
              src={`${(import.meta as any).env?.BASE_URL || '/'}images/deities/${(data as Deity).image}.webp`}
              alt={data.name}
              category="pantheons"
              name={data.name}
              priority="high"
            />
          </div>
        </div>
      )}

      {/* Location Image */}
      {entry.category === 'places' && (data as Location).image && (
        <div className="fantasy-card p-6">
          <div className="w-full max-w-2xl mx-auto">
            <LazyDetailImage
              src={`${(import.meta as any).env?.BASE_URL || '/'}images/locations/${(data as Location).image}.webp`}
              alt={data.name}
              category="places"
              name={data.name}
              priority="high"
            />
          </div>
        </div>
      )}

      {/* Character Image */}
      {entry.category === 'people' && (data as Character).image && (
        <div className="fantasy-card p-6">
          <div className="w-full max-w-md mx-auto">
            <LazyDetailImage
              src={`${(import.meta as any).env?.BASE_URL || '/'}images/characters/${(data as Character).image}.webp`}
              alt={data.name}
              category="people"
              name={data.name}
              priority="high"
            />
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {data.description && (
            <div className="fantasy-card p-6">
              <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                Description
              </h2>
              <div className="prose prose-amber max-w-none">
                <p className="text-amber-700 dark:text-amber-50 font-serif leading-relaxed whitespace-pre-line">
                  {data.description}
                </p>
              </div>
            </div>
          )}

          {/* Properties (for items) */}
          {'properties' in data && data.properties && data.properties.length > 0 && (
            <div className="fantasy-card p-6">
              <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                Properties
              </h2>
              <ul className="space-y-2">
                {data.properties.map((property, index) => (
                  <li key={index} className="text-amber-700 dark:text-amber-50 font-serif flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    {property}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deity-specific sections */}
          {entry.category === 'pantheons' && (
            <>
              {/* Divine Domains */}
              {(data as Deity).domain && (data as Deity).domain.length > 0 && (
                <div className="fantasy-card p-6">
                  <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                    Divine Domains
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(data as Deity).domain.map((domain, index) => (
                      <span
                        key={index}
                        className="bg-yellow-100 dark:bg-yellow-700 dark:text-amber-50 text-yellow-700 px-3 py-2 rounded-lg font-medium"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Appearance */}
              {(data as Deity).appearance && (
                <div className="fantasy-card p-6">
                  <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                    Appearance
                  </h2>
                  <p className="text-amber-700 dark:text-amber-50 font-serif leading-relaxed whitespace-pre-line">
                    {(data as Deity).appearance}
                  </p>
                </div>
              )}

              {/* Holy Symbol */}
              {(data as Deity).holySymbol && (
                <div className="fantasy-card p-6">
                  <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                    Holy Symbol
                  </h2>
                  <p className="text-amber-700 dark:text-amber-50 font-serif leading-relaxed">
                    {(data as Deity).holySymbol}
                  </p>
                </div>
              )}

              {/* Festivals */}
              {(data as Deity).festivals && (data as Deity).festivals!.length > 0 && (
                <div className="fantasy-card p-6">
                  <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                    Sacred Festivals
                  </h2>
                  <ul className="space-y-2">
                    {(data as Deity).festivals!.map((festival, index) => (
                      <li key={index} className="text-amber-700 dark:text-amber-50 font-serif flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        {festival}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Location-specific sections */}
          {entry.category === 'places' && (
            <>
              {/* Government and Economy */}
              {((data as Location).government || (data as Location).economy) && (
                <div className="fantasy-card p-6">
                  <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                    Government & Economy
                  </h2>
                  {(data as Location).government && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-50 mb-2">Government</h3>
                      <p className="text-amber-700 dark:text-amber-50 font-serif leading-relaxed">
                        {(data as Location).government}
                      </p>
                    </div>
                  )}
                  {(data as Location).economy && (
                    <div>
                      <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-50 mb-2">Economy</h3>
                      <p className="text-amber-700 dark:text-amber-50 font-serif leading-relaxed">
                        {(data as Location).economy}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Establishments */}
              {(data as Location).establishments && (data as Location).establishments!.length > 0 && (
                <div className="fantasy-card p-6">
                  <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                    Notable Establishments
                  </h2>
                  <div className="space-y-4">
                    {(data as Location).establishments!.map((establishment, index) => (
                      <div key={index} className="border-l-4 border-amber-300 pl-4 py-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-50">
                            {establishment.name}
                          </h3>
                          <span className="bg-green-100 dark:bg-green-700 dark:text-amber-50 text-green-700 px-2 py-1 rounded text-sm font-medium capitalize">
                            {establishment.type}
                          </span>
                        </div>
                        <p className="text-amber-700 dark:text-amber-50 font-serif leading-relaxed mb-2">
                          {establishment.description}
                        </p>
                        {establishment.proprietor && (
                          <p className="text-sm text-amber-600 dark:text-amber-50 italic">
                            Proprietor: {establishment.proprietor}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notable Figures */}
              {(data as Location).notableFigures && (data as Location).notableFigures!.length > 0 && (
                <div className="fantasy-card p-6">
                  <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                    Notable Figures
                  </h2>
                  <p className="text-amber-600 dark:text-amber-50 mb-4 italic">Click on any character to view their full profile.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(data as Location).notableFigures!.map((figure, index) => {
                      // Find matching character in the database to get correct ID
                      const allEntries = getAllEntries();
                      const allCharacters = allEntries.filter(e => e.category === 'people').map(e => e.data);
                      const matchingCharacter = allCharacters.find(c => {
                        const characterName = c.name.toLowerCase().replace(/['"]/g, ''); // Remove quotes
                        const figureName = figure.name.toLowerCase();

                        // Extract key parts of the names for flexible matching
                        const characterParts = characterName.split(/\s+/);
                        const figureParts = figureName.split(/\s+/);

                        // Try exact match first
                        if (characterName === figureName) return true;

                        // Try contains match
                        if (characterName.includes(figureName) || figureName.includes(characterName)) return true;

                        // Try partial matching - if figure name has most key parts of character name
                        const keyCharacterParts = characterParts.filter(part =>
                          part !== 'high' && part !== 'prince' && part !== 'princess' &&
                          part !== 'king' && part !== 'queen' && part.length > 2
                        );
                        const keyFigureParts = figureParts.filter(part =>
                          part !== 'high' && part !== 'prince' && part !== 'princess' &&
                          part !== 'king' && part !== 'queen' && part.length > 2
                        );

                        // Check if at least 2 key parts match (like "rathgar" and "ironhammer")
                        const matchingParts = keyCharacterParts.filter(part =>
                          keyFigureParts.some(fp => fp.includes(part) || part.includes(fp))
                        );

                        return matchingParts.length >= 2;
                      });

                      const characterId = matchingCharacter?.id || figure.name.toLowerCase().replace(/\s+/g, '-');

                      return (
                        <Link
                          key={index}
                          to={`/people/${characterId}`}
                          className="bg-amber-50 dark:bg-amber-800 border border-amber-200 dark:border-amber-700 rounded-lg p-4 hover:bg-amber-100 dark:hover:bg-amber-700 transition-colors duration-200 cursor-pointer group"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <img
                                src={`${(import.meta as any).env?.BASE_URL || '/'}images/characters/${figure.name}.webp`}
                                alt={figure.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-amber-300 group-hover:border-amber-400 transition-colors duration-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-50 group-hover:text-amber-900 dark:group-hover:text-white transition-colors duration-200">
                                  {figure.name}
                                </h3>
                                <span className="bg-blue-100 dark:bg-blue-700 dark:text-amber-50 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                                  {figure.race}
                                </span>
                              </div>
                              <p className="text-sm text-amber-600 dark:text-amber-50 font-medium mb-2">
                                {figure.role}
                              </p>
                              <p className="text-amber-700 dark:text-amber-50 font-serif text-sm leading-relaxed">
                                {figure.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Festivals and Events */}
              {(data as Location).festivals && (data as Location).festivals!.length > 0 && (
                <div className="fantasy-card p-6">
                  <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                    Festivals & Events
                  </h2>
                  <div className="space-y-3">
                    {(data as Location).festivals!.map((festival, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-50 mb-2">
                          {festival.name}
                        </h3>
                        <p className="text-amber-700 dark:text-amber-50 font-serif leading-relaxed">
                          {festival.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenges */}
              {(data as Location).challenges && (
                <div className="fantasy-card p-6">
                  <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
                    Current Challenges
                  </h2>
                  <p className="text-amber-700 dark:text-amber-50 font-serif leading-relaxed">
                    {(data as Location).challenges}
                  </p>
                </div>
              )}
            </>
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

          {/* Image Gallery - Only show for non-people categories */}
          {images.length > 0 && entry.category !== 'people' && (
            <div className="fantasy-card p-6">
              <ImageGallery
                images={images}
                title="Gallery"
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          {data.tags && data.tags.length > 0 && (
            <div className="fantasy-card p-4">
              <h3 className="text-lg font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-amber-100 dark:bg-amber-700 text-amber-700 dark:text-amber-50 px-2 py-1 rounded text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cross References - Hide for locations since they now use Notable Figures */}
          {crossRefs.length > 0 && entry.category !== 'places' && (
            <CrossReferences references={crossRefs} />
          )}

          {/* Quick Actions */}
          <div className="fantasy-card p-4">
            <h3 className="text-lg font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                to={`/${entry.category}`}
                className="block w-full text-center fantasy-button text-sm py-2"
              >
                Browse {entry.category}
              </Link>
              <button
                onClick={() => window.print()}
                className="block w-full text-center bg-amber-100 hover:bg-amber-200 text-amber-800 dark:text-amber-50 px-3 py-2 rounded transition-colors duration-200 text-sm"
              >
                Print Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
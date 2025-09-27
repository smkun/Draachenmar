import { Link } from 'react-router-dom';
import { Zap, Crown, Users } from 'lucide-react';
import { deities } from '../data/deities';
// import { generateImagePrompt } from '../utils/imageGenerator';

export function DeitiesPage() {
  // Group deities by pantheon
  const deitiesByPantheon = deities.reduce((acc, deity) => {
    const pantheon = deity.pantheon || 'Other';
    if (!acc[pantheon]) {
      acc[pantheon] = [];
    }
    acc[pantheon].push(deity);
    return acc;
  }, {} as Record<string, typeof deities>);

  const pantheonOrder = [
    'Court of Seasons',
    'Ennead of Eternity',
    'Primordial Concordant',
    'Astral Triad',
    'Other'
  ];

  const pantheonDescriptions: Record<string, string> = {
    'Court of Seasons': 'Divine assembly of four deities representing the eternal cycle of seasons',
    'Ennead of Eternity': 'Nine gods representing all alignments of the cosmic moral order',
    'Primordial Concordant': 'Four elemental deities governing the forces of nature on Uxmal',
    'Astral Triad': 'Three celestial deities embodying the cosmic aspects of the universe',
    'Other': 'Independent divine beings'
  };

  const pantheonIcons: Record<string, string> = {
    'Court of Seasons': '🌿',
    'Ennead of Eternity': '⚖️',
    'Primordial Concordant': '🌋',
    'Astral Triad': '⭐',
    'Other': '✨'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="text-center py-6">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-fantasy font-bold text-amber-800 dark:text-amber-50">
              Divine Pantheons
            </h1>
            <p className="text-lg text-amber-600 dark:text-amber-50 font-serif">
              Gods and Goddesses of Draachenmar
            </p>
          </div>
        </div>

        <p className="text-amber-700 dark:text-amber-50 font-serif max-w-2xl mx-auto">
          Explore the divine beings that shape the cosmos, organized by their celestial hierarchies and pantheons.
        </p>
      </section>

      {/* Pantheons */}
      {pantheonOrder.map(pantheonName => {
        const pantheonDeities = deitiesByPantheon[pantheonName];
        if (!pantheonDeities || pantheonDeities.length === 0) return null;

        return (
          <section key={pantheonName} className="mb-12">
            {/* Pantheon Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl">{pantheonIcons[pantheonName]}</div>
                <div>
                  <h2 className="text-3xl font-fantasy font-bold text-amber-800 dark:text-amber-50">
                    {pantheonName}
                  </h2>
                  <p className="text-amber-600 dark:text-amber-50 font-serif">
                    {pantheonDescriptions[pantheonName]}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-amber-500 dark:text-amber-50">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">{pantheonDeities.length} deities</span>
                </div>
              </div>
            </div>

            {/* Deities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pantheonDeities.map(deity => {
                return (
                  <Link
                    key={deity.id}
                    to={`/pantheons/${deity.id}`}
                    className="fantasy-card p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                  >
                    {/* Deity Image */}
                    <div className="mb-4">
                      <div className="w-full h-64 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-lg border-2 border-yellow-300 shadow-md flex items-center justify-center overflow-hidden relative">
                        {deity.image ? (
                          <div className="w-full h-full">
                            <img
                              src={`${(import.meta as any).env?.BASE_URL || '/'}images/deities/${deity.image}.webp`}
                              alt={deity.name}
                              className="w-full h-full object-contain rounded-lg"
                              onError={(e) => {
                                // Fallback to placeholder if image doesn't exist
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full hidden items-center justify-center">
                              <div className="text-center p-4">
                                <div className="text-4xl mb-2">
                                  {pantheonName === 'Court of Seasons' && deity.name.includes('Spring') && '🌸'}
                                  {pantheonName === 'Court of Seasons' && deity.name.includes('Summer') && '☀️'}
                                  {pantheonName === 'Court of Seasons' && deity.name.includes('Autumn') && '🍂'}
                                  {pantheonName === 'Court of Seasons' && deity.name.includes('Winter') && '❄️'}
                                  {pantheonName === 'Ennead of Eternity' && deity.alignment?.includes('Good') && '😇'}
                                  {pantheonName === 'Ennead of Eternity' && deity.alignment?.includes('Evil') && '😈'}
                                  {pantheonName === 'Ennead of Eternity' && deity.alignment?.includes('Neutral') && '⚖️'}
                                  {pantheonName === 'Primordial Concordant' && deity.name.includes('Water') && '🌊'}
                                  {pantheonName === 'Primordial Concordant' && deity.name.includes('Air') && '💨'}
                                  {pantheonName === 'Primordial Concordant' && deity.name.includes('Earth') && '🏔️'}
                                  {pantheonName === 'Primordial Concordant' && deity.name.includes('Fire') && '🔥'}
                                  {pantheonName === 'Astral Triad' && deity.name.includes('Stars') && '⭐'}
                                  {pantheonName === 'Astral Triad' && deity.name.includes('Sun') && '☀️'}
                                  {pantheonName === 'Astral Triad' && deity.name.includes('Moon') && '🌙'}
                                  {!pantheonName.match(/Court of Seasons|Ennead of Eternity|Primordial Concordant|Astral Triad/) && '✨'}
                                </div>
                                <div className="text-xs text-amber-600 dark:text-amber-50 font-serif italic">
                                  {deity.appearance?.substring(0, 80) || 'Divine being'}...
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-4">
                            <div className="text-4xl mb-2">
                              {pantheonName === 'Court of Seasons' && deity.name.includes('Spring') && '🌸'}
                              {pantheonName === 'Court of Seasons' && deity.name.includes('Summer') && '☀️'}
                              {pantheonName === 'Court of Seasons' && deity.name.includes('Autumn') && '🍂'}
                              {pantheonName === 'Court of Seasons' && deity.name.includes('Winter') && '❄️'}
                              {pantheonName === 'Ennead of Eternity' && deity.alignment?.includes('Good') && '😇'}
                              {pantheonName === 'Ennead of Eternity' && deity.alignment?.includes('Evil') && '😈'}
                              {pantheonName === 'Ennead of Eternity' && deity.alignment?.includes('Neutral') && '⚖️'}
                              {pantheonName === 'Primordial Concordant' && deity.name.includes('Water') && '🌊'}
                              {pantheonName === 'Primordial Concordant' && deity.name.includes('Air') && '💨'}
                              {pantheonName === 'Primordial Concordant' && deity.name.includes('Earth') && '🏔️'}
                              {pantheonName === 'Primordial Concordant' && deity.name.includes('Fire') && '🔥'}
                              {pantheonName === 'Astral Triad' && deity.name.includes('Stars') && '⭐'}
                              {pantheonName === 'Astral Triad' && deity.name.includes('Sun') && '☀️'}
                              {pantheonName === 'Astral Triad' && deity.name.includes('Moon') && '🌙'}
                              {!pantheonName.match(/Court of Seasons|Ennead of Eternity|Primordial Concordant|Astral Triad/) && '✨'}
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-50 font-serif italic">
                              {deity.appearance?.substring(0, 80) || 'Divine being'}...
                            </div>
                          </div>
                        )}

                        {/* AI Image Generation Hint */}
                        <div className="absolute top-2 right-2 bg-amber-700 text-white text-xs px-2 py-1 rounded opacity-75">
                          🎨 AI
                        </div>
                      </div>
                    </div>

                    {/* Deity Info */}
                    <div>
                      <h3 className="text-xl font-fantasy font-bold text-amber-800 dark:text-amber-50 mb-2 group-hover:text-amber-900 dark:text-amber-50">
                        {deity.name}
                      </h3>

                      {deity.title && (
                        <p className="text-amber-600 dark:text-amber-50 font-serif italic text-sm mb-2">
                          {deity.title}
                        </p>
                      )}

                      <div className="space-y-2 mb-3">
                        {deity.alignment && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-amber-100 text-amber-700 dark:text-amber-50 px-2 py-1 rounded">
                              {deity.alignment}
                            </span>
                          </div>
                        )}

                        {deity.domain && deity.domain.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {deity.domain.slice(0, 3).map(domain => (
                              <span key={domain} className="text-xs bg-yellow-100 dark:bg-yellow-700 dark:text-amber-50 text-yellow-700 px-2 py-1 rounded">
                                {domain}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="text-amber-600 dark:text-amber-50 font-serif text-sm line-clamp-3">
                        {deity.description}
                      </p>

                      {deity.holySymbol && (
                        <div className="mt-3 pt-3 border-t border-amber-200">
                          <p className="text-xs text-amber-500 dark:text-amber-50 font-serif">
                            <Crown className="w-3 h-3 inline mr-1" />
                            {deity.holySymbol}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
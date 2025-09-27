import React from 'react';
import { Users, MapPin, Sword, Scroll, Shield, TrendingUp, Database, Network } from 'lucide-react';
import { allData } from '../data';

interface ContentStatsProps {
  showDetails?: boolean;
  className?: string;
}

interface CategoryStats {
  name: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface DetailedStats {
  totalEntries: number;
  totalImages: number;
  totalCrossReferences: number;
  averageCrossReferences: number;
  topCreators: { name: string; count: number }[];
  topTags: { tag: string; count: number }[];
  recentlyUpdated: number;
}

export function ContentStats({ showDetails = false, className = '' }: ContentStatsProps) {
  const data = allData;

  // Calculate basic category statistics
  const categoryStats: CategoryStats[] = [
    {
      name: 'Characters',
      count: data.characters.length,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
      description: 'NPCs, players, deities, and notable figures'
    },
    {
      name: 'Locations',
      count: data.locations.length,
      icon: MapPin,
      color: 'text-green-600 bg-green-100',
      description: 'Cities, kingdoms, landmarks, and regions'
    },
    {
      name: 'Items',
      count: data.items.length,
      icon: Sword,
      color: 'text-purple-600 bg-purple-100',
      description: 'Magical artifacts, weapons, and treasures'
    },
    {
      name: 'Adventures',
      count: data.adventures.length,
      icon: Scroll,
      color: 'text-orange-600 bg-orange-100',
      description: 'Quests, campaigns, and story arcs'
    },
    {
      name: 'Organizations',
      count: data.organizations.length,
      icon: Shield,
      color: 'text-red-600 bg-red-100',
      description: 'Guilds, factions, and institutions'
    }
  ];

  // Calculate detailed statistics
  const getDetailedStats = (): DetailedStats => {
    const totalEntries = categoryStats.reduce((sum, cat) => sum + cat.count, 0);

    // Count total cross-references (this would need the cross-reference function)
    let totalCrossReferences = 0;
    let entriesWithRefs = 0;

    // Count creators
    const creatorCounts = new Map<string, number>();
    const allEntries = [
      ...data.characters,
      ...data.locations,
      ...data.items,
      ...data.adventures,
      ...data.organizations
    ];

    allEntries.forEach(entry => {
      if (entry.creator && entry.creator !== 'Campaign Setting') {
        creatorCounts.set(entry.creator, (creatorCounts.get(entry.creator) || 0) + 1);
      }
    });

    // Count tags
    const tagCounts = new Map<string, number>();
    allEntries.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });

    // Get top creators and tags
    const topCreators = Array.from(creatorCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Count entries with images (this is an approximation)
    const entriesWithImages = allEntries.filter(entry => entry.image).length;

    return {
      totalEntries,
      totalImages: entriesWithImages,
      totalCrossReferences,
      averageCrossReferences: entriesWithRefs > 0 ? totalCrossReferences / entriesWithRefs : 0,
      topCreators,
      topTags,
      recentlyUpdated: 0 // This would need timestamp data
    };
  };

  const detailedStats = showDetails ? getDetailedStats() : null;

  return (
    <div className={`fantasy-card p-6 ${className}`}>
      <h3 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-6 flex items-center">
        <Database className="w-5 h-5 mr-2" />
        Encyclopedia Statistics
      </h3>

      {/* Basic Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {categoryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-amber-50 dark:bg-amber-800 border border-amber-200 dark:border-amber-700 rounded-lg p-4 text-center hover:bg-amber-100 dark:hover:bg-amber-700 transition-colors duration-200"
            >
              <div className={`w-10 h-10 rounded-full ${stat.color} dark:bg-amber-600 flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-5 h-5 dark:text-amber-50" />
              </div>
              <div className="text-2xl font-bold text-amber-800 dark:text-amber-50 mb-1">
                {stat.count}
              </div>
              <div className="text-sm font-medium text-amber-700 dark:text-amber-50 mb-1">
                {stat.name}
              </div>
              {showDetails && (
                <div className="text-xs text-amber-600 dark:text-amber-50">
                  {stat.description}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Statistics */}
      {showDetails && detailedStats && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{detailedStats.totalEntries}</div>
              <div className="text-sm">Total Entries</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{detailedStats.totalImages}</div>
              <div className="text-sm">With Images</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{Math.round((detailedStats.totalImages / detailedStats.totalEntries) * 100)}%</div>
              <div className="text-sm">Image Coverage</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">
                <Network className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-sm">Cross-Referenced</div>
            </div>
          </div>

          {/* Top Contributors */}
          {detailedStats.topCreators.length > 0 && (
            <div>
              <h4 className="text-lg font-fantasy font-medium text-amber-700 dark:text-amber-50 mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Top Contributors
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {detailedStats.topCreators.map((creator, index) => (
                  <div
                    key={creator.name}
                    className="bg-amber-50 dark:bg-amber-800 border border-amber-200 dark:border-amber-700 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-amber-800 dark:text-amber-50">
                          {creator.name}
                        </div>
                        <div className="text-sm text-amber-600 dark:text-amber-50">
                          {creator.count} entries
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Tags */}
          {detailedStats.topTags.length > 0 && (
            <div>
              <h4 className="text-lg font-fantasy font-medium text-amber-700 dark:text-amber-50 mb-3">
                Popular Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {detailedStats.topTags.map((tag) => (
                  <span
                    key={tag.tag}
                    className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-700 dark:to-amber-600 text-amber-800 dark:text-amber-50 text-sm font-medium rounded-full"
                  >
                    {tag.tag}
                    <span className="ml-2 bg-amber-300 dark:bg-amber-500 text-amber-800 dark:text-amber-50 text-xs px-2 py-0.5 rounded-full">
                      {tag.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Utility function to calculate coverage percentage for a specific category
export function calculateCoverage(data: any[], field: string = 'image'): number {
  if (data.length === 0) return 0;
  const withField = data.filter(item => item[field]).length;
  return Math.round((withField / data.length) * 100);
}

// Utility function to get growth metrics (would need historical data)
export function getGrowthMetrics() {
  // This would calculate growth over time if we had timestamp data
  return {
    weeklyGrowth: 0,
    monthlyGrowth: 0,
    totalGrowth: 0
  };
}
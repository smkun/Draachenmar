import { Link } from 'react-router-dom';
import { TrendingUp, BookOpen, Crown } from 'lucide-react';
import { getStatistics } from '../data';

export function HomePage() {
  const stats = getStatistics();

  const narrativeChapters = [
    {
      title: 'The Fall of Bargothia',
      chapter: 'opening-story',
      description: 'The tale of K\'hara and the ruin of a great civilization',
      icon: '🏛️'
    },
    {
      title: 'Gulanbarak - The Wall',
      chapter: 'gulanbarak',
      description: 'The mighty dwarven fortress that holds back darkness',
      icon: '🏰'
    },
    {
      title: 'The Gray Order',
      chapter: 'gray-order',
      description: 'Seekers of Bargothia\'s lost secrets and knowledge',
      icon: '📚'
    },
    {
      title: 'Pantheons & Deities',
      chapter: 'pantheons',
      description: 'The divine powers that shape the world\'s destiny',
      icon: '⚡'
    },
    {
      title: 'Chronicles of Legend',
      chapter: 'chronicles',
      description: 'Epic campaigns that defined the realm\'s history',
      icon: '🗡️'
    },
    {
      title: 'Timeline & Calendar',
      chapter: 'timeline',
      description: 'The chronological record of Draachenmar\'s ages',
      icon: '📅'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Formal Header Section */}
      <section className="text-center py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <BookOpen className="w-12 h-12 text-amber-700 dark:text-amber-50" />
            <div>
              <h1 className="text-5xl font-fantasy font-bold text-amber-800 dark:text-amber-50 leading-tight">
                The Chronicles of Draachenmar
              </h1>
              <p className="text-lg text-amber-600 dark:text-amber-50 font-serif italic">
                A Complete Campaign Compendium • Version 3.4
              </p>
            </div>
          </div>

          <p className="text-xl text-amber-700 dark:text-amber-50 font-serif mb-8 leading-relaxed max-w-3xl mx-auto">
            Explore the rich tapestry of this campaign world through both narrative chronicles
            and detailed compendium entries. Use the navigation above to browse specific categories,
            or dive into the complete story through our chapter system below.
          </p>

          <Link
            to="/search"
            className="fantasy-button text-lg px-8 py-3 inline-flex items-center space-x-2"
          >
            <span>Search the Chronicles</span>
            <TrendingUp className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Statistics Overview */}
      <section className="py-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-2">
            Compendium Overview
          </h2>
          <p className="text-amber-600 dark:text-amber-50 font-serif">
            A comprehensive collection of campaign content
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <div className="fantasy-card p-4 text-center">
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-50">{stats.total}</div>
            <div className="text-sm text-amber-600 dark:text-amber-50">Total Entries</div>
          </div>
          <div className="fantasy-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.characters}</div>
            <div className="text-sm text-amber-600 dark:text-amber-50">People</div>
          </div>
          <div className="fantasy-card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.locations}</div>
            <div className="text-sm text-amber-600 dark:text-amber-50">Places</div>
          </div>
          <div className="fantasy-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.items}</div>
            <div className="text-sm text-amber-600 dark:text-amber-50">Items</div>
          </div>
          <div className="fantasy-card p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.adventures}</div>
            <div className="text-sm text-amber-600 dark:text-amber-50">Adventures</div>
          </div>
          <div className="fantasy-card p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.organizations}</div>
            <div className="text-sm text-amber-600 dark:text-amber-50">Organizations</div>
          </div>
          <div className="fantasy-card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.deities}</div>
            <div className="text-sm text-amber-600 dark:text-amber-50">Pantheons</div>
          </div>
        </div>
      </section>


      {/* Narrative Chronicles */}
      <section className="py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
            Read the Chronicles
          </h2>
          <p className="text-amber-600 dark:text-amber-50 font-serif">
            Experience the complete narrative through structured chapters
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-200 p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {narrativeChapters.map((chapter) => (
              <Link
                key={chapter.chapter}
                to={`/chapter/${chapter.chapter}`}
                className="bg-white p-4 rounded-lg border border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 group"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{chapter.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-fantasy font-semibold text-amber-900 dark:text-amber-50 group-hover:text-amber-800 dark:text-amber-50 mb-1">
                      {chapter.title}
                    </h3>
                    <p className="text-amber-600 dark:text-amber-50 font-serif text-sm leading-relaxed">
                      {chapter.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              to="/chapter/tribute"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-serif transition-colors duration-200"
            >
              <Crown className="w-5 h-5" />
              <span>Begin with the Dedication</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
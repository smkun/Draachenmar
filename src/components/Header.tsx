import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Users, MapPin, Sword, Scroll, Shield, Settings, Zap, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navItems = [
    { path: '/people', label: 'People', icon: Users },
    { path: '/places', label: 'Places', icon: MapPin },
    { path: '/items', label: 'Items', icon: Sword },
    { path: '/adventures', label: 'Adventures', icon: Scroll },
    { path: '/organizations', label: 'Organizations', icon: Shield },
    { path: '/pantheons', label: 'Pantheons', icon: Zap },
  ];

  return (
    <header className="parchment-bg border-b-2 border-amber-300 dark:border-amber-600 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        {/* Main Header */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-200">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-fantasy font-bold text-amber-800 dark:text-amber-50 leading-tight">
                Draachenmar
              </h1>
              <p className="text-sm text-amber-600 dark:text-amber-50 font-serif">
                Campaign Encyclopedia
              </p>
            </div>
          </Link>

          {/* Search Bar and Theme Toggle */}
          <div className="flex items-center space-x-4 flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5" />
                <input
                  type="text"
                  id="global-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the realm..."
                  aria-label="Search characters, locations, items, and other content"
                  className="fantasy-input w-full pl-10 pr-4 py-2 text-gray-700 placeholder-amber-400 dark:text-amber-50 dark:placeholder-amber-300 dark:bg-amber-900/20"
                />
              </div>
            </form>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-800 dark:hover:bg-amber-700 text-amber-700 dark:text-amber-50 transition-all duration-200 group"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <Sun className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center justify-center space-x-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-amber-700 dark:text-amber-50 hover:bg-amber-100 dark:hover:bg-amber-800 hover:text-amber-900 dark:hover:text-amber-50 transition-all duration-200 group"
            >
              <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}

          {/* Admin Link */}
          <Link
            to="/admin"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-amber-600 dark:text-amber-50 hover:bg-amber-100 dark:hover:bg-amber-800 hover:text-amber-800 dark:hover:text-amber-50 transition-all duration-200 group border-l border-amber-300 dark:border-amber-600 ml-2"
            title="Content Curation"
          >
            <Settings className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-medium">Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
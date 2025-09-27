import { useState, useEffect } from 'react';
import { Upload, FileText, Users, MapPin, Sword, Scroll, Shield, CheckCircle, XCircle, Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ExtractedContent {
  characters: any[];
  items: any[];
  locations: any[];
  organizations: any[];
  summary?: {
    extractionDate: string;
    totalExtracted: {
      characters: number;
      items: number;
      locations: number;
      organizations: number;
    };
  };
}

export function AdminPage() {
  const [extractedContent, setExtractedContent] = useState<ExtractedContent | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'items' | 'locations' | 'organizations'>('overview');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadExtractedContent();
  }, []);

  const loadExtractedContent = async () => {
    try {
      // In a real app, this would fetch from an API
      // For now, we'll simulate loading from the extracted content
      const [characters, items, locations, organizations] = await Promise.all([
        fetch('/extracted-content/characters.json').then(r => r.json()).catch(() => []),
        fetch('/extracted-content/items.json').then(r => r.json()).catch(() => []),
        fetch('/extracted-content/locations.json').then(r => r.json()).catch(() => []),
        fetch('/extracted-content/organizations.json').then(r => r.json()).catch(() => [])
      ]);

      setExtractedContent({
        characters,
        items,
        locations,
        organizations,
        summary: {
          extractionDate: new Date().toISOString(),
          totalExtracted: {
            characters: characters.length,
            items: items.length,
            locations: locations.length,
            organizations: organizations.length
          }
        }
      });
    } catch (error) {
      console.error('Failed to load extracted content:', error);
    }
  };

  const toggleItemSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'characters': return Users;
      case 'locations': return MapPin;
      case 'items': return Sword;
      case 'adventures': return Scroll;
      case 'organizations': return Shield;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'characters': return 'text-blue-600 bg-blue-100 dark:bg-blue-700 dark:text-amber-50';
      case 'locations': return 'text-green-600 bg-green-100 dark:bg-green-700 dark:text-amber-50';
      case 'items': return 'text-purple-600 bg-purple-100 dark:bg-purple-700 dark:text-amber-50';
      case 'adventures': return 'text-orange-600 bg-orange-100 dark:bg-orange-700 dark:text-amber-50';
      case 'organizations': return 'text-red-600 bg-red-100 dark:bg-red-700 dark:text-amber-50';
      default: return 'text-gray-600 dark:text-amber-50 bg-gray-100';
    }
  };

  const renderContentTable = (items: any[], category: string) => {
    return (
      <div className="fantasy-card overflow-hidden">
        <div className="p-4 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-fantasy font-semibold text-amber-800 dark:text-amber-50 flex items-center">
              {React.createElement(getCategoryIcon(category), { className: "w-5 h-5 mr-2" })}
              {category.charAt(0).toUpperCase() + category.slice(1)} ({items.length})
            </h3>
            <div className="flex items-center space-x-2">
              <button className="text-sm bg-green-100 dark:bg-green-700 dark:text-amber-50 hover:bg-green-200 dark:hover:bg-green-600 text-green-800 px-3 py-1 rounded transition-colors">
                Approve All
              </button>
              <button className="text-sm bg-red-100 dark:bg-red-700 dark:text-amber-50 hover:bg-red-200 dark:hover:bg-red-600 text-red-800 px-3 py-1 rounded transition-colors">
                Reject Selected
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-amber-50">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    id="select-all-items"
                    className="rounded border-amber-300"
                    aria-label="Select all items in current view"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(new Set([...selectedItems, ...items.map(item => item.id)]));
                      } else {
                        const newSelection = new Set(selectedItems);
                        items.forEach(item => newSelection.delete(item.id));
                        setSelectedItems(newSelection);
                      }
                    }}
                  />
                </th>
                <th className="p-3 text-left text-amber-800 dark:text-amber-50 font-semibold">Name</th>
                <th className="p-3 text-left text-amber-800 dark:text-amber-50 font-semibold">Creator</th>
                <th className="p-3 text-left text-amber-800 dark:text-amber-50 font-semibold">Source</th>
                <th className="p-3 text-left text-amber-800 dark:text-amber-50 font-semibold">Quality</th>
                <th className="p-3 text-left text-amber-800 dark:text-amber-50 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-amber-100 hover:bg-amber-25">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      id={`select-item-${item.id}`}
                      className="rounded border-amber-300"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      aria-label={`Select ${item.name}`}
                    />
                  </td>
                  <td className="p-3">
                    <div>
                      <div className="font-semibold text-amber-800 dark:text-amber-50">{item.name}</div>
                      {item.title && (
                        <div className="text-sm text-amber-600 dark:text-amber-50 italic">{item.title}</div>
                      )}
                      <div className="text-xs text-amber-500 dark:text-amber-50 mt-1 line-clamp-2">
                        {item.description?.substring(0, 100)}...
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-amber-700 dark:text-amber-50">
                    {item.creator || item.source?.creator || 'Unknown'}
                  </td>
                  <td className="p-3 text-amber-700 dark:text-amber-50 text-sm">
                    {item.source?.document || 'Extracted Content'}
                  </td>
                  <td className="p-3">
                    {getQualityScore(item) > 70 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/${category}/${item.id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        className="text-amber-600 dark:text-amber-50 hover:text-amber-800 dark:text-amber-50"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const getQualityScore = (item: any): number => {
    let score = 0;
    if (item.name && item.name.length > 3) score += 20;
    if (item.description && item.description.length > 50) score += 30;
    if (item.creator) score += 15;
    if (item.tags && item.tags.length > 0) score += 10;
    if (item.properties || item.history || item.background) score += 15;
    if (!item.name?.toLowerCase().includes('draachenmar 3.')) score += 10;
    return score;
  };

  if (!extractedContent) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FileText className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <p className="text-amber-600 dark:text-amber-50">Loading extracted content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fantasy-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-fantasy font-bold text-amber-800 dark:text-amber-50 mb-2">
              Content Curation
            </h1>
            <p className="text-amber-600 dark:text-amber-50 font-serif">
              Review and manage extracted content from your Draachenmar documents
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="fantasy-button flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Import New Content</span>
            </button>
          </div>
        </div>
      </div>

      {/* Extraction Summary */}
      {extractedContent.summary && (
        <div className="fantasy-card p-6">
          <h2 className="text-xl font-fantasy font-semibold text-amber-800 dark:text-amber-50 mb-4">
            Latest Extraction Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(extractedContent.summary.totalExtracted).map(([category, count]) => {
              const Icon = getCategoryIcon(category);
              const colorClass = getCategoryColor(category);
              return (
                <div key={category} className="text-center">
                  <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold text-amber-800 dark:text-amber-50">{count}</div>
                  <div className="text-sm text-amber-600 dark:text-amber-50 capitalize">{category}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-amber-100 p-1 rounded-lg">
        {['overview', 'characters', 'items', 'locations', 'organizations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              activeTab === tab
                ? 'bg-white text-amber-800 dark:text-amber-50 shadow'
                : 'text-amber-600 dark:text-amber-50 hover:text-amber-800 dark:text-amber-50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['characters', 'items', 'locations', 'organizations'].map((category) => {
              const items = extractedContent[category as keyof ExtractedContent] as any[];
              const Icon = getCategoryIcon(category);
              const colorClass = getCategoryColor(category);

              return (
                <div key={category} className="fantasy-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-fantasy font-semibold text-amber-800 dark:text-amber-50 flex items-center">
                      <div className={`w-8 h-8 ${colorClass} rounded mr-3 flex items-center justify-center`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h3>
                    <span className="text-2xl font-bold text-amber-700 dark:text-amber-50">{items.length}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-600 dark:text-amber-50">High Quality</span>
                      <span className="text-amber-700 dark:text-amber-50">
                        {items.filter(item => getQualityScore(item) > 70).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-600 dark:text-amber-50">Needs Review</span>
                      <span className="text-amber-700 dark:text-amber-50">
                        {items.filter(item => getQualityScore(item) <= 70).length}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab(category as any)}
                    className="mt-4 w-full text-center bg-amber-100 hover:bg-amber-200 text-amber-800 dark:text-amber-50 py-2 rounded transition-colors duration-200"
                  >
                    Review {category}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab !== 'overview' && (
          <div>
            {renderContentTable(
              extractedContent[activeTab as keyof ExtractedContent] as any[],
              activeTab
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Add React import for JSX
import React from 'react';
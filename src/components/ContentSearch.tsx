import React, { useState, useMemo, memo } from 'react';
import { EducationalModule } from '../types';
import { 
  Search, 
  BookOpen, 
  Trophy, 
  Star, 
  Clock, 
  Filter,
  X,
  ChevronDown,
  TrendingUp
} from 'lucide-react';

interface ContentSearchProps {
  modules: EducationalModule[];
  onModuleSelect: (moduleId: string) => void;
  onBack: () => void;
  className?: string;
}

const ContentSearch: React.FC<ContentSearchProps> = ({
  modules,
  onModuleSelect,
  onBack,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'time' | 'difficulty'>('title');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories and age groups
  const categories = useMemo(() => {
    const cats = new Set(modules.map(m => m.color || 'General'));
    return Array.from(cats);
  }, [modules]);

  const ageGroups = useMemo(() => {
    const ages = new Set(modules.map(m => m.ageGroup).filter(Boolean));
    return Array.from(ages);
  }, [modules]);

  // Filter and sort modules
  const filteredModules = useMemo(() => {
    let filtered = modules;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(module =>
        module.title.toLowerCase().includes(query) ||
        module.summary.toLowerCase().includes(query) ||
        module.description.toLowerCase().includes(query) ||
        module.concepts.some(c => c.title.toLowerCase().includes(query) || c.description.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(module => (module.color || 'General') === selectedCategory);
    }

    // Age group filter
    if (selectedAgeGroup !== 'all') {
      filtered = filtered.filter(module => module.ageGroup === selectedAgeGroup);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'time':
          return parseInt(a.estimatedTime) - parseInt(b.estimatedTime);
        case 'difficulty':
          return (getModuleDifficulty(a) - getModuleDifficulty(b));
        default:
          return 0;
      }
    });

    return filtered;
  }, [modules, searchQuery, selectedCategory, selectedAgeGroup, sortBy]);

  const getModuleIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      'saffron': BookOpen,
      'green': Trophy,
      'navy': Star,
      'General': BookOpen
    };
    return iconMap[category] || BookOpen;
  };

  const getModuleDifficulty = (module: EducationalModule) => {
    // Derive difficulty from estimated time
    const timeNum = parseInt(module.estimatedTime);
    if (timeNum <= 15) return 1; // Easy
    if (timeNum <= 30) return 2; // Medium
    return 3; // Hard
  };

  const renderModuleCard = (module: EducationalModule) => {
    const IconComponent = getModuleIcon(module.color || 'General');
    
    return (
      <div
        key={module.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onModuleSelect(module.id)}
      >
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-6 h-6 text-orange-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-navy text-lg mb-1">{module.title}</h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{module.summary}</p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{module.estimatedTime}</span>
              </div>
              {module.ageGroup && (
                <div className="flex items-center space-x-1">
                  <span>Age {module.ageGroup}</span>
                </div>
              )}
              {(() => {
                const difficulty = getModuleDifficulty(module);
                return (
                  <div className="flex items-center space-x-1">
                    <span>Level {difficulty}</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white ${className}`}>
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-lg font-semibold text-navy">Content Library</h2>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search modules, concepts, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">
            {filteredModules.length} modules found
          </span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="space-y-3">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Age Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Ages</option>
                {ageGroups.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'title' | 'time' | 'difficulty')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="title">Title</option>
                <option value="time">Duration</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="p-4">
        {filteredModules.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredModules.map(renderModuleCard)}
          </div>
        )}
      </div>
    </div>
  );
};

// Memoized component for performance
const MemoizedContentSearch = memo(ContentSearch);
export default MemoizedContentSearch;

import React, { useState, memo } from 'react';
import { UserProfile } from '../types/gamification';
import { EducationalModule } from '../types';
import { 
  BookOpen, 
  Trophy, 
  Star, 
  Clock, 
  CheckCircle, 
  Lock, 
  ArrowRight, 
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

interface LearningPathExplorerProps {
  modules: EducationalModule[];
  userProfile: UserProfile;
  completedModules: string[];
  onModuleSelect: (moduleId: string) => void;
  onBack: () => void;
}

const LearningPathExplorer: React.FC<LearningPathExplorerProps> = ({
  modules,
  userProfile,
  completedModules,
  onModuleSelect,
  onBack
}) => {
  const [selectedPath, setSelectedPath] = useState<string>('beginner');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Define learning paths
  const learningPaths = [
    {
      id: 'beginner',
      title: 'Constitution Explorer',
      description: 'Start your journey with basic concepts',
      color: 'green',
      icon: BookOpen,
      estimatedTime: '2-3 hours',
      modules: ['constitution-basics', 'preamble-basics', 'fundamental-rights-basic']
    },
    {
      id: 'intermediate',
      title: 'Government Structure',
      description: 'Learn about how government works',
      color: 'blue',
      icon: Users,
      estimatedTime: '3-4 hours',
      modules: ['union-government', 'state-government', 'local-self-government']
    },
    {
      id: 'advanced',
      title: 'Rights & Duties',
      description: 'Deep dive into citizens\' rights',
      color: 'purple',
      icon: Trophy,
      estimatedTime: '4-5 hours',
      modules: ['fundamental-rights-detailed', 'fundamental-duties', 'directive-principles']
    },
    {
      id: 'specialized',
      title: 'Constitutional Bodies',
      description: 'Special institutions and their roles',
      color: 'orange',
      icon: Star,
      estimatedTime: '2-3 hours',
      modules: ['election-commission', 'national-commission', 'specialized-bodies']
    }
  ];

  const getPathProgress = (pathModules: string[]) => {
    const completed = pathModules.filter(id => completedModules.includes(id)).length;
    return {
      completed,
      total: pathModules.length,
      percentage: (completed / pathModules.length) * 100
    };
  };

  const getNextModule = (pathModules: string[]) => {
    return pathModules.find(id => !completedModules.includes(id));
  };

  const renderPathCard = (path: typeof learningPaths[0]) => {
    const progress = getPathProgress(path.modules);
    const nextModuleId = getNextModule(path.modules);
    const IconComponent = path.icon;

    return (
      <div
        key={path.id}
        className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
          selectedPath === path.id 
            ? 'border-orange-500 transform scale-105' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setSelectedPath(path.id)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-${path.color}-100 rounded-lg flex items-center justify-center`}>
              <IconComponent className={`w-6 h-6 text-${path.color}-600`} />
            </div>
            <div>
              <h3 className="font-bold text-navy text-lg">{path.title}</h3>
              <p className="text-gray-600 text-sm">{path.description}</p>
            </div>
          </div>
          <ArrowRight className={`w-5 h-5 ${selectedPath === path.id ? 'text-orange-500' : 'text-gray-400'}`} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{progress.completed}/{progress.total} modules</span>
            <span className="text-gray-500 flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{path.estimatedTime}</span>
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 bg-${path.color}-500 rounded-full transition-all duration-500`}
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          
          {progress.completed === progress.total ? (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Path completed!</span>
            </div>
          ) : nextModuleId ? (
            <div className="flex items-center space-x-2 text-orange-600 text-sm">
              <Target className="w-4 h-4" />
              <span>Next: {modules.find(m => m.id === nextModuleId)?.title}</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const renderModuleGrid = () => {
    const selectedPathData = learningPaths.find(p => p.id === selectedPath);
    if (!selectedPathData) return null;

    const pathModules = selectedPathData.modules
      .map(id => modules.find(m => m.id === id))
      .filter(Boolean) as EducationalModule[];

    return (
      <div className="grid grid-cols-1 gap-4">
        {pathModules.map((module, index) => {
          const isCompleted = completedModules.includes(module.id);
          const isLocked = index > 0 && !completedModules.includes(pathModules[index - 1].id);
          
          return (
            <div
              key={module.id}
              className={`bg-white rounded-lg shadow-sm border-2 p-4 ${
                isLocked 
                  ? 'border-gray-200 opacity-50' 
                  : 'border-gray-200 hover:border-orange-300 cursor-pointer'
              }`}
              onClick={() => !isLocked && onModuleSelect(module.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-100' 
                      : isLocked 
                        ? 'bg-gray-100' 
                        : 'bg-orange-100'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5 text-gray-400" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy">{module.title}</h4>
                    <p className="text-gray-600 text-sm">{module.summary}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{module.estimatedTime}</div>
                  <div className="text-xs text-gray-400">Module {index + 1}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-navy">Learning Paths</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                {viewMode === 'grid' ? 'List' : 'Grid'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Learning Paths Overview */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-navy">Choose Your Learning Path</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Follow structured learning paths designed for progressive skill building. Each path contains carefully curated modules.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningPaths.map(renderPathCard)}
          </div>
        </div>

        {/* Selected Path Modules */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <h3 className="text-xl font-bold text-navy">
              {learningPaths.find(p => p.id === selectedPath)?.title} Modules
            </h3>
          </div>
          {renderModuleGrid()}
        </div>
      </div>
    </div>
  );
};

// Memoized component for performance
const MemoizedLearningPathExplorer = memo(LearningPathExplorer);
export default MemoizedLearningPathExplorer;

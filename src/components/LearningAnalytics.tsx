import React, { useState, useEffect, memo } from 'react';
import { UserProfile } from '../types/gamification';
import { 
  TrendingUp, 
  BookOpen, 
  Target, 
  Award, 
  Clock, 
  Brain,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface LearningAnalyticsProps {
  userProfile: UserProfile;
  onModuleSelect: (moduleId: string) => void;
  className?: string;
}

const LearningAnalytics: React.FC<LearningAnalyticsProps> = ({
  userProfile,
  onModuleSelect,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'recommendations'>('overview');

  // Calculate learning metrics
  const learningMetrics = {
    totalStudyTime: userProfile.totalPlayTime,
    streakDays: userProfile.currentStreak,
    completedModules: userProfile.achievements.filter(a => a.id.includes('module')).length,
    averageQuizScore: userProfile.leaderboardStats.quizAccuracy || 0,
    weeklyProgress: 75, // This would be calculated from actual data
    learningVelocity: userProfile.leaderboardStats.weeklyPoints || 0
  };

  // Learning insights
  const getLearningInsights = () => {
    const insights = [];
    
    if (learningMetrics.streakDays >= 7) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        message: `Great job! You've maintained a ${learningMetrics.streakDays}-day learning streak.`,
        action: 'Keep it up!'
      });
    }

    if (learningMetrics.averageQuizScore >= 80) {
      insights.push({
        type: 'achievement',
        icon: Award,
        message: `Excellent quiz performance! You're averaging ${learningMetrics.averageQuizScore}% accuracy.`,
        action: 'You\'re mastering the material!'
      });
    }

    if (learningMetrics.averageQuizScore < 60) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        message: 'Consider reviewing foundational concepts to improve quiz performance.',
        action: 'Take a review module'
      });
    }

    if (learningMetrics.streakDays < 3) {
      insights.push({
        type: 'encouragement',
        icon: Target,
        message: 'Start a daily learning habit to build momentum.',
        action: 'Begin a new module'
      });
    }

    return insights;
  };

  // Smart recommendations
  const getSmartRecommendations = () => {
    const recommendations = [];

    // Based on quiz performance
    if (learningMetrics.averageQuizScore < 70) {
      recommendations.push({
        id: 'review-basics',
        title: 'Review Constitutional Basics',
        description: 'Strengthen your foundation with essential concepts',
        type: 'review',
        priority: 'high',
        estimatedTime: '20 minutes'
      });
    }

    // Based on streak
    if (learningMetrics.streakDays < 5) {
      recommendations.push({
        id: 'daily-practice',
        title: 'Daily Quiz Practice',
        description: 'Build consistency with short daily quizzes',
        type: 'practice',
        priority: 'medium',
        estimatedTime: '10 minutes'
      });
    }

    // Based on study time
    if (learningMetrics.totalStudyTime < 300) { // Less than 5 hours
      recommendations.push({
        id: 'explore-topics',
        title: 'Explore New Topics',
        description: 'Dive deeper into specific constitutional areas',
        type: 'exploration',
        priority: 'medium',
        estimatedTime: '30 minutes'
      });
    }

    return recommendations;
  };

  // Performance tracking data
  const getPerformanceData = () => {
    return {
      weeklyData: [
        { day: 'Mon', points: 45, time: 25 },
        { day: 'Tue', points: 60, time: 35 },
        { day: 'Wed', points: 30, time: 20 },
        { day: 'Thu', points: 75, time: 40 },
        { day: 'Fri', points: 55, time: 30 },
        { day: 'Sat', points: 80, time: 45 },
        { day: 'Sun', points: 70, time: 40 }
      ],
      monthlyProgress: {
        completedModules: 8,
        totalModules: 20,
        quizAccuracy: learningMetrics.averageQuizScore,
        studyStreak: learningMetrics.streakDays
      }
    };
  };

  const insights = getLearningInsights();
  const recommendations = getSmartRecommendations();
  const performanceData = getPerformanceData();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-navy">Learning Analytics</h2>
          </div>
          <div className="flex items-center space-x-2">
            {['overview', 'performance', 'recommendations'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="text-lg font-bold text-navy">
                  {formatTime(learningMetrics.totalStudyTime)}
                </div>
                <div className="text-sm text-gray-600">Total Study Time</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="text-lg font-bold text-navy">
                  {learningMetrics.streakDays}
                </div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div className="text-lg font-bold text-navy">
                  {learningMetrics.completedModules}
                </div>
                <div className="text-sm text-gray-600">Modules Done</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="text-lg font-bold text-navy">
                  {learningMetrics.averageQuizScore}%
                </div>
                <div className="text-sm text-gray-600">Quiz Accuracy</div>
              </div>
            </div>

            {/* Learning Insights */}
            <div>
              <h3 className="text-lg font-semibold text-navy mb-4">Learning Insights</h3>
              <div className="space-y-3">
                {insights.map((insight, index) => {
                  const IconComponent = insight.icon;
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === 'success' ? 'bg-green-50 border-green-500' :
                        insight.type === 'achievement' ? 'bg-yellow-50 border-yellow-500' :
                        insight.type === 'warning' ? 'bg-orange-50 border-orange-500' :
                        'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <IconComponent className={`w-5 h-5 mt-0.5 ${
                          insight.type === 'success' ? 'text-green-600' :
                          insight.type === 'achievement' ? 'text-yellow-600' :
                          insight.type === 'warning' ? 'text-orange-600' :
                          'text-blue-600'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-navy">{insight.message}</p>
                          <p className="text-xs text-gray-600 mt-1">{insight.action}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-navy mb-4">Weekly Performance</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-end space-x-2 h-32">
                  {performanceData.weeklyData.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-orange-500 rounded-t"
                        style={{ height: `${(day.points / 100) * 100}%` }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-1">{day.day}</div>
                      <div className="text-xs text-gray-500">{day.points}pts</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-navy mb-4">Monthly Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-navy">Modules</span>
                  </div>
                  <div className="text-2xl font-bold text-navy">
                    {performanceData.monthlyProgress.completedModules}/
                    {performanceData.monthlyProgress.totalModules}
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${(performanceData.monthlyProgress.completedModules / performanceData.monthlyProgress.totalModules) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-navy">Accuracy</span>
                  </div>
                  <div className="text-2xl font-bold text-navy">
                    {performanceData.monthlyProgress.quizAccuracy}%
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-navy">Smart Recommendations</h3>
            </div>
            
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onModuleSelect(rec.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-navy">{rec.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{rec.estimatedTime}</span>
                        </span>
                        <span className="capitalize">{rec.type}</span>
                      </div>
                    </div>
                    <div className="text-gray-400">→</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Memoized component for performance
const MemoizedLearningAnalytics = memo(LearningAnalytics);
export default MemoizedLearningAnalytics;

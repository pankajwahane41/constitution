// Constitution Builder Component
// Interactive virtual constitution building experience with drag-and-drop functionality

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, ConstitutionBuilderProgress, SavedConstitution, ConstitutionArticle, GameDifficulty } from '../types/gamification';
import { ConstitutionDB, getStorageInstance } from '../lib/storage';
import { PointCalculator } from '../lib/pointCalculator';
import {
  Building,
  Plus,
  BookOpen,
  Users,
  Scale,
  Shield,
  Globe,
  Zap,
  Award,
  Star,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Target,
  Trophy,
  Coins,
  Flame,
  Sparkles,
  X,
  Info,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Move,
  Eye,
  EyeOff,
  Settings,
  HelpCircle,
  Home,
  Share2,
  Bookmark,
  Filter,
  SortAsc,
  Calendar,
  Clock
} from 'lucide-react';

interface DragItem {
  id: string;
  article: ConstitutionArticle;
  type: 'article';
}

interface DropZone {
  id: string;
  title: string;
  description: string;
  icon: string;
  capacity: number;
  required: boolean;
  articles: ConstitutionArticle[];
  color: string;
  isExpanded: boolean;
}

interface BuilderState {
  articles: ConstitutionArticle[];
  selectedSection: string | null;
  isDragging: boolean;
  draggedItem: DragItem | null;
  showTutorial: boolean;
  tutorialStep: number;
  isPlaying: boolean;
  currentTime: number;
  totalTime: number;
  showValidation: boolean;
  validationErrors: string[];
  buildMode: 'easy' | 'guided' | 'creative';
  viewMode: 'grid' | 'list';
  sortBy: 'importance' | 'category' | 'alphabetical';
  filterCategory: string;
  lastSaved: Date | null;
}

interface BuilderStats {
  totalArticles: number;
  placedArticles: number;
  completionPercentage: number;
  activeTime: number;
  sectionsCompleted: string[];
  currentLevel: number;
  experienceGained: number;
  coinsEarned: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  requirement: number;
}

interface ConstitutionBuilderProps {
  userProfile: UserProfile;
  onBack: () => void;
  onProfileUpdate?: (profile: UserProfile) => void;
}

const AVAILABLE_ARTICLES: ConstitutionArticle[] = [
  // Preamble Articles
  {
    id: 'preamble-1',
    title: 'We, the people of India',
    content: 'The opening declaration of the constitution establishing sovereignty of the people',
    category: 'preamble',
    importance: 5,
    placement: { x: 0, y: 0 },
    connections: ['preamble-2']
  },
  {
    id: 'preamble-2',
    title: 'Sovereign Democratic Republic',
    content: 'Establishing India as a sovereign, socialist, secular, democratic, republic',
    category: 'preamble',
    importance: 5,
    placement: { x: 0, y: 0 },
    connections: ['preamble-3']
  },
  {
    id: 'preamble-3',
    title: 'Justice, Liberty, Equality, Fraternity',
    content: 'The four pillars that form the foundation of the Indian constitution',
    category: 'preamble',
    importance: 5,
    placement: { x: 0, y: 0 },
    connections: []
  },

  // Fundamental Rights
  {
    id: 'rights-1',
    title: 'Right to Equality (Article 14-18)',
    content: 'Equality before law, prohibition of discrimination, abolition of untouchability',
    category: 'fundamental_rights',
    importance: 5,
    placement: { x: 0, y: 0 },
    connections: ['rights-2', 'rights-3']
  },
  {
    id: 'rights-2',
    title: 'Right to Freedom (Article 19-22)',
    content: 'Freedom of speech, assembly, movement, and protection against arbitrary arrest',
    category: 'fundamental_rights',
    importance: 5,
    placement: { x: 0, y: 0 },
    connections: ['rights-1', 'rights-4']
  },
  {
    id: 'rights-3',
    title: 'Right against Exploitation (Article 23-24)',
    content: 'Prohibition of forced labor and child labor, protection of human trafficking',
    category: 'fundamental_rights',
    importance: 4,
    placement: { x: 0, y: 0 },
    connections: ['rights-1']
  },
  {
    id: 'rights-4',
    title: 'Right to Freedom of Religion (Article 25-28)',
    content: 'Freedom of conscience, free profession, practice and propagation of religion',
    category: 'fundamental_rights',
    importance: 4,
    placement: { x: 0, y: 0 },
    connections: ['rights-2']
  },
  {
    id: 'rights-5',
    title: 'Cultural and Educational Rights (Article 29-30)',
    content: 'Right of minorities to preserve their culture and establish educational institutions',
    category: 'fundamental_rights',
    importance: 3,
    placement: { x: 0, y: 0 },
    connections: []
  },
  {
    id: 'rights-6',
    title: 'Right to Constitutional Remedies (Article 32)',
    content: 'Right to move the Supreme Court for enforcement of fundamental rights',
    category: 'fundamental_rights',
    importance: 5,
    placement: { x: 0, y: 0 },
    connections: []
  },

  // Directive Principles
  {
    id: 'directive-1',
    title: 'Social and Economic Justice',
    content: 'Promotion of welfare of the people and establishment of a just social order',
    category: 'directive_principles',
    importance: 4,
    placement: { x: 0, y: 0 },
    connections: ['directive-2']
  },
  {
    id: 'directive-2',
    title: 'Equal Justice and Free Legal Aid',
    content: 'Provision for free legal aid and equal access to justice',
    category: 'directive_principles',
    importance: 3,
    placement: { x: 0, y: 0 },
    connections: ['directive-1']
  },
  {
    id: 'directive-3',
    title: 'Right to Work and Education',
    content: 'Provision for adequate means of livelihood and education',
    category: 'directive_principles',
    importance: 4,
    placement: { x: 0, y: 0 },
    connections: []
  },
  {
    id: 'directive-4',
    title: 'Uniform Civil Code',
    content: 'Efforts towards a uniform civil code for all citizens',
    category: 'directive_principles',
    importance: 3,
    placement: { x: 0, y: 0 },
    connections: []
  },

  // Union Government
  {
    id: 'union-1',
    title: 'Executive Power of President',
    content: 'The President shall be the head of the Union executive',
    category: 'union_government',
    importance: 5,
    placement: { x: 0, y: 0 },
    connections: ['union-2']
  },
  {
    id: 'union-2',
    title: 'Council of Ministers',
    content: 'Prime Minister and other ministers constitute the Council of Ministers',
    category: 'union_government',
    importance: 5,
    placement: { x: 0, y: 0 },
    connections: ['union-1', 'union-3']
  },
  {
    id: 'union-3',
    title: 'Parliamentary System',
    content: 'The supreme legislative authority consisting of President, Rajya Sabha and Lok Sabha',
    category: 'union_government',
    importance: 5,
    placement: { x: 0, y: 0 },
    connections: ['union-2']
  },

  // State Government
  {
    id: 'state-1',
    title: 'Governor and State Executive',
    content: 'Governor as the head of state executive in each state',
    category: 'state_government',
    importance: 4,
    placement: { x: 0, y: 0 },
    connections: ['state-2']
  },
  {
    id: 'state-2',
    title: 'State Legislative Assemblies',
    content: 'State legislatures consisting of Governor and Legislative Assembly',
    category: 'state_government',
    importance: 4,
    placement: { x: 0, y: 0 },
    connections: ['state-1']
  },

  // Judiciary
  {
    id: 'judiciary-1',
    title: 'Supreme Court',
    content: 'The Supreme Court of India as the highest court of appeal',
    category: 'judiciary',
    importance: 5,
    placement: { x: 0, y: 0 },
    connections: ['judiciary-2']
  },
  {
    id: 'judiciary-2',
    title: 'Independence of Judiciary',
    content: 'Judicial independence and separation of powers',
    category: 'judiciary',
    importance: 5,
    placement: { x: 0, y: 0 },
    connections: ['judiciary-1']
  },
  {
    id: 'judiciary-3',
    title: 'Judicial Review',
    content: 'Power of the judiciary to review constitutional amendments',
    category: 'judiciary',
    importance: 4,
    placement: { x: 0, y: 0 },
    connections: []
  }
];

const CONSTITUTION_SECTIONS: DropZone[] = [
  {
    id: 'preamble',
    title: 'Preamble',
    description: 'The opening statement of constitutional values and goals',
    icon: '📜',
    capacity: 3,
    required: true,
    articles: [],
    color: 'from-blue-400 to-blue-600',
    isExpanded: true
  },
  {
    id: 'fundamental_rights',
    title: 'Fundamental Rights',
    description: 'Basic rights guaranteed to all citizens',
    icon: '⚖️',
    capacity: 6,
    required: true,
    articles: [],
    color: 'from-green-400 to-green-600',
    isExpanded: true
  },
  {
    id: 'directive_principles',
    title: 'Directive Principles',
    description: 'Guidelines for government policy and governance',
    icon: '🎯',
    capacity: 4,
    required: true,
    articles: [],
    color: 'from-purple-400 to-purple-600',
    isExpanded: true
  },
  {
    id: 'union_government',
    title: 'Union Government',
    description: 'Structure and powers of central government',
    icon: '🏛️',
    capacity: 3,
    required: true,
    articles: [],
    color: 'from-orange-400 to-orange-600',
    isExpanded: true
  },
  {
    id: 'state_government',
    title: 'State Government',
    description: 'Structure and powers of state governments',
    icon: '🏢',
    capacity: 2,
    required: true,
    articles: [],
    color: 'from-teal-400 to-teal-600',
    isExpanded: true
  },
  {
    id: 'judiciary',
    title: 'Judiciary',
    description: 'Court system, judicial powers and independence',
    icon: '⚖️',
    capacity: 3,
    required: true,
    articles: [],
    color: 'from-red-400 to-red-600',
    isExpanded: true
  }
];

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Constitution Builder!',
    content: 'Learn about constitutional principles by building your own constitution with interactive drag-and-drop.',
    position: 'center'
  },
  {
    title: 'Drag and Drop Articles',
    content: 'Click and drag constitutional articles from the left panel to appropriate sections on the right.',
    position: 'right'
  },
  {
    title: 'Build Section by Section',
    content: 'Each section needs specific articles. Follow the guide to understand what each section requires.',
    position: 'left'
  },
  {
    title: 'Save Your Progress',
    content: 'Your constitution is automatically saved. You can also save multiple versions to compare.',
    position: 'bottom'
  },
  {
    title: 'Earn Rewards',
    content: 'Complete sections to earn experience points, coins, and unlock achievements!',
    position: 'center'
  }
];

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-article',
    title: 'First Step',
    description: 'Place your first constitutional article',
    icon: '🌟',
    unlocked: false,
    progress: 0,
    requirement: 1
  },
  {
    id: 'section-master',
    title: 'Section Master',
    description: 'Complete your first constitution section',
    icon: '👑',
    unlocked: false,
    progress: 0,
    requirement: 1
  },
  {
    id: 'constitution-builder',
    title: 'Constitution Builder',
    description: 'Complete an entire constitution',
    icon: '🏗️',
    unlocked: false,
    progress: 0,
    requirement: 1
  },
  {
    id: 'speed-builder',
    title: 'Speed Builder',
    description: 'Complete a constitution in under 10 minutes',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    requirement: 600 // seconds
  }
];

export default function ConstitutionBuilder({ userProfile, onBack, onProfileUpdate }: ConstitutionBuilderProps) {
  // Core state management
  const [builderState, setBuilderState] = useState<BuilderState>({
    articles: AVAILABLE_ARTICLES,
    selectedSection: null,
    isDragging: false,
    draggedItem: null,
    showTutorial: true,
    tutorialStep: 0,
    isPlaying: false,
    currentTime: 0,
    totalTime: 0,
    showValidation: false,
    validationErrors: [],
    buildMode: 'guided',
    viewMode: 'grid',
    sortBy: 'importance',
    filterCategory: 'all',
    lastSaved: null
  });

  const [progress, setProgress] = useState<ConstitutionBuilderProgress>({
    sectionsCompleted: [],
    articlesPlaced: 0,
    totalArticles: 0,
    currentLevel: 1,
    unlockedFeatures: [],
    customConstitutions: [],
    timeSpent: 0,
    collaborativeProjects: []
  });

  const [sections, setSections] = useState<DropZone[]>(CONSTITUTION_SECTIONS);
  const [builderStats, setBuilderStats] = useState<BuilderStats>({
    totalArticles: AVAILABLE_ARTICLES.length,
    placedArticles: 0,
    completionPercentage: 0,
    activeTime: 0,
    sectionsCompleted: [],
    currentLevel: 1,
    experienceGained: 0,
    coinsEarned: 0
  });

  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedConstitutions, setSavedConstitutions] = useState<SavedConstitution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'achievement' | 'level' | 'section'>('achievement');

  const dragZoneRef = useRef<HTMLDivElement>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const storageRef = useRef<ConstitutionDB | null>(null);

  // Initialize storage and load progress
  useEffect(() => {
    const initializeBuilder = async () => {
      try {
        storageRef.current = getStorageInstance();
        await storageRef.current.initialize(userProfile.userId);
        
        // Load saved progress
        const savedProgress = await storageRef.current.getConstitutionBuilderProgress?.();
        if (savedProgress) {
          setProgress(savedProgress);
        }

        // Load saved constitutions
        const savedConstitutions = await storageRef.current.getSavedConstitutions?.();
        if (savedConstitutions) {
          setSavedConstitutions(savedConstitutions);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize builder:', error);
        setIsLoading(false);
      }
    };

    initializeBuilder();
  }, [userProfile.userId]);

  // Timer for active learning time
  useEffect(() => {
    if (builderState.isPlaying) {
      timeIntervalRef.current = setInterval(() => {
        setBuilderState(prev => ({
          ...prev,
          currentTime: prev.currentTime + 1
        }));
        setBuilderStats(prev => ({
          ...prev,
          activeTime: prev.activeTime + 1
        }));
      }, 1000);
    } else {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
    }

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [builderState.isPlaying]);

  // Check and unlock achievements
  const checkAchievements = useCallback(() => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.unlocked) return achievement;

      let progress = 0;
      let unlocked = false;

      switch (achievement.id) {
        case 'first-article':
          progress = builderStats.placedArticles;
          unlocked = progress >= achievement.requirement;
          break;
        case 'section-master':
          progress = builderStats.sectionsCompleted.length;
          unlocked = progress >= achievement.requirement;
          break;
        case 'constitution-builder':
          const totalCapacity = sections.reduce((sum, section) => sum + section.capacity, 0);
          progress = (builderStats.placedArticles / totalCapacity) * 100;
          unlocked = builderStats.placedArticles >= totalCapacity * 0.8; // 80% completion
          break;
        case 'speed-builder':
          progress = builderState.currentTime;
          unlocked = progress <= achievement.requirement && builderStats.completionPercentage >= 80;
          break;
      }

      if (unlocked && !achievement.unlocked) {
        // Show celebration
        setShowCelebration(true);
        setCelebrationType(achievement.id.includes('section') ? 'section' : achievement.id.includes('level') ? 'level' : 'achievement');
        
        // Calculate rewards using unified PointCalculator
        const isSectionAchievement = achievement.id.includes('section');
        const isLevelAchievement = achievement.id.includes('level');
        const isCompleteAchievement = achievement.id.includes('complete');
        
        let performance: any = {};
        let coinsEarned = 0;
        let experienceGained = 0;
        
        if (isSectionAchievement) {
          // Section completion: moderate reward
          performance = {
            score: 85,
            accuracy: 85,
            timeSpent: 300, // 5 minutes
            perfectGame: false,
            difficulty: 'medium' as GameDifficulty,
            gameType: 'constitution_builder'
          };
        } else if (isLevelAchievement) {
          // Level completion: higher reward
          performance = {
            score: 90,
            accuracy: 90,
            timeSpent: 600, // 10 minutes
            perfectGame: true,
            difficulty: 'medium' as GameDifficulty,
            gameType: 'constitution_builder'
          };
        } else {
          // Constitution completion: highest reward
          performance = {
            score: 95,
            accuracy: 95,
            timeSpent: 1800, // 30 minutes
            perfectGame: true,
            difficulty: 'hard' as GameDifficulty,
            gameType: 'constitution_builder'
          };
        }
        
        const pointResult = PointCalculator.calculateGamePoints(
          performance,
          userProfile,
          userProfile?.currentStreak
        );
        
        coinsEarned = pointResult.coinsEarned;
        experienceGained = pointResult.experienceGained;
        
        setBuilderStats(prev => ({
          ...prev,
          experienceGained: prev.experienceGained + experienceGained,
          coinsEarned: prev.coinsEarned + coinsEarned
        }));

        // Update user profile if callback provided
        if (onProfileUpdate) {
          const updatedProfile = {
            ...userProfile,
            experiencePoints: userProfile.experiencePoints + experienceGained,
            constitutionalCoins: userProfile.constitutionalCoins + coinsEarned
          };
          onProfileUpdate(updatedProfile);
        }
      }

      return {
        ...achievement,
        progress,
        unlocked
      };
    }));
  }, [builderStats, builderState.currentTime, sections, userProfile, onProfileUpdate]);

  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  // Auto-save functionality
  useEffect(() => {
    if (!builderState.showTutorial && builderStats.placedArticles > 0) {
      const autoSaveTimer = setTimeout(async () => {
        await saveProgress();
      }, 5000); // Auto-save every 5 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [sections, builderState.showTutorial, builderStats.placedArticles]);

  // Drag and drop handlers
  const handleDragStart = (article: ConstitutionArticle) => {
    setBuilderState(prev => ({
      ...prev,
      isDragging: true,
      draggedItem: { id: article.id, article, type: 'article' }
    }));
  };

  const handleDragEnd = () => {
    setBuilderState(prev => ({
      ...prev,
      isDragging: false,
      draggedItem: null
    }));
    setDraggedOver(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (sectionId: string) => {
    setDraggedOver(sectionId);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    setDraggedOver(null);

    if (!builderState.draggedItem) return;

    const article = builderState.draggedItem.article;
    const section = sections.find(s => s.id === sectionId);
    
    if (!section) return;

    // Check if section is full
    if (section.articles.length >= section.capacity) {
      // Show validation error
      return;
    }

    // Check if article is already in another section
    const existingSection = sections.find(s => 
      s.articles.some(a => a.id === article.id)
    );

    if (existingSection && existingSection.id !== sectionId) {
      // Remove from existing section
      setSections(prev => prev.map(s => 
        s.id === existingSection.id 
          ? { ...s, articles: s.articles.filter(a => a.id !== article.id) }
          : s
      ));
    }

    // Add to new section
    setSections(prev => prev.map(s => 
      s.id === sectionId 
        ? { ...s, articles: [...s.articles, article] }
        : s
    ));

    // Update stats
    setBuilderStats(prev => ({
      ...prev,
      placedArticles: prev.placedArticles + (existingSection ? 0 : 1)
    }));

    // Start timer on first interaction
    if (!builderState.isPlaying && builderStats.placedArticles === 0) {
      setBuilderState(prev => ({ ...prev, isPlaying: true }));
    }

    handleDragEnd();
  };

  // Remove article from section
  const removeArticleFromSection = (articleId: string, sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId 
        ? { ...s, articles: s.articles.filter(a => a.id !== articleId) }
        : s
    ));

    // Check if article is in only one section to update placed count
    const isInOtherSections = sections.some(s => 
      s.id !== sectionId && s.articles.some(a => a.id === articleId)
    );

    if (!isInOtherSections) {
      setBuilderStats(prev => ({
        ...prev,
        placedArticles: Math.max(0, prev.placedArticles - 1)
      }));
    }
  };

  // Tutorial navigation
  const nextTutorialStep = () => {
    if (builderState.tutorialStep < TUTORIAL_STEPS.length - 1) {
      setBuilderState(prev => ({
        ...prev,
        tutorialStep: prev.tutorialStep + 1
      }));
    } else {
      setBuilderState(prev => ({
        ...prev,
        showTutorial: false,
        isPlaying: true
      }));
    }
  };

  const skipTutorial = () => {
    setBuilderState(prev => ({
      ...prev,
      showTutorial: false,
      isPlaying: true
    }));
  };

  // Save functionality
  const saveProgress = async () => {
    if (!storageRef.current) return;

    try {
      const updatedProgress = {
        ...progress,
        sectionsCompleted: sections
          .filter(s => s.articles.length >= s.capacity * 0.7) // 70% completion threshold
          .map(s => s.id),
        articlesPlaced: builderStats.placedArticles,
        totalArticles: builderStats.totalArticles,
        currentLevel: builderStats.currentLevel,
        timeSpent: builderStats.activeTime
      };

      await storageRef.current.saveConstitutionBuilderProgress(updatedProgress);
      
      setBuilderState(prev => ({
        ...prev,
        lastSaved: new Date()
      }));

      setProgress(updatedProgress);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // Save constitution
  const saveConstitution = async (name: string, description: string) => {
    if (!storageRef.current) return;

    try {
      const constitution: SavedConstitution = {
        id: `constitution_${Date.now()}`,
        name,
        description,
        articles: sections.flatMap(s => s.articles),
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        isPublic: false,
        likes: 0,
        collaborators: []
      };

      await storageRef.current.saveConstitution(constitution);
      setSavedConstitutions(prev => [...prev, constitution]);
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Failed to save constitution:', error);
    }
  };

  // Load constitution
  const loadConstitution = async (constitution: SavedConstitution) => {
    // Clear current sections
    setSections(prev => prev.map(s => ({ ...s, articles: [] })));

    // Load articles into sections
    constitution.articles.forEach(article => {
      setSections(prev => prev.map(s => 
        s.id === article.category 
          ? { ...s, articles: [...s.articles, article] }
          : s
      ));
    });

    // Update stats
    setBuilderStats(prev => ({
      ...prev,
      placedArticles: constitution.articles.length
    }));
  };

  // Validation
  const validateConstitution = () => {
    const errors: string[] = [];
    
    sections.forEach(section => {
      if (section.required && section.articles.length === 0) {
        errors.push(`${section.title} section is required but empty`);
      } else if (section.articles.length < section.capacity * 0.5) {
        errors.push(`${section.title} needs at least ${Math.ceil(section.capacity * 0.5)} articles`);
      }

      // Check for required connections
      section.articles.forEach(article => {
        article.connections.forEach(connectionId => {
          const connectedArticle = section.articles.find(a => a.id === connectionId);
          if (!connectedArticle) {
            errors.push(`${article.title} is missing its connected article`);
          }
        });
      });
    });

    setBuilderState(prev => ({
      ...prev,
      showValidation: true,
      validationErrors: errors
    }));

    return errors.length === 0;
  };

  // Filter and sort articles
  const filteredArticles = builderState.articles.filter(article => {
    if (builderState.filterCategory === 'all') return true;
    return article.category === builderState.filterCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (builderState.sortBy) {
      case 'importance':
        return b.importance - a.importance;
      case 'category':
        return a.category.localeCompare(b.category);
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Calculate completion
  const totalCapacity = sections.reduce((sum, section) => sum + section.capacity, 0);
  const currentCompletion = sections.reduce((sum, section) => sum + section.articles.length, 0);
  const completionPercentage = Math.round((currentCompletion / totalCapacity) * 100);

  // Render tutorial overlay
  const renderTutorial = () => {
    if (!builderState.showTutorial) return null;

    const step = TUTORIAL_STEPS[builderState.tutorialStep];
    const isLastStep = builderState.tutorialStep === TUTORIAL_STEPS.length - 1;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-3">{step.title}</h3>
            <p className="text-gray-600 mb-6">{step.content}</p>
            
            <div className="flex justify-center space-x-2 mb-6">
              {TUTORIAL_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= builderState.tutorialStep ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={skipTutorial}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip Tutorial
              </button>
              <button
                onClick={nextTutorialStep}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {isLastStep ? 'Start Building' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render celebration modal
  const renderCelebration = () => {
    if (!showCelebration) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <h3 className="text-xl font-bold text-navy mb-2">Achievement Unlocked!</h3>
          <p className="text-gray-600 mb-4">
            {celebrationType === 'achievement' ? 'Great job! You earned a new achievement.' :
             celebrationType === 'level' ? 'Level up! You\'re getting better at this.' :
             'Section completed! Keep up the excellent work.'}
          </p>
          <div className="text-sm text-gray-500 mb-4">
            +100 XP • +50 Coins
          </div>
          <button
            onClick={() => setShowCelebration(false)}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Awesome!
          </button>
        </div>
      </div>
    );
  };

  // Render achievements panel
  const renderAchievements = () => {
    if (!showAchievements) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-2xl mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-navy">Achievements</h3>
            <button
              onClick={() => setShowAchievements(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border-2 ${
                  achievement.unlocked
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${
                      achievement.unlocked ? 'text-yellow-700' : 'text-gray-600'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.requirement}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            achievement.unlocked ? 'bg-yellow-400' : 'bg-orange-400'
                          }`}
                          style={{
                            width: `${Math.min((achievement.progress / achievement.requirement) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <CheckCircle className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render save dialog
  const renderSaveDialog = () => {
    if (!showSaveDialog) return null;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-navy">Save Constitution</h3>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Constitution Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="My Constitution"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="Describe your constitution..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (name.trim()) {
                    saveConstitution(name, description);
                  }
                }}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Constitution Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Building className="w-8 h-8 text-orange-500" />
                <h1 className="text-2xl font-bold text-navy">Constitution Builder</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Game Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{builderStats.experienceGained} XP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">{builderStats.coinsEarned}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{Math.floor(builderStats.activeTime / 60)}:{(builderStats.activeTime % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAchievements(true)}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  title="Achievements"
                >
                  <Trophy className="w-5 h-5" />
                </button>
                <button
                  onClick={saveProgress}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  title="Save Progress"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  Save Constitution
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Building Progress</span>
            <span className="text-sm text-gray-500">{completionPercentage}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-400 to-green-400 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{currentCompletion} / {totalCapacity} articles placed</span>
            <span>{sections.filter(s => s.articles.length >= s.capacity * 0.7).length} / {sections.length} sections ready</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Article Library */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-navy flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Article Library
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setBuilderState(prev => ({ ...prev, viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' }))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Toggle View"
                  >
                    {builderState.viewMode === 'grid' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={builderState.filterCategory}
                    onChange={(e) => setBuilderState(prev => ({ ...prev, filterCategory: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="preamble">Preamble</option>
                    <option value="fundamental_rights">Fundamental Rights</option>
                    <option value="directive_principles">Directive Principles</option>
                    <option value="union_government">Union Government</option>
                    <option value="state_government">State Government</option>
                    <option value="judiciary">Judiciary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={builderState.sortBy}
                    onChange={(e) => setBuilderState(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="importance">Importance</option>
                    <option value="category">Category</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>
              </div>

              {/* Articles List */}
              <div className={`space-y-2 max-h-96 overflow-y-auto ${
                builderState.viewMode === 'grid' ? 'grid grid-cols-1 gap-2' : ''
              }`}>
                {sortedArticles.map(article => {
                  const isPlaced = sections.some(section => 
                    section.articles.some(a => a.id === article.id)
                  );

                  return (
                    <div
                      key={article.id}
                      draggable
                      onDragStart={() => handleDragStart(article)}
                      onDragEnd={handleDragEnd}
                      className={`p-3 rounded-lg border-2 cursor-move transition-all ${
                        isPlaced
                          ? 'border-green-200 bg-green-50 opacity-60'
                          : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-md'
                      } ${builderState.isDragging ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-navy line-clamp-2">{article.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                              {article.category.replace('_', ' ')}
                            </span>
                            <div className="flex items-center space-x-1">
                              {[...Array(article.importance)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>
                        {!isPlaced && (
                          <Move className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        {isPlaced && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Constitution Builder */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-navy flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Your Constitution
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setBuilderState(prev => ({ ...prev, showValidation: !prev.showValidation }))}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Validate Constitution"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSections(prev => prev.map(s => ({ ...s, isExpanded: !s.isExpanded })))}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Toggle All Sections"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Constitution Sections */}
              <div ref={dragZoneRef} className="space-y-4">
                {sections.map(section => (
                  <div
                    key={section.id}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter(section.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, section.id)}
                    className={`border-2 border-dashed rounded-xl p-4 transition-all ${
                      draggedOver === section.id
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{section.icon}</div>
                        <div>
                          <h3 className="font-bold text-navy">{section.title}</h3>
                          <p className="text-sm text-gray-600">{section.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">
                          {section.articles.length} / {section.capacity}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round((section.articles.length / section.capacity) * 100)}%
                        </div>
                      </div>
                    </div>

                    {/* Progress bar for section */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className={`bg-gradient-to-r ${section.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${(section.articles.length / section.capacity) * 100}%` }}
                      />
                    </div>

                    {/* Articles in this section */}
                    {section.isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {section.articles.map(article => (
                          <div
                            key={article.id}
                            className="p-3 bg-gray-50 rounded-lg border relative group"
                          >
                            <button
                              onClick={() => removeArticleFromSection(article.id, section.id)}
                              className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <h4 className="text-sm font-medium text-navy pr-6">{article.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{article.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-1">
                                {[...Array(article.importance)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                ))}
                              </div>
                              {article.connections.length > 0 && (
                                <div className="text-xs text-blue-600">
                                  <Target className="w-3 h-3 inline mr-1" />
                                  Connected
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Empty slots */}
                        {[...Array(Math.max(0, section.capacity - section.articles.length))].map((_, index) => (
                          <div
                            key={`empty-${index}`}
                            className="p-3 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Drop article here
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Section completion indicator */}
                    {section.articles.length >= section.capacity && (
                      <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Section Complete!</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Validation Results */}
              {builderState.showValidation && builderState.validationErrors.length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center">
                    <X className="w-4 h-4 mr-2" />
                    Validation Issues
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {builderState.validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Message */}
              {completionPercentage >= 80 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="text-center">
                    <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-medium text-green-800">Great Work!</h4>
                    <p className="text-sm text-green-700">
                      You've built a substantial constitution. Consider saving it and sharing with friends!
                    </p>
                    <button
                      onClick={() => setShowSaveDialog(true)}
                      className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      Save Constitution
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-navy">{completionPercentage}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-navy">{builderStats.placedArticles}</div>
              <div className="text-sm text-gray-600">Articles Placed</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-navy">
                {sections.filter(s => s.articles.length >= s.capacity * 0.7).length}
              </div>
              <div className="text-sm text-gray-600">Sections Ready</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-navy">
                {Math.floor(builderStats.activeTime / 60)}m
              </div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
          </div>
        </div>

        {/* Last Saved Indicator */}
        {builderState.lastSaved && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center">
              <Save className="w-3 h-3 mr-1" />
              Last saved: {builderState.lastSaved.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {/* Modals and Overlays */}
      {renderTutorial()}
      {renderCelebration()}
      {renderAchievements()}
      {renderSaveDialog()}
    </div>
  );
}
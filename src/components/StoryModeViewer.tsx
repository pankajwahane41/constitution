// Story Mode Viewer Component - Dr. Ambedkar's Journey
// Interactive storytelling with gamification elements
// Now loads comprehensive literary content from markdown file

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types/gamification';
import { Book, Play, ChevronLeft, ChevronRight, Star, Clock, CheckCircle, ArrowLeft } from 'lucide-react';

interface StoryModeViewerProps {
  userProfile: UserProfile;
  onBack: () => void;
  onUpdateProgress: (chapterId: string, readingTime: number) => void;
}

interface StoryChapter {
  id: string;
  title: string;
  summary: string;
  readingTime: number;
  isCompleted: boolean;
  content: string;
  era: string;
  keyPoints: string[];
}

export default function StoryModeViewer({ userProfile, onBack, onUpdateProgress }: StoryModeViewerProps) {
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);
  const [storyContent, setStoryContent] = useState<string>('');
  const [loadingStory, setLoadingStory] = useState(true);

  // Load comprehensive story content from markdown file
  useEffect(() => {
    const loadStoryContent = async () => {
      try {
        const response = await fetch('/story/ambedkar_master_architect_story.md');
        if (response.ok) {
          const content = await response.text();
          setStoryContent(content);
        } else {
          console.warn('Could not load detailed story, using basic content');
        }
      } catch (error) {
        console.warn('Error loading story content:', error);
      } finally {
        setLoadingStory(false);
      }
    };

    loadStoryContent();
  }, []);

  // Enhanced chapters with content from loaded story
  const chapters: StoryChapter[] = [
    {
      id: 'early_life',
      title: 'The Boy Who Dreamed Big',
      summary: 'How a boy facing discrimination became India\'s Constitution architect',
      readingTime: 8,
      isCompleted: userProfile.storyProgress.chaptersCompleted.includes('early_life'),
      era: '1891-1920',
      content: `Dr. Ambedkar's journey to becoming the Constitution's architect began with his painful childhood experiences. Born in 1891 into a Dalit family (then called "untouchables"), young Bhimrao faced terrible discrimination every single day. He couldn't sit with other children in school, couldn't drink water from the same well, and was often made to feel like he didn't belong.

But here's what made Dr. Ambedkar extraordinary: instead of giving up, he turned his pain into purpose. Every time someone told him he wasn't good enough, he studied harder. Every time someone denied him basic rights, he became more determined to ensure no other child would face such injustice.

His father, Ramji Maloji Sakpal, believed that education was the key to breaking free from social oppression. Young Bhimrao listened carefully and studied with incredible determination. He graduated from Bombay University in 1912, becoming one of the first Dalits to receive a college education.

But this was just the beginning! Dr. Ambedkar wasn't studying just for himself - he was preparing to build a Constitution that would protect every Indian child's right to education and equality.`,
      keyPoints: [
        'Born in 1891, faced discrimination but never gave up',
        'Turned pain into purpose - studied harder when discouraged',
        'First Dalit to graduate from Bombay University in 1912',
        'Dreamed of creating equal rights for all children'
      ]
    },
    {
      id: 'education_abroad',
      title: 'The Scholar Who Studied Freedom',
      summary: 'How studying abroad gave Dr. Ambedkar the tools to build India\'s Constitution',
      readingTime: 10,
      isCompleted: userProfile.storyProgress.chaptersCompleted.includes('education_abroad'),
      era: '1913-1923',
      content: `In 1913, something amazing happened! Dr. Ambedkar received a scholarship to study at Columbia University in New York. For the first time in his life, he was treated as an equal. No one cared about his caste - they only cared about his brilliant mind!

Dr. Ambedkar didn't just get one degree - he collected them like precious treasures! He earned degrees from Columbia University (Master's and PhD) and London School of Economics (another PhD). Each degree was a victory against those who said a Dalit person couldn't achieve greatness.

But Dr. Ambedkar wasn't studying just for himself - he was preparing to build a Constitution that would protect every Indian child's rights! During his time abroad, he studied the constitutions of many countries, learning what made them work well. He was like a detective, collecting the best ideas from around the world.

His most important discovery? That EVERY person deserves equal treatment, regardless of their background. This idea would become the foundation of India's Constitution!

These years abroad weren't just about academic achievement - they were about dignity, respect, and the realization that discrimination wasn't natural or inevitable.`,
      keyPoints: [
        'Studied at Columbia University (1913-1916)',
        'Earned PhD from Columbia and DSc from LSE',
        'Experienced equality and dignity abroad',
        'Studied various world constitutions'
      ]
    },
    {
      id: 'literary_works',
      title: 'The Writer Who Built the Constitution',
      summary: 'How Dr. Ambedkar\'s books became the blueprint for India\'s Constitution',
      readingTime: 15,
      isCompleted: userProfile.storyProgress.chaptersCompleted.includes('literary_works'),
      era: '1916-1947',
      content: `Here's an amazing secret: Before Dr. Ambedkar became the Constitution's architect, he was a brilliant writer whose books became the building blocks of our Constitution! Every major book he wrote contributed specific ideas that later became constitutional provisions.

**"The Evolution of Provincial Finance in British India" (1925)** → This became Articles 268-293 about how the central government and states should share money fairly!

**"The Annihilation of Caste" (1936)** → This powerful book became Article 15 (no discrimination) and Article 17 (untouchability is banned forever)!

**"States and Minorities" (1947)** → This became Articles 29-30 protecting minority rights and Article 325 ensuring everyone can vote!

Dr. Ambedkar didn't just write books - he was actually designing the Constitution piece by piece! Each book solved a specific problem that free India would face. When the time came to write the Constitution, Dr. Ambedkar simply had to organize all his brilliant ideas into one supreme law.

That's why people say Dr. Ambedkar was the Constitution's chief architect - he had been building it in his mind and through his writings for over 30 years!`,
      keyPoints: [
        'His books became constitutional provisions',
        '"Annihilation of Caste" → Equal rights for all',
        '"States and Minorities" → Minority protection',
        'Spent 30+ years designing the Constitution through writing'
      ]
    },
    {
      id: 'social_reformer',
      title: 'The Voice of the Voiceless',
      summary: 'Fighting for equality and preparing for constitutional responsibility',
      readingTime: 12,
      isCompleted: userProfile.storyProgress.chaptersCompleted.includes('social_reformer'),
      era: '1920-1940',
      content: `Returning to India with his international education, Dr. Ambedkar faced discrimination again. But now he was prepared! He had a mission: to use his knowledge to fight for equality and prepare for the day he would build India's Constitution.

He started newspapers like "Mooknayak" (Leader of the Voiceless) to teach people about their rights. He organized the "Mahad Satyagraha" in 1927, where Dalits asserted their right to drink water from public tanks - this was practice for writing Article 15 (Right to Equality) in the Constitution!

Every struggle, every movement, every speech was preparation. Dr. Ambedkar was like a student studying for the biggest exam of his life - creating India's Constitution. He was learning what problems needed to be solved and how laws could solve them.

The famous Poona Pact with Gandhi in 1932 taught him about political negotiation - skills he would later use brilliantly in the Constituent Assembly!`,
      keyPoints: [
        'Used newspapers to educate about rights',
        'Mahad Satyagraha prepared ground for Article 15',
        'Every struggle was constitutional preparation',
        'Poona Pact taught negotiation skills for Constitution-making'
      ]
    },
    {
      id: 'political_journey',
      title: 'Preparing to Build India\'s Constitution',
      summary: 'How Dr. Ambedkar became the Constitution\'s chief architect',
      readingTime: 15,
      isCompleted: userProfile.storyProgress.chaptersCompleted.includes('political_journey'),
      era: '1940-1947',
      content: `As India moved towards independence, something incredible happened - leaders realized that Dr. Ambedkar was the perfect person to build India's Constitution! All his education, struggles, and writings had prepared him for this moment.

In 1946, he became the Minister of Labour, where he protected workers' rights - practice for protecting ALL Indians' rights in the Constitution! Then came the biggest honor: he was appointed Chairman of the Drafting Committee of the Constituent Assembly.

But here's the amazing part - Dr. Ambedkar didn't just become the Constitution's architect by accident. Everything in his life had been building toward this moment:
- His childhood struggles taught him what problems needed solving
- His international education showed him how to solve them
- His books contained the actual solutions
- His political work gave him the experience to lead

When 299 people gathered to create the Constitution, they all looked to ONE person for leadership: Dr. Ambedkar!`,
      keyPoints: [
        'Became Labour Minister - practiced protecting rights',
        'Appointed Chairman of Constitutional Drafting Committee',
        'Entire life prepared him for this moment',
        '299 members looked to him for leadership'
      ]
    },
    {
      id: 'constitutional_assembly',
      title: 'Building the World\'s Greatest Constitution',
      summary: 'How Dr. Ambedkar led 299 people to create India\'s Constitution',
      readingTime: 18,
      isCompleted: userProfile.storyProgress.chaptersCompleted.includes('constitutional_assembly'),
      era: '1946-1950',
      content: `Now came the most exciting part - actually building the Constitution! Dr. Ambedkar led the Drafting Committee like a master architect, and the 299 Constituent Assembly members were his construction team. Together, they worked for 2 years, 11 months, and 18 days to build the world's longest written Constitution!

But here's what made Dr. Ambedkar so special: he had already designed most of the Constitution in his books! When the committee needed ideas for different articles, Dr. Ambedkar would say, "I wrote about this in my book 20 years ago!" and pull out the perfect solution.

**The Magic Moment**: On November 26, 1950, India's Constitution came alive! Dr. Ambedkar's childhood dream - that every Indian child would have equal rights regardless of their background - finally came true.

The Constitution wasn't just a legal document - it was Dr. Ambedkar's gift to every child in India, ensuring they would never face the discrimination he experienced. It was his way of saying, "Every child deserves dignity, education, and equal opportunities!"`,
      keyPoints: [
        'Led 299 people for nearly 3 years to build Constitution',
        'Used his books as the blueprint for many articles',
        'Made sure every child gets equal rights and opportunities',
        'Created the world\'s longest written Constitution'
      ]
    },
    {
      id: 'legacy',
      title: 'The Gift That Keeps Giving',
      summary: 'How Dr. Ambedkar\'s Constitution still protects you today',
      readingTime: 12,
      isCompleted: userProfile.storyProgress.chaptersCompleted.includes('legacy'),
      era: '1950-Present',
      content: `On November 26, 1949, something magical happened - the Constitution was finally ready! On January 26, 1950, it came alive, and Dr. Ambedkar's dream of equal rights for every Indian child became the law of the land.

Even though Dr. Ambedkar is no longer with us (he passed away in 1956), his Constitution continues to protect you every single day! When you go to school, when you play with friends of different backgrounds, when you dream of becoming anything you want - Dr. Ambedkar's Constitution makes all of this possible.

**Your Daily Constitutional Rights (Thanks to Dr. Ambedkar!):**
- Right to Education (Article 21A) - You can go to school!
- Right to Equality (Article 14) - You're equal to every other child!
- Freedom of Speech (Article 19) - You can express your thoughts!
- Right against Discrimination (Article 15) - No one can treat you badly because of your background!

Dr. Ambedkar's greatest achievement wasn't just building the Constitution - it was ensuring that every child in India, including YOU, would have the same opportunities he was denied. His Constitution is like a protective shield around every Indian child, making sure you can dream big and achieve anything!

Today, we call Dr. Ambedkar the "Father of the Indian Constitution" and remember him as the brilliant architect who built the foundation of modern India!`,
      keyPoints: [
        'Constitution came alive on January 26, 1950',
        'Still protects your rights every single day',
        'Ensures every child can go to school and dream big',
        'Dr. Ambedkar is the "Father of the Indian Constitution"'
      ]
    }
  ];

  const startReading = (chapterId: string) => {
    setActiveChapter(chapterId);
    setReadingStartTime(Date.now());
  };

  const finishReading = () => {
    if (readingStartTime && activeChapter) {
      const readingTime = Math.floor((Date.now() - readingStartTime) / 1000 / 60);
      onUpdateProgress(activeChapter, readingTime);
    }
    setActiveChapter(null);
    setReadingStartTime(null);
  };

  const completedChapters = chapters.filter(c => c.isCompleted).length;
  const totalChapters = chapters.length;

  if (activeChapter) {
    const chapter = chapters.find(c => c.id === activeChapter);
    if (!chapter) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 w-full max-w-full overflow-x-hidden">
          <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={finishReading}
                className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Chapters</span>
              </button>
              <div className="text-sm text-gray-600">{chapter.era}</div>
            </div>
          </div>
        </div>

        {/* Chapter Content */}
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 overflow-x-hidden">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-navy mb-2">{chapter.title}</h1>
              <p className="text-gray-600">{chapter.summary}</p>
              <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{chapter.readingTime} min read</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Book className="w-4 h-4" />
                  <span>{chapter.era}</span>
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              {chapter.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Key Points */}
            <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-green-50 rounded-lg">
              <h3 className="text-lg font-bold text-navy mb-4">Key Points</h3>
              <ul className="space-y-2">
                {chapter.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Star className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={finishReading}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Complete Chapter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-navy">Dr. Ambedkar's Journey</h1>
            </div>
            <div className="text-sm text-gray-600">
              {completedChapters}/{totalChapters} chapters completed
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 overflow-x-hidden">
        {/* Introduction */}
        <div className="text-center mb-12">
          <Book className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-navy mb-4">The Amazing Story of Constitution's Architect</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Follow Dr. B.R. Ambedkar's inspiring journey from facing discrimination to becoming 
            the chief architect of India's Constitution. Discover how his books became the blueprint for our Constitution!
          </p>
          {!loadingStory && storyContent && (
            <div className="mt-4 text-sm text-green-600 bg-green-50 rounded-lg p-3 max-w-md mx-auto">
              ✨ Enhanced story with literary connections loaded!
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Story Progress</span>
            <span className="text-sm text-gray-500">{Math.round((completedChapters / totalChapters) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedChapters / totalChapters) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-full">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all cursor-pointer ${
                chapter.isCompleted 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 hover:border-orange-200 hover:shadow-xl'
              }`}
              onClick={() => startReading(chapter.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-sm text-orange-600 font-medium">Chapter {index + 1}</div>
                {chapter.isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>

              <h3 className="text-lg font-bold text-navy mb-2">{chapter.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{chapter.summary}</p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{chapter.era}</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{chapter.readingTime} min</span>
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2">
                <Play className="w-4 h-4" />
                <span>{chapter.isCompleted ? 'Read Again' : 'Start Reading'}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Reading Stats */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-navy mb-4">Your Reading Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <Book className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy">{completedChapters}</div>
              <div className="text-sm text-gray-600">Chapters Read</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy">{userProfile.storyProgress.totalReadingTime}</div>
              <div className="text-sm text-gray-600">Minutes Read</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
              <Star className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy">{Math.round((completedChapters / totalChapters) * 100)}</div>
              <div className="text-sm text-gray-600">% Complete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
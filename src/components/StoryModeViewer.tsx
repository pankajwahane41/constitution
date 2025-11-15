// Story Mode Viewer Component - Dr. Ambedkar's Journey
// Interactive storytelling with gamification elements

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

  const chapters: StoryChapter[] = [
    {
      id: 'early_life',
      title: 'The Architect is Born',
      summary: 'Dr. Ambedkar\'s early life and struggles',
      readingTime: 8,
      isCompleted: userProfile.storyProgress.chaptersCompleted.includes('early_life'),
      era: '1891-1920',
      content: `Born in 1891 in Mhow, Madhya Pradesh, Bhimrao Ramji Ambedkar faced discrimination from an early age due to his caste. Despite these challenges, his exceptional intellect shone through. His father, Ramji Maloji Sakpal, encouraged education, believing it was the key to breaking free from social oppression.

Young Bhimrao excelled in his studies, but faced constant humiliation. He was not allowed to sit with other children, couldn't touch the water pot, and had to sit on gunny sacks. These experiences shaped his understanding of inequality and injustice.

Despite facing numerous obstacles, Ambedkar's determination never wavered. He graduated from Bombay University in 1912, becoming one of the first Dalits to receive a college education. This achievement was just the beginning of his remarkable journey.`,
      keyPoints: [
        'Born in 1891 in Mhow, faced caste discrimination',
        'Father encouraged education as path to freedom',
        'Graduated from Bombay University in 1912',
        'One of first Dalits to receive college education'
      ]
    },
    {
      id: 'education_abroad',
      title: 'Scholar of the World',
      summary: 'Education at Columbia University and London School of Economics',
      readingTime: 10,
      isCompleted: userProfile.storyProgress.chaptersCompleted.includes('education_abroad'),
      era: '1913-1923',
      content: `In 1913, Ambedkar received a scholarship from the Maharaja of Baroda to study at Columbia University in New York. This opportunity transformed his worldview. At Columbia, he was treated as an equal for the first time in his life.

He earned his MA in 1915 and PhD in 1927 from Columbia, writing his thesis on "The Evolution of Provincial Finance in British India." He also studied at the London School of Economics, earning a DSc in Economics.

During his time abroad, Ambedkar was exposed to concepts of democracy, equality, and human rights. He studied the constitutions of various countries, which would later prove invaluable when drafting India's Constitution.

These years abroad weren't just about academic achievement - they were about dignity, respect, and the realization that discrimination wasn't natural or inevitable.`,
      keyPoints: [
        'Studied at Columbia University (1913-1916)',
        'Earned PhD from Columbia and DSc from LSE',
        'Experienced equality and dignity abroad',
        'Studied various world constitutions'
      ]
    },
    {
      id: 'social_reformer',
      title: 'The Voice of the Voiceless',
      summary: 'Fighting for Dalit rights and social justice',
      readingTime: 12,
      isCompleted: userProfile.storyProgress.chaptersCompleted.includes('social_reformer'),
      era: '1920-1940',
      content: `Returning to India, Ambedkar faced the harsh reality of caste discrimination once again. But now he was armed with education, international exposure, and an unshakeable belief in human equality.

He started newspapers like "Mooknayak" (Leader of the Voiceless) and "Bahishkrit Bharat" to raise awareness about Dalit issues. He organized the "Mahad Satyagraha" in 1927, where Dalits asserted their right to drink water from public tanks.

Ambedkar founded the Independent Labour Party in 1936 and later the Scheduled Castes Federation. He advocated for separate electorates for Dalits, leading to the famous Poona Pact with Gandhi in 1932.

Through his relentless efforts, he brought Dalit issues to national and international attention, forcing society to confront its prejudices and work towards true equality.`,
      keyPoints: [
        'Founded newspapers to voice Dalit concerns',
        'Led Mahad Satyagraha for water rights',
        'Poona Pact with Gandhi (1932)',
        'Founded political parties for Dalits'
      ]
    },
    {
      id: 'political_journey',
      title: 'The Political Architect',
      summary: 'Entry into politics and constitutional work',
      readingTime: 15,
      isCompleted: userProfile.storyProgress.chaptersCompleted.includes('political_journey'),
      era: '1940-1947',
      content: `As India moved towards independence, Ambedkar's expertise in law and governance became invaluable. Despite initial differences with the Congress party, leaders recognized his brilliance and integrity.

In 1946, he was invited to join the Interim Government as the Minister of Labour. This position gave him a platform to implement policies protecting workers' rights and improving labor conditions.

When the Constituent Assembly was formed, Ambedkar was appointed as the Chairman of the Drafting Committee. This was recognition of his legal expertise, his understanding of constitutional matters, and his commitment to social justice.

His political journey wasn't easy - he faced opposition from various quarters, but his vision of an egalitarian society guided every decision he made.`,
      keyPoints: [
        'Joined Interim Government as Labour Minister',
        'Appointed Chairman of Drafting Committee',
        'Recognized for legal and constitutional expertise',
        'Advocated for worker and minority rights'
      ]
    },
    {
      id: 'constitutional_assembly',
      title: 'Crafting the Constitution',
      summary: 'Leading the Drafting Committee',
      readingTime: 18,
      isCompleted: userProfile.storyProgress.chaptersCompleted.includes('constitutional_assembly'),
      era: '1946-1950',
      content: `As Chairman of the Drafting Committee, Ambedkar led the monumental task of creating India's Constitution. The committee met for 166 days over nearly three years, carefully crafting each article.

Ambedkar's vast knowledge of world constitutions proved invaluable. He drew inspiration from various sources - the Government of India Act 1935, the American Bill of Rights, the Irish Constitution, and many others.

He ensured that the Constitution included strong provisions for fundamental rights, especially for marginalized communities. Article 14 (Equality before law), Article 15 (Prohibition of discrimination), and Article 17 (Abolition of untouchability) bore his influence.

The Constitution wasn't just a legal document for Ambedkar - it was a tool for social transformation, a means to create the egalitarian society he had always envisioned.`,
      keyPoints: [
        'Led Drafting Committee for 3 years',
        'Drew from world\'s best constitutional practices',
        'Ensured strong fundamental rights provisions',
        'Constitution as tool for social transformation'
      ]
    },
    {
      id: 'legacy',
      title: 'The Eternal Legacy',
      summary: 'Dr. Ambedkar\'s lasting impact on India',
      readingTime: 12,
      isCompleted: userProfile.storyProgress.chaptersCompleted.includes('legacy'),
      era: '1950-Present',
      content: `On November 26, 1949, the Constituent Assembly adopted the Constitution. On January 26, 1950, it came into effect, making India a republic. Dr. Ambedkar's dream of a democratic, secular, and egalitarian India was now enshrined in law.

Though he passed away in 1956, his legacy lives on. The Constitution he helped craft has weathered numerous challenges and continues to protect the rights of all Indians. The fundamental rights he championed have empowered millions.

Today, Dr. Ambedkar is remembered not just as the "Father of the Indian Constitution" but as a champion of human rights, a visionary leader, and an inspiration to all who fight for justice and equality.

His life teaches us that no barrier is insurmountable, no dream too big, and no cause too difficult when one has education, determination, and an unshakeable belief in human dignity.`,
      keyPoints: [
        'Constitution adopted November 26, 1949',
        'Became effective January 26, 1950',
        'Legacy of rights and social justice',
        'Inspiration for future generations'
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
          <h2 className="text-3xl font-bold text-navy mb-4">The Story of Constitution's Architect</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Follow Dr. B.R. Ambedkar's inspiring journey from facing discrimination to becoming 
            the chief architect of India's Constitution.
          </p>
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
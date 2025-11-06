// Dr. Ambedkar Story Mode System for University of Indian Constitution
// Interactive storytelling following the master architect's journey

export interface StoryChapter {
  id: string;
  title: string;
  subtitle: string;
  order: number;
  estimatedReadTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  content: StorySection[];
  quiz: StoryQuiz;
  unlockRequirement?: {
    type: 'previous_chapter' | 'achievement' | 'level';
    value: string | number;
  };
  rewards: {
    coins: number;
    experience: number;
    unlocks?: string[];
  };
  isCompleted: boolean;
  completedAt?: string;
}

export interface StorySection {
  id: string;
  type: 'narrative' | 'dialogue' | 'historical_fact' | 'interactive' | 'reflection';
  title?: string;
  content: string;
  speaker?: string; // For dialogue sections
  animation?: string;
  illustration?: string;
  audioNarration?: string;
  interactiveElements?: InteractiveElement[];
  childFriendlyAnalogy?: string;
  keyLearning: string;
}

export interface InteractiveElement {
  type: 'choice' | 'drag_drop' | 'timeline' | 'map' | 'comparison';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation: string;
  reward?: number; // bonus coins
}

export interface StoryQuiz {
  questions: StoryQuizQuestion[];
  passingScore: number; // percentage
  rewards: {
    coins: number;
    experience: number;
  };
}

export interface StoryQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export class AmbedkarStoryMode {
  private chapters: StoryChapter[] = [];
  private currentProgress: any = null;

  constructor() {
    this.initializeStoryChapters();
  }

  private initializeStoryChapters(): void {
    this.chapters = [
      // Chapter 1: Early Life and Education
      {
        id: 'chapter_1_early_life',
        title: 'The Young Scholar',
        subtitle: 'Dr. Ambedkar\'s Early Life and Struggles',
        order: 1,
        estimatedReadTime: 8,
        difficulty: 'easy',
        tags: ['early_life', 'education', 'social_challenges'],
        content: [
          {
            id: 'section_1_1',
            type: 'narrative',
            content: `Meet young Bhimrao Ambedkar, born in 1891 in a small military town called Mhow. Imagine a curious, bright boy who loved learning more than anything else in the world! But Bhimrao faced challenges that no child should face - people treated him differently because of the family he was born into.`,
            childFriendlyAnalogy: `Think of a smart student being told they can't sit with other children or drink from the same water fountain - that's what happened to young Bhimrao every day.`,
            keyLearning: 'Even great leaders face challenges early in life, but education becomes their superpower.',
            illustration: '/story/young_ambedkar_studying.jpg'
          },
          {
            id: 'section_1_2',
            type: 'dialogue',
            speaker: 'Young Ambedkar',
            content: `"I will study hard and become so educated that one day I will help change the rules that are unfair to people like me. Books will be my weapons, and knowledge will be my strength!"`,
            keyLearning: 'Education is the most powerful tool for fighting injustice.'
          },
          {
            id: 'section_1_3',
            type: 'historical_fact',
            title: 'Amazing Fact!',
            content: `Bhimrao was the first person from his community to complete high school AND the first to attend college! He was like a superhero breaking barriers that had never been broken before.`,
            childFriendlyAnalogy: `Imagine being the first kid from your neighborhood to become an astronaut - that's how special Bhimrao's achievements were!`,
            keyLearning: 'Being "first" in something requires courage and determination.'
          },
          {
            id: 'section_1_4',
            type: 'interactive',
            content: `Young Ambedkar had to make an important choice about his education. What do you think he should do?`,
            interactiveElements: [
              {
                type: 'choice',
                question: 'When Ambedkar faced discrimination at school, what did he choose to do?',
                options: [
                  'Give up on education',
                  'Study even harder to prove himself',
                  'Only study at home',
                  'Move to another town'
                ],
                correctAnswer: 'Study even harder to prove himself',
                explanation: 'Ambedkar believed education was the key to equality and worked twice as hard to succeed!',
                reward: 25
              }
            ],
            keyLearning: 'When facing obstacles, working harder often leads to greater success.'
          },
          {
            id: 'section_1_5',
            type: 'reflection',
            title: 'Think About It',
            content: `Dr. Ambedkar once said, "Education is the milk of a lioness - whoever drinks it will become brave." What do you think he meant by this?`,
            keyLearning: 'Education gives us the courage to stand up for what is right.'
          }
        ],
        quiz: {
          questions: [
            {
              id: 'q1_1',
              question: 'What made young Bhimrao Ambedkar\'s educational achievements so special?',
              options: [
                'He was a very fast reader',
                'He was the first from his community to complete high school',
                'He studied many languages',
                'He got the highest marks in class'
              ],
              correctAnswer: 1,
              explanation: 'Ambedkar broke barriers by becoming the first from his community to achieve higher education.',
              difficulty: 'easy',
              category: 'early_life'
            },
            {
              id: 'q1_2',
              question: 'According to Dr. Ambedkar, education is like:',
              options: [
                'The milk of a lioness',
                'A magic potion',
                'A golden key',
                'A bright light'
              ],
              correctAnswer: 0,
              explanation: 'Dr. Ambedkar said "Education is the milk of a lioness - whoever drinks it will become brave."',
              difficulty: 'medium',
              category: 'philosophy'
            }
          ],
          passingScore: 70,
          rewards: {
            coins: 100,
            experience: 50
          }
        },
        rewards: {
          coins: 150,
          experience: 75,
          unlocks: ['avatar_item_student_cap']
        },
        isCompleted: false
      },

      // Chapter 2: Higher Education and Foreign Studies
      {
        id: 'chapter_2_higher_education',
        title: 'The Global Scholar',
        subtitle: 'Studying at Columbia University and London School of Economics',
        order: 2,
        estimatedReadTime: 10,
        difficulty: 'medium',
        tags: ['higher_education', 'international_studies', 'academic_excellence'],
        unlockRequirement: { type: 'previous_chapter', value: 'chapter_1_early_life' },
        content: [
          {
            id: 'section_2_1',
            type: 'narrative',
            content: `Picture this amazing journey - a young man from a small Indian town traveling across the ocean to study at Columbia University in New York! This was like a village boy becoming a space explorer. Bhimrao was now Dr. Ambedkar in the making, collecting knowledge from the best universities in the world.`,
            childFriendlyAnalogy: `Imagine if you could collect superpowers from different superhero schools around the world - that's what Ambedkar did with knowledge!`,
            keyLearning: 'Global education helps us understand how to solve problems in our own country.',
            illustration: '/story/ambedkar_columbia_university.jpg'
          },
          {
            id: 'section_2_2',
            type: 'historical_fact',
            title: 'Incredible Achievement!',
            content: `Dr. Ambedkar earned not one, not two, but MULTIPLE degrees! He got a Master's from Columbia University, studied law at Gray's Inn London, and earned a Doctor of Philosophy (Ph.D.) degree. He was like a knowledge collector!`,
            keyLearning: 'Continuous learning throughout life makes us better leaders.'
          },
          {
            id: 'section_2_3',
            type: 'interactive',
            content: `Dr. Ambedkar studied different subjects to prepare for his future role. Can you match the subject with why it was important?`,
            interactiveElements: [
              {
                type: 'drag_drop',
                question: 'Match the subjects Dr. Ambedkar studied with their importance for Constitution-making:',
                options: ['Economics', 'Political Science', 'Law', 'History'],
                explanation: 'Each subject helped him understand different aspects of governance and justice.',
                reward: 30
              }
            ],
            keyLearning: 'Well-rounded education prepares us for complex challenges.'
          }
        ],
        quiz: {
          questions: [
            {
              id: 'q2_1',
              question: 'Dr. Ambedkar studied at which famous American university?',
              options: ['Harvard University', 'Columbia University', 'Yale University', 'Princeton University'],
              correctAnswer: 1,
              explanation: 'Dr. Ambedkar earned his Master\'s degree from Columbia University in New York.',
              difficulty: 'easy',
              category: 'education'
            }
          ],
          passingScore: 70,
          rewards: {
            coins: 120,
            experience: 60
          }
        },
        rewards: {
          coins: 200,
          experience: 100,
          unlocks: ['avatar_item_graduation_cap', 'background_university']
        },
        isCompleted: false
      },

      // Chapter 3: Social Reform and Fighting Injustice
      {
        id: 'chapter_3_social_reform',
        title: 'The Justice Fighter',
        subtitle: 'Fighting for Equal Rights and Social Justice',
        order: 3,
        estimatedReadTime: 12,
        difficulty: 'medium',
        tags: ['social_reform', 'equality', 'justice', 'activism'],
        unlockRequirement: { type: 'previous_chapter', value: 'chapter_2_higher_education' },
        content: [
          {
            id: 'section_3_1',
            type: 'narrative',
            content: `Now Dr. Ambedkar returned to India as a superhero lawyer armed with the best education in the world. But he saw that many people in India were still treated unfairly. Like a brave knight, he decided to fight these injustices using his most powerful weapons - his knowledge, his pen, and his voice.`,
            childFriendlyAnalogy: `Think of Dr. Ambedkar as a superhero lawyer whose mission was to make sure everyone got fair treatment, just like making sure everyone gets an equal turn on the playground!`,
            keyLearning: 'True education means using knowledge to help others and fight injustice.',
            illustration: '/story/ambedkar_social_reformer.jpg'
          },
          {
            id: 'section_3_2',
            type: 'dialogue',
            speaker: 'Dr. Ambedkar',
            content: `"I want to create a society where everyone is treated with dignity and respect, regardless of which family they are born into. Every person should have equal opportunities to learn, grow, and contribute to our nation."`,
            keyLearning: 'Great leaders work for everyone\'s welfare, not just their own.'
          },
          {
            id: 'section_3_3',
            type: 'interactive',
            content: `Dr. Ambedkar started newspapers and organizations to spread awareness. Let's see what methods he used to bring change:`,
            interactiveElements: [
              {
                type: 'timeline',
                question: 'Arrange Dr. Ambedkar\'s social reform activities in the right order:',
                options: ['Starting newspapers', 'Organizing movements', 'Writing books', 'Giving speeches'],
                explanation: 'Dr. Ambedkar used multiple peaceful methods to bring social change.',
                reward: 35
              }
            ],
            keyLearning: 'Social change happens through education, organization, and peaceful methods.'
          }
        ],
        quiz: {
          questions: [
            {
              id: 'q3_1',
              question: 'What was Dr. Ambedkar\'s main goal in his social reform work?',
              options: [
                'To become famous',
                'To make money',
                'To ensure equal treatment for all people',
                'To start a political party'
              ],
              correctAnswer: 2,
              explanation: 'Dr. Ambedkar\'s primary goal was social justice and equality for all people.',
              difficulty: 'medium',
              category: 'social_reform'
            }
          ],
          passingScore: 75,
          rewards: {
            coins: 150,
            experience: 75
          }
        },
        rewards: {
          coins: 250,
          experience: 125,
          unlocks: ['badge_social_reformer', 'avatar_item_justice_scale']
        },
        isCompleted: false
      },

      // Chapter 4: Joining the Constituent Assembly
      {
        id: 'chapter_4_constituent_assembly',
        title: 'The Constitution Maker',
        subtitle: 'Joining India\'s Constituent Assembly',
        order: 4,
        estimatedReadTime: 15,
        difficulty: 'hard',
        tags: ['constituent_assembly', 'constitution_making', 'leadership'],
        unlockRequirement: { type: 'previous_chapter', value: 'chapter_3_social_reform' },
        content: [
          {
            id: 'section_4_1',
            type: 'narrative',
            content: `The year was 1946, and India was preparing for independence. Our country needed a rulebook - a Constitution - to guide the new nation. Dr. Ambedkar was chosen to be part of the special team called the Constituent Assembly. This was like being selected for the most important project in India's history!`,
            childFriendlyAnalogy: `Imagine if you were chosen to help write the rules for the entire school - that's how important Dr. Ambedkar's role was, but for the whole country!`,
            keyLearning: 'The greatest honor is being trusted to help shape your nation\'s future.',
            illustration: '/story/constituent_assembly_meeting.jpg'
          },
          {
            id: 'section_4_2',
            type: 'historical_fact',
            title: 'Amazing Responsibility!',
            content: `The Constituent Assembly had 299 members, but Dr. Ambedkar quickly became known as the most knowledgeable person about constitutions from around the world. He had studied constitutions of many countries and knew exactly what would work best for India.`,
            keyLearning: 'Preparation and knowledge make great leaders indispensable.'
          },
          {
            id: 'section_4_3',
            type: 'interactive',
            content: `Dr. Ambedkar brought unique skills to the Constituent Assembly. Let's see what made him special:`,
            interactiveElements: [
              {
                type: 'comparison',
                question: 'Compare Dr. Ambedkar\'s qualifications with what the Constitution-making job required:',
                options: ['Legal expertise', 'International education', 'Understanding of social issues', 'Knowledge of other constitutions'],
                explanation: 'Dr. Ambedkar was perfectly qualified for the Constitution-making task.',
                reward: 40
              }
            ],
            keyLearning: 'The right person in the right place can change history.'
          }
        ],
        quiz: {
          questions: [
            {
              id: 'q4_1',
              question: 'What was the Constituent Assembly\'s main job?',
              options: [
                'To fight for independence',
                'To write India\'s Constitution',
                'To form the first government',
                'To divide the country'
              ],
              correctAnswer: 1,
              explanation: 'The Constituent Assembly was responsible for drafting India\'s Constitution.',
              difficulty: 'easy',
              category: 'constitution_making'
            }
          ],
          passingScore: 75,
          rewards: {
            coins: 175,
            experience: 90
          }
        },
        rewards: {
          coins: 300,
          experience: 150,
          unlocks: ['background_constituent_assembly', 'badge_constitution_maker']
        },
        isCompleted: false
      },

      // Chapter 5: The Master Architect at Work
      {
        id: 'chapter_5_master_architect',
        title: 'The Master Architect',
        subtitle: 'Dr. Ambedkar as Chairman of the Drafting Committee',
        order: 5,
        estimatedReadTime: 18,
        difficulty: 'hard',
        tags: ['drafting_committee', 'constitution_drafting', 'leadership'],
        unlockRequirement: { type: 'previous_chapter', value: 'chapter_4_constituent_assembly' },
        content: [
          {
            id: 'section_5_1',
            type: 'narrative',
            content: `Here comes the most exciting part! Dr. Ambedkar was chosen as the Chairman of the Drafting Committee - the most important job in Constitution-making. Think of him as the chief architect designing the blueprint for India's future. He was not just a member; he was THE LEADER of Constitution-making!`,
            childFriendlyAnalogy: `If India's Constitution was like building the world's most important house, Dr. Ambedkar was the master architect who designed every room, every door, and every window!`,
            keyLearning: 'Dr. Ambedkar was the primary architect and leader of India\'s Constitution.',
            illustration: '/story/ambedkar_drafting_committee_chairman.jpg'
          },
          {
            id: 'section_5_2',
            type: 'dialogue',
            speaker: 'Dr. Ambedkar',
            content: `"I will ensure that this Constitution protects every citizen equally, gives voice to the voiceless, and creates a just society where everyone can live with dignity. This Constitution will be India's gift to its people and to the world."`,
            keyLearning: 'Great leaders think about everyone, especially those who need protection most.'
          },
          {
            id: 'section_5_3',
            type: 'historical_fact',
            title: 'Master Architect in Action!',
            content: `Dr. Ambedkar worked day and night for almost 3 years! He read constitutions from over 60 countries, prepared detailed drafts, led hundreds of discussions, and personally wrote many crucial parts. The other members called him "the living encyclopedia of constitutional law."`,
            keyLearning: 'Exceptional results require exceptional effort and dedication.'
          },
          {
            id: 'section_5_4',
            type: 'interactive',
            content: `Let's see how Dr. Ambedkar designed different parts of the Constitution:`,
            interactiveElements: [
              {
                type: 'drag_drop',
                question: 'Match Dr. Ambedkar\'s constitutional provisions with their purposes:',
                options: ['Fundamental Rights', 'Fundamental Duties', 'Directive Principles', 'Amendment Process'],
                explanation: 'Each part of the Constitution serves a specific purpose in protecting and guiding citizens.',
                reward: 50
              }
            ],
            keyLearning: 'A good Constitution balances rights, duties, and guidelines for governance.'
          }
        ],
        quiz: {
          questions: [
            {
              id: 'q5_1',
              question: 'Dr. Ambedkar was the Chairman of which important committee?',
              options: [
                'Finance Committee',
                'Drafting Committee',
                'Rules Committee',
                'Language Committee'
              ],
              correctAnswer: 1,
              explanation: 'Dr. Ambedkar was the Chairman of the Drafting Committee, making him the chief architect of the Constitution.',
              difficulty: 'medium',
              category: 'constitution_making'
            }
          ],
          passingScore: 80,
          rewards: {
            coins: 200,
            experience: 100
          }
        },
        rewards: {
          coins: 400,
          experience: 200,
          unlocks: ['badge_master_architect', 'avatar_item_architectural_tools', 'background_drafting_room']
        },
        isCompleted: false
      },

      // Chapter 6: The Constitution is Born and Dr. Ambedkar's Legacy
      {
        id: 'chapter_6_constitution_legacy',
        title: 'The Constitution is Born',
        subtitle: 'Completion of the Constitution and Dr. Ambedkar\'s Eternal Legacy',
        order: 6,
        estimatedReadTime: 20,
        difficulty: 'hard',
        tags: ['constitution_completion', 'legacy', 'national_impact'],
        unlockRequirement: { type: 'previous_chapter', value: 'chapter_5_master_architect' },
        content: [
          {
            id: 'section_6_1',
            type: 'narrative',
            content: `November 26, 1949 - a day that changed India forever! After years of hard work under Dr. Ambedkar's leadership, the Constitution was finally ready. It was the longest written Constitution in the world, and Dr. Ambedkar was rightfully called "The Father of the Indian Constitution." His masterpiece would guide India for generations to come!`,
            childFriendlyAnalogy: `Imagine completing the most difficult puzzle in the world - that's what Dr. Ambedkar did with India's Constitution, except this puzzle would help 1.4 billion people live better lives!`,
            keyLearning: 'Dr. Ambedkar\'s Constitutional masterpiece continues to protect and guide India today.',
            illustration: '/story/constitution_signing_ceremony.jpg'
          },
          {
            id: 'section_6_2',
            type: 'dialogue',
            speaker: 'Dr. Ambedkar at the final Assembly session',
            content: `"On November 26, 1949, we are going to enter into a life of contradictions. In politics we will have equality, and in social and economic life we will have inequality. We must remove this contradiction, or those who suffer from inequality will blow up the structure of political democracy."`,
            keyLearning: 'Dr. Ambedkar understood that true democracy requires both political and social equality.'
          },
          {
            id: 'section_6_3',
            type: 'historical_fact',
            title: 'Eternal Legacy!',
            content: `Today, over 75 years later, Dr. Ambedkar's Constitution still guides India as the world's largest democracy. Every right you enjoy, every protection you have, every opportunity you get - it all comes from Dr. Ambedkar's Constitutional vision. He truly is the architect of modern India!`,
            keyLearning: 'Great work creates benefits that last forever.'
          },
          {
            id: 'section_6_4',
            type: 'reflection',
            title: 'Your Turn to Carry the Legacy',
            content: `Dr. Ambedkar once said, "My final words of advice to you are: educate, agitate, and organize." How will you carry forward his legacy of learning, justice, and positive change?`,
            keyLearning: 'Every generation must carry forward the values of justice, equality, and education.'
          }
        ],
        quiz: {
          questions: [
            {
              id: 'q6_1',
              question: 'On which date was the Indian Constitution adopted?',
              options: ['August 15, 1947', 'January 26, 1950', 'November 26, 1949', 'October 2, 1949'],
              correctAnswer: 2,
              explanation: 'The Constitution was adopted on November 26, 1949, though it came into effect on January 26, 1950.',
              difficulty: 'medium',
              category: 'constitution_history'
            },
            {
              id: 'q6_2',
              question: 'Dr. Ambedkar is known as:',
              options: [
                'Father of the Nation',
                'Father of the Indian Constitution',
                'Father of Independence',
                'Father of Democracy'
              ],
              correctAnswer: 1,
              explanation: 'Dr. Ambedkar is rightfully called "The Father of the Indian Constitution" for his role as the chief architect.',
              difficulty: 'easy',
              category: 'constitution_history'
            }
          ],
          passingScore: 85,
          rewards: {
            coins: 250,
            experience: 125
          }
        },
        rewards: {
          coins: 500,
          experience: 250,
          unlocks: ['badge_constitution_father', 'avatar_item_constitutional_crown', 'background_india_independence', 'title_constitutional_scholar']
        },
        isCompleted: false
      }
    ];
  }

  // Get all chapters
  getAllChapters(): StoryChapter[] {
    return this.chapters.sort((a, b) => a.order - b.order);
  }

  // Get chapter by ID
  getChapterById(chapterId: string): StoryChapter | undefined {
    return this.chapters.find(chapter => chapter.id === chapterId);
  }

  // Get unlocked chapters for user
  getUnlockedChapters(userProgress: any): StoryChapter[] {
    return this.chapters.filter(chapter => {
      if (!chapter.unlockRequirement) return true;
      
      switch (chapter.unlockRequirement.type) {
        case 'previous_chapter':
          return userProgress.chaptersCompleted.includes(chapter.unlockRequirement.value);
        case 'achievement':
          return userProgress.achievements.some((a: any) => a.id === chapter.unlockRequirement!.value);
        case 'level':
          return userProgress.profileLevel >= (chapter.unlockRequirement.value as number);
        default:
          return false;
      }
    });
  }

  // Start reading a chapter
  async startChapter(chapterId: string, userProfile: any): Promise<{ success: boolean; message: string }> {
    const chapter = this.getChapterById(chapterId);
    
    if (!chapter) {
      return { success: false, message: 'Chapter not found' };
    }

    const unlockedChapters = this.getUnlockedChapters(userProfile.storyProgress);
    if (!unlockedChapters.find(c => c.id === chapterId)) {
      return { success: false, message: 'Chapter is locked. Complete previous chapters first.' };
    }

    // Track reading start
    if (!userProfile.storyProgress.startedChapters) {
      userProfile.storyProgress.startedChapters = [];
    }
    
    if (!userProfile.storyProgress.startedChapters.includes(chapterId)) {
      userProfile.storyProgress.startedChapters.push(chapterId);
    }

    userProfile.storyProgress.currentChapter = chapter.order;
    
    return { success: true, message: `Started reading "${chapter.title}"` };
  }

  // Complete a chapter
  async completeChapter(chapterId: string, userProfile: any, quizScore: number): Promise<{
    success: boolean;
    rewards: any;
    message: string;
  }> {
    const chapter = this.getChapterById(chapterId);
    
    if (!chapter) {
      return { success: false, rewards: null, message: 'Chapter not found' };
    }

    if (quizScore < chapter.quiz.passingScore) {
      return { 
        success: false, 
        rewards: null, 
        message: `You need ${chapter.quiz.passingScore}% to complete this chapter. Try again!` 
      };
    }

    // Mark chapter as completed
    if (!userProfile.storyProgress.chaptersCompleted.includes(chapterId)) {
      userProfile.storyProgress.chaptersCompleted.push(chapterId);
    }

    chapter.isCompleted = true;
    chapter.completedAt = new Date().toISOString();

    // Calculate rewards
    const rewards = {
      coins: chapter.rewards.coins + chapter.quiz.rewards.coins,
      experience: chapter.rewards.experience + chapter.quiz.rewards.experience,
      unlocks: chapter.rewards.unlocks || []
    };

    // Apply rewards to user profile
    userProfile.constitutionalCoins += rewards.coins;
    userProfile.experiencePoints += rewards.experience;
    userProfile.storyProgress.totalReadingTime += chapter.estimatedReadTime;

    // Check for special achievements
    if (userProfile.storyProgress.chaptersCompleted.length === this.chapters.length) {
      // Completed entire story mode
      rewards.unlocks.push('achievement_story_master', 'title_ambedkar_scholar');
    }

    return {
      success: true,
      rewards,
      message: `Congratulations! You've completed "${chapter.title}" and earned ${rewards.coins} Constitutional Coins!`
    };
  }

  // Get reading progress
  getReadingProgress(userProfile: any): {
    chaptersCompleted: number;
    totalChapters: number;
    progressPercentage: number;
    totalReadingTime: number;
    currentChapter: number;
  } {
    const completedChapters = userProfile.storyProgress?.chaptersCompleted?.length || 0;
    const totalChapters = this.chapters.length;
    const progressPercentage = Math.round((completedChapters / totalChapters) * 100);
    
    return {
      chaptersCompleted: completedChapters,
      totalChapters,
      progressPercentage,
      totalReadingTime: userProfile.storyProgress?.totalReadingTime || 0,
      currentChapter: userProfile.storyProgress?.currentChapter || 1
    };
  }

  // Get next recommended chapter
  getNextChapter(userProfile: any): StoryChapter | null {
    const unlockedChapters = this.getUnlockedChapters(userProfile.storyProgress);
    const completedChapters = userProfile.storyProgress?.chaptersCompleted || [];
    
    const nextChapter = unlockedChapters.find(chapter => 
      !completedChapters.includes(chapter.id)
    );
    
    return nextChapter || null;
  }

  // Get chapter completion stats
  getChapterStats(chapterId: string): {
    sections: number;
    interactiveElements: number;
    estimatedTime: number;
    difficulty: string;
  } {
    const chapter = this.getChapterById(chapterId);
    
    if (!chapter) {
      return { sections: 0, interactiveElements: 0, estimatedTime: 0, difficulty: 'unknown' };
    }

    const interactiveElements = chapter.content.reduce((count, section) => 
      count + (section.interactiveElements?.length || 0), 0
    );

    return {
      sections: chapter.content.length,
      interactiveElements,
      estimatedTime: chapter.estimatedReadTime,
      difficulty: chapter.difficulty
    };
  }
}
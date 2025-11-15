// Quiz categories - comprehensive alignment with educational modules
import { QuizCategory } from '../types';

export const quizCategories: QuizCategory[] = [
  {
    id: 'preamble',
    name: 'Constitution Basics & Preamble',
    title: 'Constitution Basics & Preamble',
    description: 'Understanding the Constitution as supreme rulebook, its creation story, and the Preamble\'s promises',
    file: 'quiz_creation_preamble.json',
    questionCount: 100,
    color: 'saffron',
    difficulty: 'beginner'
  },
  {
    id: 'fundamental-rights',
    name: 'Fundamental Rights',
    title: 'Fundamental Rights - Your Constitutional Superpowers',
    description: 'Six categories of rights that protect every Indian citizen: Equality, Freedom, Protection from exploitation, Religious freedom, Cultural/Educational rights, and Constitutional remedies',
    file: 'constitution_questions_rights.json',
    questionCount: 150,
    color: 'green',
    difficulty: 'intermediate'
  },
  {
    id: 'directive-principles',
    name: 'Directive Principles',
    title: 'Directive Principles - Our Nation\'s Goals',
    description: '24 principles guiding government policies towards social justice, economic equality, and good governance',
    file: 'fundamental_duties_comprehensive.json',
    questionCount: 100,
    color: 'navy',
    difficulty: 'intermediate'
  },
  {
    id: 'fundamental-duties',
    name: 'Fundamental Duties',
    title: 'Fundamental Duties - Our Responsibilities',
    description: 'Important duties every citizen should follow for a better India, balancing rights with responsibilities',
    file: 'quiz_fundamental_duties.json',
    questionCount: 100,
    color: 'navy',
    difficulty: 'beginner'
  },
  {
    id: 'union-government',
    name: 'Union Government',
    title: 'Union Government - How India is Run',
    description: 'Three branches of government and their checks and balances: Executive, Legislature, and Judiciary',
    file: 'constitution_questions_union.json',
    questionCount: 150,
    color: 'green',
    difficulty: 'intermediate'
  },
  {
    id: 'state-local-government',
    name: 'State & Local Governments',
    title: 'State & Local Governments - India\'s Multi-Level System',
    description: 'Federal structure with power sharing between Union, State, and Local governments',
    file: 'constitution_questions_state.json',
    questionCount: 150,
    color: 'saffron',
    difficulty: 'intermediate'
  },
  {
    id: 'judiciary',
    name: 'Judiciary System',
    title: 'Judiciary - India\'s Justice System',
    description: 'Three-tier court system, constitutional writs, and how judiciary protects constitutional rights',
    file: 'judiciary_comprehensive.json',
    questionCount: 100,
    color: 'saffron',
    difficulty: 'advanced'
  },
  {
    id: 'constitutional-bodies',
    name: 'Constitutional Bodies',
    title: 'Constitutional Bodies - Special Institutions',
    description: 'Important constitutional institutions like ECI, CAG, UPSC, NHRC that help democracy work fairly',
    file: 'quiz_constitutional_bodies.json',
    questionCount: 100,
    color: 'green',
    difficulty: 'intermediate'
  },
  {
    id: 'emergency-provisions',
    name: 'Emergency Provisions',
    title: 'Emergency Provisions - Safeguarding Democracy',
    description: 'Special constitutional tools to protect democracy during crises with safeguards and oversight',
    file: 'emergency_provisions_detailed.json',
    questionCount: 75,
    color: 'navy',
    difficulty: 'advanced'
  },
  {
    id: 'amendments',
    name: 'Constitutional Amendments',
    title: 'Amendments - Growing with Time',
    description: 'How Constitution changes through Article 368 while preserving basic structure',
    file: 'amendments_detailed.json',
    questionCount: 75,
    color: 'saffron',
    difficulty: 'advanced'
  },
  {
    id: 'inspirations',
    name: 'Constitutional Inspirations',
    title: 'Inspirations Behind Our Constitution',
    description: 'How studying world constitutions helped create unique Constitution for India',
    file: 'preamble_additional_questions.json',
    questionCount: 75,
    color: 'green',
    difficulty: 'intermediate'
  },
  {
    id: 'advanced-concepts',
    name: 'Advanced Legal Concepts',
    title: 'Advanced Legal Concepts & Dr. Ambedkar\'s Thinking',
    description: 'Deep dive into constitutional interpretation, landmark cases, and Ambedkar\'s contributions',
    file: 'quiz_advanced_legal_concepts.json',
    questionCount: 50,
    color: 'navy',
    difficulty: 'advanced'
  }
];
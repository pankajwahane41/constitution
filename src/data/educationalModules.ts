// Educational modules - comprehensive content for learning
import { EducationalModule } from '../types';

export const educationalModules: EducationalModule[] = [
  {
    id: 'constitution-basics',
    title: 'What is a Constitution?',
    summary: 'Understanding the supreme rulebook that governs our nation and protects citizens\' rights',
    description: 'Understanding the supreme rulebook that governs our nation and protects citizens\' rights',
    ageGroup: '8-12',
    estimatedTime: '20 minutes',
    color: 'saffron',
    icon: 'BookOpen',
    story: 'Imagine you\'re playing cricket with your friends. Everyone needs to know the rules to make the game fair and fun. The Constitution is like the rulebook for our entire country - it tells everyone how things should work and keeps everything fair for everyone living here. Just like in a cricket match where you need a referee, our country has institutions like the Supreme Court that help make sure everyone follows the constitutional rules.',
    concepts: [
      {
        title: 'Constitution as Supreme Rulebook',
        description: 'Like classroom rules for students, the Constitution provides rules for the entire country and everyone must follow it'
      },
      {
        title: 'Sets Up Government Structure',
        description: 'The Constitution creates different parts of government (President, Parliament, Courts) and decides what each part can do'
      },
      {
        title: 'Protects Citizens\' Rights',
        description: 'It gives special rights to every citizen like freedom of speech, equality, and protection from unfair treatment'
      },
      {
        title: 'Balance of Power',
        description: 'The Constitution makes sure no single person or group gets too much power by giving different powers to different government parts'
      },
      {
        title: 'Can Be Changed',
        description: 'Like updating game rules when needed, the Constitution can be amended to meet new challenges while keeping core values'
      }
    ],
    examples: [
      {
        title: 'School Rules vs Constitution',
        description: 'Just like school has rules for students to follow fairly, the Constitution has rules for all citizens and government officials'
      },
      {
        title: 'Cricket Game Example',
        description: 'In cricket, rules ensure fair play and prevent cheating - the Constitution ensures fair governance and prevents abuse of power'
      },
      {
        title: 'Traffic Rules Analogy',
        description: 'Like traffic rules keep roads safe for everyone, constitutional rules keep our democracy safe and fair'
      },
      {
        title: 'Family Rules',
        description: 'Families have rules to ensure harmony and fairness - constitutional rules do the same for our entire nation'
      }
    ],
    keyTakeaways: [
      'The Constitution is the supreme rulebook for our entire country',
      'It ensures fairness and protects everyone\'s rights and dignity',
      'It sets up how the government should work with clear roles and responsibilities',
      'It helps resolve conflicts peacefully through established institutions',
      'The Constitution is the highest law - even Parliament must follow it',
      'It balances individual freedom with collective welfare',
      'It can adapt to new times while preserving core democratic values'
    ],
    quizId: 'constitution-basics',
    file: 'quiz_creation_preamble.json',
    content: [
      {
        type: 'story',
        title: 'The Story of Rules',
        content: 'Imagine you\'re playing cricket with your friends. Everyone needs to know the rules to make the game fair and fun. The Constitution is like the ultimate rulebook for our entire country - it tells everyone how things should work and keeps everything fair for everyone living here.'
      },
      {
        type: 'content',
        title: 'Why Do We Need a Constitution?',
        content: 'Before India became independent, there were no clear rules for how to govern. Our Constitution makers spent 3 years creating fair rules that would work for everyone - rich or poor, from any religion or region. These rules ensure that our democracy lasts forever and protects everyone\'s rights.'
      },
      {
        type: 'content',
        title: 'How It Protects You',
        content: 'The Constitution gives you special rights that cannot be taken away. For example, it protects your right to speak freely, to go to school, to practice your religion, and to be treated equally. If anyone violates these rights, you can go to court for protection.'
      },
      {
        type: 'content',
        title: 'How Government Follows It',
        content: 'Just like students follow school rules and teachers follow education rules, all government officials must follow the Constitution. The President, Prime Minister, MPs, judges, and police must all work within the limits set by the Constitution.'
      }
    ]
  },
  {
    id: 'constitution-story',
    title: 'The Story of Our Constitution',
    summary: 'How 300 wise leaders including Dr. B.R. Ambedkar created our Constitution through teamwork and democracy',
    description: 'How 300 wise leaders including Dr. B.R. Ambedkar created our Constitution through teamwork and democracy',
    ageGroup: '8-12',
    estimatedTime: '25 minutes',
    color: 'saffron',
    icon: 'Users',
    story: 'Imagine your class was given a big project - to create the rules for how your school should be run. Everyone would have different ideas about what the rules should be, and you\'d need to discuss and debate to reach agreements. That\'s exactly what happened in India after we became independent! Our country had a massive project - to write the rules for how our diverse nation should work, and 300 wise leaders spent 3 years working together to create the most wonderful constitution in the world!',
    concepts: [
      {
        title: 'Constituent Assembly - India\'s Big Project Team',
        description: 'A group of 300 elected representatives from across India who worked together to create our Constitution'
      },
      {
        title: 'Dr. B.R. Ambedkar - Father of Constitution',
        description: 'The brilliant scholar and champion of equality who chaired the drafting committee and guided the creation process'
      },
      {
        title: 'Three Years of Careful Work (1946-1950)',
        description: 'They met, debated, and discussed for nearly 3 years to create the perfect constitution for India'
      },
      {
        title: 'Democracy in Action',
        description: 'Every decision was made through discussion, voting, and consensus - just like how students democratically decide class rules'
      },
      {
        title: 'Representing Every Voice',
        description: 'The Assembly included leaders from different religions, regions, languages, and backgrounds to ensure everyone\'s views were heard'
      },
      {
        title: 'January 26, 1950 - Our Republic Day',
        description: 'On this day, our Constitution came into effect and India became a Republic with its own elected leaders'
      }
    ],
    examples: [
      {
        title: 'Class Project Analogy',
        description: 'Like students creating school rules together through discussion and voting, our leaders created national rules through democratic debate'
      },
      {
        title: 'Group Science Fair Project',
        description: 'Like a team working on a science project where everyone contributes ideas and works together to create something amazing'
      },
      {
        title: 'Family Decision Making',
        description: 'Like how families discuss and decide together on important matters, our leaders discussed and decided on constitutional provisions'
      },
      {
        title: 'School Elections',
        description: 'Like how students elect their representatives, India elected representatives to create the Constitution'
      },
      {
        title: 'Team Sports Strategy',
        description: 'Like how sports teams discuss strategies together before important matches, leaders discussed constitutional strategies'
      },
      {
        title: 'Village Meeting',
        description: 'Like how village elders meet to solve community problems, our national leaders met to solve national governance challenges'
      }
    ],
    keyTakeaways: [
      'The Constitution was created by 300 wise elected representatives over 3 years of careful work',
      'Dr. B.R. Ambedkar was the Father of the Indian Constitution and led the drafting process',
      'Our Constitution came into force on January 26, 1950, when India became a Republic',
      'It represents the collective wisdom, hopes, and dreams of our diverse nation',
      'Every decision was made through democratic discussion and voting',
      'The process included representatives from all regions, religions, and backgrounds',
      'This Constitution has stood the test of time and continues to guide our democracy',
      'It shows that people from different backgrounds can work together for the common good'
    ],
    quizId: 'constitution-story',
    file: 'quiz_creation_preamble.json',
    content: [
      {
        type: 'story',
        title: 'A Nation Writes Its Story',
        content: 'Imagine your class was given a big project - to create the rules for how your school should be run. Everyone would have different ideas about what the rules should be, and you\'d need to discuss and debate to reach agreements. That\'s exactly what happened in India after independence!'
      },
      {
        type: 'content',
        title: 'Who Were These Leaders?',
        content: 'The Constituent Assembly had 300 members elected by provincial legislatures. They included doctors, lawyers, teachers, farmers, and leaders from different communities. Many had fought for freedom and wanted to create a fair India for all.'
      },
      {
        type: 'content',
        title: 'Dr. B.R. Ambedkar - The Master Architect',
        content: 'Dr. Ambedkar was a brilliant scholar who studied constitutions from around the world. He understood the struggles of marginalized communities and fought for equality. His deep knowledge and vision shaped our Constitution to protect everyone\'s rights.'
      },
      {
        type: 'content',
        title: 'How They Worked Together',
        content: 'The Assembly met 11 sessions over 3 years. They debated everything - from the Preamble to detailed articles. When they disagreed, they voted democratically. Every word was carefully chosen to ensure fairness and justice for all Indians.'
      },
      {
        type: 'content',
        title: 'Making History on Republic Day',
        content: 'On January 26, 1950, our Constitution was adopted and became the supreme law of India. Dr. Ambedkar said, "We are going to enter a life of contradictions. We have to be the torch bearers of hope." That hope continues to guide us today.'
      }
    ]
  },
  {
    id: 'inspirations',
    title: 'Inspirations Behind Our Constitution',
    summary: 'How studying the best constitutions worldwide helped create a unique and effective Constitution for India',
    description: 'How studying the best constitutions worldwide helped create a unique and effective Constitution for India',
    ageGroup: '8-12',
    estimatedTime: '20 minutes',
    color: 'green',
    icon: 'Globe',
    story: 'Imagine you and your friends are starting a new club. You might look at what other successful clubs are doing and take the best ideas from them, but then adapt those ideas to fit your group\'s unique needs and values. That\'s exactly what our Constitution makers did! They studied the best constitutions from around the world, learned from their successes and mistakes, and created a unique Constitution that combines the best global ideas with India\'s own values and needs.',
    concepts: [
      {
        title: 'Learning from World\'s Best Constitutions',
        description: 'Our leaders studied successful democracies like USA, UK, Canada, and Ireland to learn what works'
      },
      {
        title: 'Adapting for Indian Context',
        description: 'They took the best ideas and carefully adapted them to suit India\'s diversity, needs, and values'
      },
      {
        title: 'Unique Indian Innovations',
        description: 'Our Constitution created some original ideas like Fundamental Duties and Directive Principles'
      },
      {
        title: 'Federal Structure',
        description: 'Inspired by USA and Canada, adapted for India\'s unity-in-diversity concept'
      },
      {
        title: 'Fundamental Rights',
        description: 'Inspired by USA and France, but expanded to include social and economic rights'
      },
      {
        title: 'Parliamentary System',
        description: 'Inspired by UK, but adapted with President as head of state and Prime Minister as real leader'
      }
    ],
    examples: [
      {
        title: 'Best App Features',
        description: 'Like using the best features from different apps (camera, messages, games) to create the perfect one for your needs'
      },
      {
        title: 'Recipe Adaptation',
        description: 'Like cooking a dish by learning from different chefs\' recipes but adjusting spices for your family\'s taste'
      },
      {
        title: 'School Sports Day',
        description: 'Like organizing your school sports day by learning from other schools\' successful events but making it unique for your school'
      },
      {
        title: 'Learning from Champions',
        description: 'Like how athletes study world champions\' techniques and adapt them to improve their own performance'
      },
      {
        title: 'Cultural Fusion',
        description: 'Like how artists mix different painting styles to create something beautiful and unique'
      },
      {
        title: 'Best Practices at Work',
        description: 'Like how companies study successful businesses and adapt their strategies to their own market'
      }
    ],
    keyTakeaways: [
      'Our Constitution combines the best global democratic ideas adapted for India',
      'It learned from successful constitutions while creating original innovations',
      'It balances global wisdom with Indian values and diversity',
      'This makes our Constitution both effective and uniquely suited to India',
      'Our Constitution makers were global thinkers with local wisdom',
      'The result is a Constitution that has worked successfully for over 70 years',
      'It shows how learning from others can create something even better',
      'The Constitution reflects humanity\'s best ideas about democracy and justice'
    ],
    quizId: 'inspirations',
    file: 'quiz_creation_preamble.json',
    content: [
      {
        type: 'story',
        title: 'Learning from Friends Around the World',
        content: 'Imagine you and your friends are starting a new club. You might look at what other successful clubs are doing and take the best ideas from them, but then adapt those ideas to fit your group\'s unique needs and values. That\'s exactly what our Constitution makers did!'
      },
      {
        type: 'content',
        title: 'What India Learned from USA',
        content: 'From USA, India took the idea of Fundamental Rights as supreme protections, the federal structure with division of powers, and the concept of judicial review. But India made these work for its parliamentary system rather than presidential system.'
      },
      {
        type: 'content',
        title: 'What India Learned from UK',
        content: 'From Britain, India adopted the parliamentary system with responsible government, the rule of law, and conventions. But India adapted it with a written constitution and a President as head of state.'
      },
      {
        type: 'content',
        title: 'What India Learned from Other Countries',
        content: 'From Ireland, India took Directive Principles inspired by social justice ideas. From Canada, it learned about flexible federalism. From South Africa, it learned about equality and dignity. Each idea was carefully chosen and adapted.'
      },
      {
        type: 'content',
        title: 'India\'s Original Contributions',
        content: 'India created unique innovations like Fundamental Duties (citizen responsibilities), Directive Principles (government goals), and the concept of unity-in-diversity. These show India\'s wisdom in addressing its own unique challenges.'
      },
      {
        type: 'content',
        title: 'The Magic of Synthesis',
        content: 'Just like how a master chef combines different spices to create a perfect dish, India\'s Constitution makers combined the best ideas from around the world to create a Constitution that is truly greater than the sum of its parts. This shows the power of learning and adapting!'
      }
    ]
  },
  {
    id: 'preamble',
    title: 'The Preamble - Our Constitution\'s Promise',
    summary: 'Understanding the beautiful opening statement of our Constitution',
    description: 'Understanding the beautiful opening statement of our Constitution',
    ageGroup: '8-12',
    estimatedTime: '15 minutes',
    color: 'green',
    icon: 'Heart',
    story: 'Think of the Preamble as the Constitution\'s promise to all Indians. It\'s like the mission statement or goal list at the beginning of the Constitution that tells us what our country hopes to achieve. Just like how a school promise might say "We promise to treat everyone kindly and help each other learn," our Constitution makes promises to all citizens.',
    concepts: [
      {
        title: 'The Great Promise',
        description: 'The Preamble is our Constitution\'s promise to all citizens'
      },
      {
        title: 'Values We Stand For',
        description: 'It declares India as sovereign, socialist, secular, and democratic'
      },
      {
        title: 'Justice, Liberty, Equality, Fraternity',
        description: 'These are the four beautiful words that describe our nation\'s goals'
      }
    ],
    examples: [
      {
        title: 'School Mission Statement',
        description: 'Like a school\'s promise to students, our Preamble is our national promise'
      },
      {
        title: 'Family Values',
        description: 'The four values are like promises a family makes to each other'
      }
    ],
    keyTakeaways: [
      'The Preamble is the beautiful opening promise of our Constitution',
      'It makes our country sovereign, socialist, secular, and democratic',
      'It promises justice, liberty, equality, and fraternity to all',
      'This guides everything else in the Constitution'
    ],
    quizId: 'preamble',
    file: 'quiz_creation_preamble.json',
    content: [
      {
        type: 'story',
        title: 'The Great Promise',
        content: 'Think of the Preamble as the Constitution\'s promise to all Indians. It\'s like the mission statement or goal list at the beginning of the Constitution that tells us what our country hopes to achieve.'
      }
    ]
  },
  {
    id: 'fundamental-rights',
    title: 'Fundamental Rights - Your Constitutional Superpowers',
    summary: 'The six amazing categories of rights that protect every Indian citizen and can be enforced through courts',
    description: 'The six amazing categories of rights that protect every Indian citizen and can be enforced through courts',
    ageGroup: '12-16',
    estimatedTime: '25 minutes',
    color: 'green',
    icon: 'Shield',
    story: 'Imagine if you had special powers that made sure no one could hurt you, no one could stop you from speaking your mind, and no one could treat you unfairly just because of who you are. Well, as an Indian citizen, you DO have these "superpowers" - they are called Fundamental Rights! These rights are so important that they are placed in the Constitution itself and can be enforced directly through the Supreme Court and High Courts.',
    concepts: [
      {
        title: 'Right to Equality (Articles 14-18)',
        description: 'Guarantees equality before law, equal protection of laws, and no discrimination based on religion, race, caste, sex, or birth place'
      },
      {
        title: 'Right to Freedom (Articles 19-22)',
        description: 'Includes freedom of speech and expression, right to form associations, move freely throughout India, and protection against arbitrary arrest'
      },
      {
        title: 'Right against Exploitation (Articles 23-24)',
        description: 'Prohibits human trafficking and forced labor, and prevents employment of children below 14 in hazardous factories'
      },
      {
        title: 'Right to Freedom of Religion (Articles 25-28)',
        description: 'Ensures freedom of conscience, freedom to profess, practice and propagate religion subject to public order, morality and health'
      },
      {
        title: 'Cultural and Educational Rights (Articles 29-30)',
        description: 'Protects rights of minorities to conserve their language, script or culture and establish educational institutions of their choice'
      },
      {
        title: 'Right to Constitutional Remedies (Article 32)',
        description: 'The most important right - allows citizens to approach Supreme Court directly for enforcement of all Fundamental Rights'
      },
      {
        title: 'Writs - Legal Tools',
        description: 'Supreme Court and High Courts can issue writs (Habeas Corpus, Mandamus, Certiorari, Prohibition, Quo Warranto) to protect your rights'
      }
    ],
    examples: [
      {
        title: 'Real Protection',
        description: 'If someone discriminates against you at school or work based on your caste, religion or gender, your equality rights protect you'
      },
      {
        title: 'Speaking Truth',
        description: 'You have the right to speak up against corruption or injustice, express your opinions, and practice journalism'
      },
      {
        title: 'Freedom to Practice Religion',
        description: 'You can follow and practice any religion, build places of worship, and religious institutions are free from government interference'
      },
      {
        title: 'Child Protection',
        description: 'Children cannot be forced to work in dangerous jobs and must receive education - this is protected by constitutional mandate'
      },
      {
        title: 'Court Protection',
        description: 'If your rights are violated, you can directly approach the Supreme Court through Article 32 - this is called the "right to approach the guardian of the Constitution"'
      },
      {
        title: 'Educational Rights',
        description: 'Educational institutions of minority communities (religious or linguistic) have special rights to maintain their identity'
      }
    ],
    keyTakeaways: [
      'Fundamental Rights are your legal superpowers as an Indian citizen',
      'There are six categories of Fundamental Rights protecting different aspects of life and dignity',
      'These rights can be enforced directly through courts using writs',
      'Article 32 allows direct access to Supreme Court for right violations',
      'Fundamental Rights restrict government power and protect individual liberty',
      'These rights create a balance between individual freedom and collective welfare',
      'Children have special protection under these rights'
    ],
    quizId: 'fundamental-rights',
    file: 'quiz_fundamental_rights_detailed.json',
    content: [
      {
        type: 'story',
        title: 'Your Constitutional Superpowers',
        content: 'Imagine if you had special powers that made sure no one could hurt you, no one could stop you from speaking your mind, and no one could treat you unfairly just because of who you are. These are your Fundamental Rights - special protections written directly into the Constitution!'
      },
      {
        type: 'content',
        title: 'The Six Categories of Rights',
        content: 'Your rights include: Equality (no discrimination), Freedom (speech, movement, association), Protection from exploitation (no trafficking/forced labor), Religious freedom, Cultural/Educational rights for minorities, and Constitutional remedies to enforce all these rights.'
      },
      {
        type: 'content',
        title: 'How to Use Your Rights',
        content: 'If someone violates your rights, you can file a writ petition in Supreme Court (Article 32) or High Court (Article 226). Courts can issue writs like Habeas Corpus (to free someone illegally detained), Mandamus (to make authorities do their duty), or Quo Warranto (to question someone\'s authority to hold office).'
      },
      {
        type: 'content',
        title: 'Rights and Responsibilities Balance',
        content: 'While Fundamental Rights protect individuals, they come with reasonable restrictions in the interest of public order, morality, and health. The Constitution also lists Fundamental Duties that citizens should fulfill to support the democratic system.'
      }
    ]
  },
  {
    id: 'directive-principles',
    title: 'Directive Principles - Our Nation\'s Goals',
    summary: '24 important principles that guide government policies towards social justice, economic equality, and good governance',
    description: '24 important principles that guide government policies towards social justice, economic equality, and good governance',
    ageGroup: '12-16',
    estimatedTime: '30 minutes',
    color: 'navy',
    icon: 'Target',
    story: 'Think of Directive Principles like a wish list or goals list that a government should try to achieve for the people. It\'s different from rights - rights are things you can demand, but these are goals that the government should work towards, like making sure everyone has enough food, good schools, and clean water. Just like how you and your family might have goals to save money for a better future, our nation has goals to build a fairer and more prosperous society for everyone.',
    concepts: [
      {
        title: 'Government\'s To-Do List for Society',
        description: 'Directive Principles are goals the government should achieve to create social and economic justice'
      },
      {
        title: 'Socialistic Principles (Articles 38-39A)',
        description: 'Promote welfare of people, reduce inequalities, provide free legal aid, and ensure equal justice for all'
      },
      {
        title: 'Gandhian Principles (Articles 40-48)',
        description: 'Strengthen village panchayats, promote cottage industries, prohibit cow slaughter, and protect environment'
      },
      {
        title: 'Liberal-Intellectual Principles (Articles 44-51)',
        description: 'Uniform civil code, free education, scientific temper, and promotion of international peace and cooperation'
      },
      {
        title: 'How Rights and Principles Work Together',
        description: 'Fundamental Rights protect individuals, while Directive Principles guide government policies for collective welfare'
      },
      {
        title: 'Policy Implementation Examples',
        description: 'MGNREGA, mid-day meal schemes, reservation policies, and environmental laws are examples of DPSP implementation'
      }
    ],
    examples: [
      {
        title: 'School Development Plan',
        description: 'Like a school\'s plans to build better facilities, improve teaching, and help all students succeed over time'
      },
      {
        title: 'Family Goals',
        description: 'Families set goals to save money, improve living conditions, and support children\'s education'
      },
      {
        title: 'Team Sports Strategy',
        description: 'Like a sports team focusing on practice, fair play, and helping all players improve their skills'
      },
      {
        title: 'Neighborhood Improvement',
        description: 'Like neighbors working together to improve streets, parks, and community facilities for everyone\'s benefit'
      },
      {
        title: 'Sports Scholarship Programs',
        description: 'Like how schools create programs to identify and support talented athletes from all backgrounds'
      },
      {
        title: 'Community Health Initiatives',
        description: 'Like organizing health checkups, vaccination drives, and wellness programs for the whole community'
      }
    ],
    keyTakeaways: [
      'Directive Principles are goals for our government to achieve for social and economic justice',
      'There are 24 DPSPs grouped into Socialistic, Gandhian, and Liberal-Intellectual categories',
      'They guide policies for reducing poverty, inequality, and promoting welfare',
      'They help build a better society while respecting individual freedoms',
      'DPSPs complement Fundamental Rights - rights protect individuals, principles guide policies',
      'Government programs like MGNREGA, mid-day meals, and reservations implement DPSPs',
      'These principles make our democracy more inclusive and progressive'
    ],
    quizId: 'directive-principles',
    file: 'fundamental_duties_comprehensive.json',
    content: [
      {
        type: 'story',
        title: 'Our Nation\'s To-Do List',
        content: 'Think of Directive Principles like goals our country wants to achieve - like making sure everyone has good schools, healthcare, and opportunities. These are different from rights - while rights protect you, these principles guide the government\'s work for everyone\'s benefit.'
      },
      {
        type: 'content',
        title: 'The 24 Principles in Three Groups',
        content: 'Socialistic Principles focus on fairness and reducing inequality (Articles 38-39A). Gandhian Principles emphasize village empowerment and simple living (Articles 40-48). Liberal-Intellectual Principles promote education, uniform laws, and international cooperation (Articles 44-51).'
      },
      {
        type: 'content',
        title: 'Real-World Examples',
        content: 'MGNREGA guarantees rural employment, mid-day meals improve child nutrition and education, reservations promote social justice, environmental laws protect our natural heritage. These programs implement Directive Principles while respecting Fundamental Rights.'
      },
      {
        type: 'content',
        title: 'Balance with Fundamental Rights',
        content: 'While Fundamental Rights protect individual freedoms, Directive Principles guide government policies for collective welfare. Courts have emphasized that both are equally important and should be balanced. DPSPs cannot override Fundamental Rights.'
      },
      {
        type: 'content',
        title: 'From Principles to Policies',
        content: 'Government transforms these constitutional principles into laws and programs. For example, Article 41 (right to work and education) became the Right to Education Act. Article 45 (early childhood care) led to Anganwadi programs and ECCE initiatives.'
      }
    ]
  },
  {
    id: 'fundamental-duties',
    title: 'Fundamental Duties - Our Responsibilities',
    summary: 'Important duties every citizen should follow for a better India',
    description: 'Important duties every citizen should follow for a better India',
    ageGroup: '12-16',
    estimatedTime: '15 minutes',
    color: 'navy',
    icon: 'Users',
    story: 'Rights are great, but in a democracy, with rights come responsibilities. Think of Fundamental Duties like being a good citizen - just like you have responsibilities at home (cleaning your room, helping family) and at school (being respectful, studying hard), citizens also have responsibilities to make their country better.',
    concepts: [
      {
        title: 'Being a Good Citizen',
        description: 'Fundamental Duties are responsibilities that help our democracy work'
      },
      {
        title: 'Respect for Constitution',
        description: 'Following and respecting the Constitution and its institutions'
      },
      {
        title: 'Promoting Harmony',
        description: 'Working to maintain unity and brotherhood among all Indians'
      }
    ],
    examples: [
      {
        title: 'School Responsibilities',
        description: 'Like being a good student, being a good citizen means doing your part'
      },
      {
        title: 'Helping Others',
        description: 'Citizens should help those who need support'
      }
    ],
    keyTakeaways: [
      'Fundamental Duties are responsibilities of every Indian citizen',
      'They include respecting the Constitution and promoting unity',
      'Citizens should work to improve their community and country',
      'Being a good citizen means balancing rights with duties'
    ],
    quizId: 'fundamental-duties',
    file: 'quiz_creation_preamble.json',
    content: [
      {
        type: 'story',
        title: 'Being a Responsible Citizen',
        content: 'Rights are great, but in a democracy, with rights come responsibilities. Think of Fundamental Duties like being a good citizen.'
      }
    ]
  },
  {
    id: 'union-government',
    title: 'Union Government - How India is Run',
    summary: 'Understanding the three branches of government and their checks and balances for effective governance',
    description: 'Understanding the three branches of government and their checks and balances for effective governance',
    ageGroup: '12-16',
    estimatedTime: '30 minutes',
    color: 'green',
    icon: 'Building',
    story: 'Think of our government like a well-organized company with different departments that check each other to prevent abuse of power. Just as a company has a board (like the judiciary), managers (like the executive), and shareholders (like the legislature), our country has the President, Prime Minister, Parliament, and Supreme Court that work together with clear roles and responsibilities.',
    concepts: [
      {
        title: 'Three Branches of Government',
        description: 'Executive (runs government), Legislature (makes laws), Judiciary (interprets laws) with checks and balances'
      },
      {
        title: 'President - Head of State',
        description: 'Ceremonial head who acts on advice of Council of Ministers, represents India nationally and internationally'
      },
      {
        title: 'Prime Minister - Head of Government',
        description: 'Real executive power holder who leads the country, heads the Council of Ministers, and coordinates ministries'
      },
      {
        title: 'Parliament - Legislative Branch',
        description: 'Lok Sabha (People\'s House) and Rajya Sabha (States\' House) that make laws, control government, and represent citizens'
      },
      {
        title: 'Supreme Court - Judicial Branch',
        description: 'Highest court that interprets constitution and laws, protects rights, and resolves disputes between government levels'
      },
      {
        title: 'Council of Ministers',
        description: 'Cabinet Ministers who head different ministries (Defense, Education, Health, etc.) and implement government policies'
      },
      {
        title: 'Checks and Balances',
        description: 'Each branch can limit the power of others to prevent concentration of power and ensure accountability'
      }
    ],
    examples: [
      {
        title: 'Company Structure',
        description: 'Like a company has different departments (like Finance, Marketing, HR) that coordinate but also audit each other'
      },
      {
        title: 'Team Sports',
        description: 'Like a team where players have different roles (strikers, defenders, goalkeeper) but work toward the same goal'
      },
      {
        title: 'School Management',
        description: 'Like a school with Principal (executive), School Board (legislature), and Disciplinary Committee (judiciary) each with specific powers'
      },
      {
        title: 'Restaurant Operations',
        description: 'Like a restaurant with Chef (executive), Owners/Board (legislative), and Food Safety Inspector (judiciary) ensuring quality'
      },
      {
        title: 'Football Match Officials',
        description: 'Like football with players (executive), referees (judiciary), and rules set by football associations (legislative)'
      },
      {
        title: 'Social Media Platform',
        description: 'Like how social media has content creators (executive), community guidelines makers (legislative), and appeal boards (judiciary)'
      }
    ],
    keyTakeaways: [
      'India has three branches: Executive (run government), Legislature (make laws), Judiciary (interpret laws)',
      'The President is ceremonial head who acts on ministerial advice',
      'The Prime Minister is the real leader who heads the Council of Ministers',
      'Parliament has two houses - Lok Sabha represents people, Rajya Sabha represents states',
      'The Supreme Court is the highest authority for constitutional matters',
      'Checks and balances ensure no single branch becomes too powerful',
      'This separation prevents abuse of power and protects democracy',
      'Each branch has specific constitutional powers and responsibilities'
    ],
    quizId: 'union-government',
    file: 'constitution_questions_union.json',
    content: [
      {
        type: 'story',
        title: 'How India is Organized',
        content: 'Think of our government like a well-organized company with different departments that check each other. The President is like the board\'s ceremonial head, the PM is like the CEO, Parliament makes the rules, and the Supreme Court is like the final appeal court - each has specific powers and responsibilities.'
      },
      {
        type: 'content',
        title: 'The Three Branches in Detail',
        content: 'Executive (President, PM, Council of Ministers) executes laws and runs the country. Legislature (Parliament - Lok Sabha and Rajya Sabha) makes laws and controls the government. Judiciary (Supreme Court and lower courts) interprets laws and protects rights.'
      },
      {
        type: 'content',
        title: 'Checks and Balances in Action',
        content: 'Executive makes recommendations for laws, Legislature debates and passes them, Judiciary can review if they follow the Constitution. Parliament can remove the government through no-confidence, President can return bills for reconsideration, courts can strike down unconstitutional laws.'
      },
      {
        type: 'content',
        title: 'How Laws are Made',
        content: 'A minister or MP introduces a bill in Parliament, it\'s debated and voted in both houses, President gives assent, then it becomes law. Different types of bills need different majorities. Constitutional amendments need special procedures.'
      },
      {
        type: 'content',
        title: 'Real Government Functions',
        content: 'Defense Ministry handles security, Health Ministry manages healthcare, Education Ministry oversees schools, Finance Ministry manages economy, Home Ministry handles internal affairs. Each ministry reports to the PM and operates under parliamentary oversight.'
      }
    ]
  },
  {
    id: 'state-local-government',
    title: 'State & Local Governments - India\'s Multi-Level System',
    summary: 'How government works at state and local levels',
    description: 'How government works at state and local levels',
    ageGroup: '12-16',
    estimatedTime: '20 minutes',
    color: 'navy',
    icon: 'Map',
    story: 'Think of our government like a team sport with different levels - national team, state teams, and local teams. While the national government handles big picture issues like defense and foreign policy, state governments focus on issues like education and police, while local governments handle things like garbage collection and local roads.',
    concepts: [
      {
        title: 'Federal System',
        description: 'Power is shared between Union, State, and Local governments'
      },
      {
        title: 'State Governments',
        description: 'Each state has its own government and can make certain laws'
      },
      {
        title: 'Local Self-Government',
        description: 'Panchayats and municipalities handle local community issues'
      }
    ],
    examples: [
      {
        title: 'Multi-Sport Competition',
        description: 'Like different levels of sports competitions - national, state, local'
      },
      {
        title: 'School Management',
        description: 'Like how a school has principal, teachers, and student council'
      }
    ],
    keyTakeaways: [
      'India has three levels of government: Union, State, and Local',
      'States have their own governments and can make state-specific laws',
      'Local governments handle community-level issues',
      'This system allows for both unity and local autonomy'
    ],
    quizId: 'state-local-government',
    file: 'quiz_creation_preamble.json',
    content: [
      {
        type: 'story',
        title: 'Three Levels of Government',
        content: 'Think of our government like a team sport with different levels - national team, state teams, and local teams.'
      }
    ]
  },
  {
    id: 'judiciary',
    title: 'Judiciary - India\'s Justice System',
    summary: 'Understanding the three-tier court system, writs, and how judiciary protects constitutional rights',
    description: 'Understanding the three-tier court system, writs, and how judiciary protects constitutional rights',
    ageGroup: '12-16',
    estimatedTime: '30 minutes',
    color: 'saffron',
    icon: 'Scale',
    story: 'Think of the judiciary like referees and judges in different sports, but for our entire country! When there\'s a disagreement or someone breaks the rules, the judiciary steps in to resolve the problem fairly. Just like how different sports have different referees (cricket umpire, football referee), we have different levels of courts - from local courts to the Supreme Court. And like how referees use whistles and cards, judges use "writs" to protect your constitutional rights!',
    concepts: [
      {
        title: 'Three-Tier Court System',
        description: 'Supreme Court (highest), High Courts (state level), District/Subordinate courts (local level) with specific jurisdictions'
      },
      {
        title: 'Supreme Court of India',
        description: 'Highest court with original, appellate, and advisory jurisdiction; handles constitutional matters and disputes between government levels'
      },
      {
        title: 'High Courts',
        description: 'State-level courts with jurisdiction over state laws and constitutional matters; can issue writs and hear appeals from lower courts'
      },
      {
        title: 'Five Types of Writs',
        description: 'Habeas Corpus (free illegal detainees), Mandamus (force government action), Certiorari (transfer cases), Prohibition (stop lower courts), Quo Warranto (question authority)'
      },
      {
        title: 'Judicial Independence',
        description: 'Judges have security of tenure, fixed salaries, and cannot be removed easily to ensure fair decisions'
      },
      {
        title: 'Access to Justice',
        description: 'Article 32 allows direct access to Supreme Court for Fundamental Rights violations; Article 226 allows High Court access'
      },
      {
        title: 'Judicial Review',
        description: 'Courts can declare laws unconstitutional if they violate the Constitution, ensuring constitutional supremacy'
      }
    ],
    examples: [
      {
        title: 'Sports Referees',
        description: 'Like sports referees, judges make fair decisions based on established rules and constitutional principles'
      },
      {
        title: 'School Principal',
        description: 'Like how school authority figures settle student disputes, but judges handle serious legal matters with formal procedures'
      },
      {
        title: 'Traffic Police',
        description: 'Like traffic police ensuring road rules are followed, courts ensure legal and constitutional rules are followed'
      },
      {
        title: 'Game Appeal System',
        description: 'Like how sports have appeal systems with higher-level referees, legal cases can be appealed to higher courts'
      },
      {
        title: 'Library Rules Enforcer',
        description: 'Like library staff ensuring everyone follows reading rules, judges ensure everyone follows constitutional and legal rules'
      },
      {
        title: 'Safety Inspector',
        description: 'Like safety inspectors checking buildings follow codes, judges check if government actions follow constitutional requirements'
      }
    ],
    keyTakeaways: [
      'India has a three-tier court system: Supreme Court, High Courts, and lower courts',
      'The Supreme Court is the guardian of the Constitution and highest court of appeal',
      'Five types of writs protect citizens: Habeas Corpus, Mandamus, Certiorari, Prohibition, Quo Warranto',
      'Judges have independence through security of tenure and fixed salaries',
      'Citizens can directly approach Supreme Court for Fundamental Rights violations',
      'Judicial review ensures laws and government actions follow the Constitution',
      'Courts resolve disputes between citizens, between citizens and government, and between different levels of government'
    ],
    quizId: 'judiciary',
    file: 'judiciary_comprehensive.json',
    content: [
      {
        type: 'story',
        title: 'Fairness in Action',
        content: 'Think of the judiciary like referees and judges in different sports, but for our entire country! They use "writs" like whistles and cards to protect constitutional rights and ensure fair play in our democracy.'
      },
      {
        type: 'content',
        title: 'The Five Constitutional Writs',
        content: 'Habeas Corpus literally means "produce the body" - used to free people who are illegally detained. Mandamus means "we command" - forces government officials to do their duty. Certiorari means "to be informed" - transfers cases to higher courts. Prohibition means "to forbid" - stops lower courts from exceeding their authority. Quo Warranto means "by what warrant" - questions someone\'s legal authority to hold office.'
      },
      {
        type: 'content',
        title: 'How Courts Protect Your Rights',
        content: 'If your Fundamental Rights are violated, you can file a writ petition directly in Supreme Court (Article 32) or High Court (Article 226). This is called the "right to approach the guardian of the Constitution." Courts can award compensation and order government to take specific actions to remedy rights violations.'
      },
      {
        type: 'content',
        title: 'Constitutional Interpretation',
        content: 'Courts interpret the Constitution and resolve disputes about its meaning. The Supreme Court established the Basic Structure Doctrine, saying Parliament cannot amend the Constitution to destroy its core features like democracy, rule of law, and fundamental rights.'
      },
      {
        type: 'content',
        title: 'Federal Disputes',
        content: 'Supreme Court resolves disputes between different states, between states and central government, and interprets constitutional division of powers. This ensures unity in diversity and maintains the federal structure of India.'
      },
      {
        type: 'content',
        title: 'Case Examples',
        content: 'Landmark cases include Kesavananda Bharati (Basic Structure Doctrine), Vishaka (workplace harassment guidelines), and Maneka Gandhi (fairness in Article 21). These cases show how courts protect rights and develop constitutional law over time.'
      }
    ]
  },
  {
    id: 'constitutional-bodies',
    title: 'Constitutional Bodies - Special Institutions',
    summary: 'Important constitutional institutions that help our democracy work fairly and transparently',
    description: 'Important constitutional institutions that help our democracy work fairly and transparently',
    ageGroup: '14-16',
    estimatedTime: '30 minutes',
    color: 'green',
    icon: 'Users',
    story: 'Think of constitutional bodies like specialized departments or clubs in your school that have specific important jobs. Just like your school might have a safety committee, student council, or anti-bullying task force, our Constitution created special institutions that help protect democracy and serve citizens in specific important ways. These institutions work independently to ensure fairness, transparency, and accountability in government.',
    concepts: [
      {
        title: 'Election Commission of India (ECI)',
        description: 'Ensures free and fair elections through constitutional safeguards and technology like EVM/VVPAT'
      },
      {
        title: 'Comptroller and Auditor General (CAG)',
        description: 'Audits government finances and promotes accountability through reports to Parliament'
      },
      {
        title: 'Union and State Public Service Commissions',
        description: 'Conducts transparent examinations and advises on fair recruitment to government services'
      },
      {
        title: 'National Commissions for SC/ST',
        description: 'Protects rights and monitors safeguards for scheduled castes and tribes'
      },
      {
        title: 'National Human Rights Commission (NHRC)',
        description: 'Investigates human rights violations and recommends remedial action'
      },
      {
        title: 'Central Information Commission (CIC)',
        description: 'Enforces RTI laws and ensures government transparency with penalties for non-compliance'
      }
    ],
    examples: [
      {
        title: 'School Safety Committee',
        description: 'Like a safety committee ensures student welfare, constitutional bodies ensure citizen welfare'
      },
      {
        title: 'Student Council Elections',
        description: 'Like organizing fair student council elections with independent observers'
      },
      {
        title: 'School Budget Transparency',
        description: 'Like displaying how school funds are used, CAG audits show government spending'
      },
      {
        title: 'School Anti-Bullying System',
        description: 'Like NHRC, there are systems to protect students from harassment and ensure fair treatment'
      }
    ],
    keyTakeaways: [
      'Constitutional bodies are special institutions with specific important jobs',
      'They help maintain democracy, fairness, and accountability in government',
      'Constitutional bodies have stronger independence safeguards than statutory bodies',
      'Citizens can interact with these bodies for grievances, transparency, and protection',
      'These institutions prevent misuse of power and promote good governance'
    ],
    quizId: 'constitutional-bodies',
    file: 'quiz_constitutional_bodies.json',
    content: [
      {
        type: 'story',
        title: 'Special Helper Organizations',
        content: 'Think of constitutional bodies like specialized departments or clubs in your school that have specific important jobs. These institutions work independently to ensure our democracy runs fairly and transparently.'
      },
      {
        type: 'content',
        title: 'Constitutional vs Statutory Bodies',
        content: 'Constitutional bodies are created by specific Articles of the Constitution (like ECI under Article 324, CAG under Articles 148-151) and enjoy stronger independence safeguards including secure tenure and expenses charged on Consolidated Fund. Statutory bodies are created by legislation and their powers depend on the enabling statute.'
      },
      {
        type: 'content',
        title: 'How Citizens Can Use These Bodies',
        content: 'Citizens can file complaints with NHRC for rights violations, use RTI to get information through CIC, and benefit from fair elections conducted by ECI. CAG reports help Parliament hold the government accountable for spending.'
      }
    ]
  },
  {
    id: 'emergency-provisions',
    title: 'Emergency Provisions - Safeguarding Democracy',
    summary: 'Special constitutional tools to protect democracy during crises, with safeguards and oversight',
    description: 'Special constitutional tools to protect democracy during crises, with safeguards and oversight',
    ageGroup: '14-16',
    estimatedTime: '25 minutes',
    color: 'navy',
    icon: 'Shield',
    story: 'Think of emergency provisions like emergency protocols in a school. Just as schools have special procedures for emergencies like fire drills or lockdowns that temporarily change normal rules to keep everyone safe, our Constitution has special provisions for times when the country faces serious threats that require temporary changes in normal governance. The key is that these emergency powers are balanced with strong safeguards and oversight to protect democracy.',
    concepts: [
      {
        title: 'National Emergency (Article 352)',
        description: 'When the whole country faces serious threats like war, external aggression, or armed rebellion. Requires Cabinet advice and parliamentary approval.'
      },
      {
        title: 'President\'s Rule (Article 356)',
        description: 'When a state government cannot function according to constitutional provisions. Subject to strict judicial review as established in S.R. Bommai case.'
      },
      {
        title: 'Financial Emergency (Article 360)',
        description: 'When the country faces severe financial crisis or threat to financial stability. Has never been declared in India.'
      },
      {
        title: 'Safeguards and Oversight',
        description: 'All emergencies require parliamentary approval, laying requirements, and judicial review to prevent misuse of power.'
      },
      {
        title: 'Rights Protection During Emergencies',
        description: 'While some rights may be suspended during National Emergency, core rights like life (Article 21) and protection against arbitrary punishment (Article 20) remain protected.'
      }
    ],
    examples: [
      {
        title: 'School Emergency Procedures',
        description: 'Like fire drills that temporarily change normal school routine but have clear protocols and safety measures'
      },
      {
        title: 'Team Captain Emergency',
        description: 'Like when team captain takes special charge during difficult games, but team rules and fair play still apply'
      },
      {
        title: 'Hospital Emergency Room',
        description: 'Like how hospitals have special procedures for emergencies, but patient rights and medical ethics still apply'
      },
      {
        title: 'City Emergency Management',
        description: 'Like how cities have disaster management protocols that temporarily change normal governance but maintain accountability'
      }
    ],
    keyTakeaways: [
      'Emergency provisions are constitutional tools to protect democracy during genuine crises',
      'They include National Emergency, President\'s Rule, and Financial Emergency with different triggers and effects',
      'Strong safeguards prevent misuse: parliamentary approval, judicial review, and rights protections',
      'The S.R. Bommai case established that President\'s Rule is subject to judicial review',
      'Emergency powers are temporary and must be proportional to the threat faced',
      'Core rights like life and personal liberty remain protected even during emergencies'
    ],
    quizId: 'emergency-provisions',
    file: 'emergency_provisions_detailed.json',
    content: [
      {
        type: 'story',
        title: 'Special Procedures for Special Times',
        content: 'Think of emergency provisions like emergency protocols in a school. These constitutional tools help protect democracy during genuine crises, but always with safeguards and oversight to prevent misuse.'
      },
      {
        type: 'content',
        title: 'Constitutional Safeguards',
        content: 'All emergency provisions require parliamentary approval and oversight. National Emergency needs special majority in both Houses, President\'s Rule requires approval within 2 months, and all are subject to judicial review to ensure they are not misused.'
      },
      {
        type: 'content',
        title: 'Historical Context',
        content: 'During the 1975-77 Emergency, the Supreme Court later clarified that emergency powers must be used proportionately and are subject to judicial review. The 44th Amendment strengthened safeguards by replacing "internal disturbance" with "armed rebellion" and restoring judicial review for Financial Emergency.'
      },
      {
        type: 'content',
        title: 'Rights During Emergency',
        content: 'While Article 19 freedoms can be suspended during National Emergency and Article 359 can suspend specified rights, core protections like Article 20 (protection against arbitrary punishment) and Article 21 (right to life) remain in force.'
      }
    ]
  },
  {
    id: 'amendments',
    title: 'Amendments - Growing with Time',
    summary: 'How our Constitution changes and adapts through Article 368 while preserving its basic structure',
    description: 'How our Constitution changes and adapts through Article 368 while preserving its basic structure',
    ageGroup: '14-16',
    estimatedTime: '25 minutes',
    color: 'saffron',
    icon: 'Edit',
    story: 'Think of constitutional amendments like software updates for your phone or computer. Just as your device gets better over time with updates that fix problems and add new features, our Constitution can be updated to fix issues and adapt to new needs while keeping the core meaning the same. The process is like having three different "update lanes" - some updates are simple, others need special approval, and some need states to agree too.',
    concepts: [
      {
        title: 'Three Amendment Pathways',
        description: 'Simple majority (outside Article 368), Special majority (2/3 in each House), and Special majority + State ratification (affecting federal balance)'
      },
      {
        title: 'Article 368 Process',
        description: 'Constitutional amendment procedure: introduction in Parliament, special majority voting, presidential assent, and state ratification when required'
      },
      {
        title: 'Basic Structure Doctrine',
        description: 'Supreme Court established that amendments cannot destroy the Constitution\'s basic features like sovereignty, democracy, and fundamental rights'
      },
      {
        title: 'Balance Between Flexibility and Permanence',
        description: 'Constitution can adapt to new challenges while preserving core democratic values and institutional arrangements'
      },
      {
        title: 'Judicial Review of Amendments',
        description: 'Courts can review whether amendments follow proper procedure and don\'t violate the basic structure'
      }
    ],
    examples: [
      {
        title: 'Phone Software Updates',
        description: 'Like how phones improve with software updates - some are simple, others need special permissions or user approval'
      },
      {
        title: 'Building Modifications',
        description: 'Like how a well-designed building can be expanded while keeping its foundation and core structure intact'
      },
      {
        title: 'Class Charter Updates',
        description: 'Like when your class updates its charter - simple changes need majority vote, bigger changes need special approval'
      },
      {
        title: 'Game Rule Updates',
        description: 'Like updating game rules to fix bugs or add new features, while keeping the core game fair and playable'
      }
    ],
    keyTakeaways: [
      'Our Constitution is designed to be both flexible and stable',
      'India has amended its Constitution over 100 times to improve rights and governance',
      'Article 368 provides three pathways depending on the type of change needed',
      'The Basic Structure Doctrine ensures amendments preserve core constitutional values',
      'The amendment process balances speed for minor changes with careful consideration for major ones',
      'Judicial review ensures that changes follow proper procedure and protect democratic values'
    ],
    quizId: 'amendments',
    file: 'amendments_detailed.json',
    content: [
      {
        type: 'story',
        title: 'Growing and Changing',
        content: 'Think of constitutional amendments like software updates. Our Constitution can be updated to fix issues and adapt to new needs while keeping the core meaning the same. It\'s like having three different update lanes depending on how important the change is.'
      },
      {
        type: 'content',
        title: 'The Three Update Lanes',
        content: 'Simple Majority Lane: Quick updates like admitting new states. Special Majority Lane: Most amendments need 2/3 majority in both Houses. Special Majority + State Ratification: When changes affect federal balance, at least half of state legislatures must approve.'
      },
      {
        type: 'content',
        title: 'Important Landmark Amendments',
        content: '73rd and 74th Amendments strengthened local governments (Panchayati Raj and Municipalities). 86th Amendment made education a fundamental right. 101st Amendment introduced GST. Each followed appropriate procedures based on their scope and impact.'
      },
      {
        type: 'content',
        title: 'Basic Structure Doctrine',
        content: 'The Supreme Court established that while the Constitution can be amended, Parliament cannot use Article 368 to destroy its basic features like democracy, sovereignty, rule of law, and fundamental rights. This ensures constitutional identity remains intact while allowing necessary changes.'
      }
    ]
  }
];

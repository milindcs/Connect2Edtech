export const coursesData = {
  aptitude: {
    key: 'aptitude',
    title: 'Aptitude Training Program',
    subtitle: 'Quantitative aptitude, logical reasoning, and exam-focused practice.',
    description:
      'Build strong aptitude foundations with timed practice sets, shortcuts, and step-by-step problem-solving techniques.',
    price: '2000',
    hr: '36hr',
    image: '/assets/Gemini_Generated_Image_exv5gwexv5gwexv5.png',
    meta: 'Online • Self-paced',
    features: [
      'Quantitative aptitude fundamentals',
      'Logical reasoning & pattern practice',
      'Time management strategy',
      'Daily practice sets',
      'Mock test preparation',
    ],
  },
  softskills: {
    key: 'softskills',
    title: 'Soft Skills Training Program',
    subtitle: 'Communication, confidence, teamwork, and workplace readiness.',
    description:
      'Develop real-world communication skills with guided activities, role-plays, and practical feedback.',
    price: '2000',
    hr: '36hr',
    image: '/assets/Gemini_Generated_Image_lu6gizlu6gizlu6g.png',
    meta: 'Online • Self-paced',
    features: [
      'Communication & presentation skills',
      'Interview readiness & etiquette',
      'Teamwork & collaboration',
      'Goal setting & self-confidence',
      'Practical speaking exercises',
    ],
  },
  ai1000: {
    key: 'ai1000',
    title: 'Artificial Intelligence Training Program',
    subtitle: 'AI basics to applied ML concepts and hands-on projects.',
    description:
      'Learn AI fundamentals and build practical AI/ML project workflows with curated modules and exercises.',
    price: '2000',
    hr: '36hr',
    image: '/assets/f3ca92ae-1a4e-4d16-8a8e-a9a5b47dd196.jpg',
    meta: 'Online • Self-paced',
    features: [
      'AI & ML fundamentals',
      'Supervised learning basics',
      'Model evaluation & improvements',
      'Hands-on capstone tasks',
      'Project portfolio guidance',
    ],
  },
  mern: {
    key: 'mern',
    title: 'MERN Stack Training Program',
    subtitle: 'Build full-stack web apps with MongoDB, Express, React & Node.',
    description:
      'Learn the MERN stack end-to-end through hands-on web app development and real-world style projects.',
price: '2000',
    hr: '36hr',
    image: '/assets/Gemini_Generated_Image_lu6gizlu6gizlu6g.png',
    meta: 'Online • Self-paced',
    features: [
      'MongoDB data modelling',
      'Express REST APIs',
      'React front-end development',
      'Node.js backend workflows',
      'Capstone full-stack project',
    ],
  },
  java: {
    key: 'java',
    title: 'Java Training Program',
    subtitle: 'Core Java, OOP concepts, and practical programming for development.',
    description:
      'Strengthen Java fundamentals with OOP concepts, coding practice, and mini-projects.',
price: '2000',
    hr: '36hr',
    image: '/assets/Gemini_Generated_Image_exv5gwexv5gwexv5.png',
    meta: 'Online • Self-paced',
    features: [
      'Java basics & syntax',
      'Object-Oriented Programming (OOP)',
      'Collections & algorithms practice',
      'Exception handling',
      'Hands-on mini projects',
    ],
  },
  bigdata: {
    key: 'bigdata',
    title: 'Big Data Training Program',
    subtitle: 'Learn big data processing concepts and scalable analytics.',
    description:
      'Understand big data architecture and work on dataset-based analytics workflows.',
     price:'2000',
   hr:'36hr',
   price:'4,500',
   hr:'80hr',
    image: '/assets/f3ca92ae-1a4e-4d16-8a8e-a9a5b47dd196.jpg',
    meta: 'Online • Self-paced',
    features: [
      'Big data concepts & architecture',
      'Data processing fundamentals',
      'Analytics pipelines',
      'Practical dataset exercises',
      'Project-based learning',
    ],
  },
  cyber: {
    key: 'cyber',
    title: 'Cyber Security Training Program',
    subtitle: 'Security fundamentals, threat concepts, and ethical hacking basics.',
    description:
      'Learn security essentials with practical modules focused on threats, controls, and ethical hacking concepts.',
     price:'2000',
   hr:'36hr',
   price:'4,500',
   hr:'80hr',
    image: '/assets/Gemini_Generated_Image_sy80b6sy80b6sy80.png',
    meta: 'Online • Self-paced',
    features: [
      'Security fundamentals',
      'Threats & vulnerabilities',
      'Network security basics',
      'Ethical hacking concepts',
      'Practical learning tasks',
    ],
  },
  pythonfullstack: {
    key: 'pythonfullstack',
    title: 'Python Full Stack Training Program',
    subtitle: 'Build scalable apps with Python + web development basics.',
    description:
      'Learn Python web development concepts with practical exercises and project-style learning.',
 price:'2000',
   hr:'36hr',
   price:'4,500',
   hr:'80hr', 
  
    image: '/assets/Gemini_Generated_Image_exv5gwexv5gwexv5.png',
    meta: 'Online • Self-paced',
    features: [
      'Python programming essentials',
      'Web development fundamentals',
      'Backend logic & APIs',
      'Database integration',
      'End-to-end project modules',
    ],
  },
  cpp2000: {
    key: 'cpp2000',
    title: 'C++ Training Program',
    subtitle: 'Core C++ programming and problem-solving practice.',
    description:
      'Learn C++ fundamentals including OOP, core language constructs, and problem-solving practice.',
   price:
   '2000',
   hr:'36hr',
   price:'4,500',
   hr:'80hr',
    image: '/assets/Gemini_Generated_Image_exv5gwexv5gwexv5.png',
    meta: 'Online • Self-paced',
    features: [
      'C++ fundamentals',
      'OOP in C++',
      'Data structures basics',
      'Coding assignments',
      'Capstone problem set',
    ],
  },
}

export const normalizeCourseKey = (rawKey) => {
  if (!rawKey) return ''
  const k = String(rawKey).trim().toLowerCase()

  const map = {
    aptitude: 'aptitude',
    'aptitude training': 'aptitude',
    'aptitude training program': 'aptitude',

    softskills: 'softskills',
    'soft skills': 'softskills',
    'soft skills training': 'softskills',
    'soft skills training program': 'softskills',

    ai1000: 'ai1000',
    ai: 'ai1000',
    'artificial intelligence': 'ai1000',
    'artificial intelligence training program': 'ai1000',

    mern: 'mern',
    'mern stack': 'mern',
    'mern stack training program': 'mern',

    java: 'java',
    'java training': 'java',
    'java training program': 'java',

    bigdata: 'bigdata',
    'big data': 'bigdata',
    'big data training program': 'bigdata',

    cyber: 'cyber',
    'cyber security': 'cyber',
    'cyber security training program': 'cyber',

    pythonfullstack: 'pythonfullstack',
    'python full stack': 'pythonfullstack',
    'python full stack training program': 'pythonfullstack',

    cpp2000: 'cpp2000',
    cpp: 'cpp2000',
    cplusplus: 'cpp2000',
    'c++': 'cpp2000',
    'c plus plus': 'cpp2000',
    'c++ training program': 'cpp2000',
  }

  return map[k] || Object.keys(coursesData).find((x) => x.toLowerCase() === k) || k
}


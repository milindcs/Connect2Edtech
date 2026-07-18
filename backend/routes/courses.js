import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  const technicalCourses = [
    {
      key: 'mern',
      title: 'MERN Stack Development',
      subtitle: 'Build full-stack web apps using MongoDB, Express, React, and Node.js.',
      price: 4999,
      category: 'technical',
      duration: '12 weeks',
      level: 'Intermediate',
      mode: 'Online',
      features: ['Real-time projects', 'Authentication & Authorization', 'Deployment on cloud', 'Express REST APIs', 'React front-end development'],
    },
    {
      key: 'python',
      title: 'Python Programming',
      subtitle: 'Master Python with projects in data, web, and automation.',
      price: 3999,
      category: 'technical',
      duration: '10 weeks',
      level: 'Beginner to Intermediate',
      mode: 'Online',
      features: ['Python programming essentials', 'Web development fundamentals', 'Backend logic & APIs', 'Database integration', 'End-to-end project modules'],
    },
    {
      key: 'data-science',
      title: 'Data Science Foundations',
      subtitle: 'Learn statistics, Python, and visualization for real datasets.',
      price: 5999,
      category: 'technical',
      duration: '14 weeks',
      level: 'Intermediate',
      mode: 'Online',
      features: ['Pandas & NumPy', 'EDA workflows', 'Storytelling with data', 'Model evaluation', 'Project-based learning'],
    },
    {
      key: 'cloud',
      title: 'Cloud & DevOps Essentials',
      subtitle: 'Hands-on training with AWS, Docker, and CI/CD pipelines.',
      price: 5499,
      category: 'technical',
      duration: '12 weeks',
      level: 'Intermediate',
      mode: 'Online',
      features: ['AWS core services', 'Containerization', 'CI/CD automation', 'Monitoring & logging', 'DevOps capstone'],
    },
    {
      key: 'web-design',
      title: 'Web Design & UI/UX',
      subtitle: 'Create modern, responsive designs with Figma and frontend tools.',
      price: 3499,
      category: 'technical',
      duration: '8 weeks',
      level: 'Beginner',
      mode: 'Online',
      features: ['Figma prototyping', 'Design systems', 'Usability testing', 'Responsive design', 'Portfolio projects'],
    },
    {
      key: 'cybersecurity',
      title: 'Cybersecurity Basics',
      subtitle: 'Understand security principles, threats, and defense practices.',
      price: 4599,
      category: 'technical',
      duration: '10 weeks',
      level: 'Beginner to Intermediate',
      mode: 'Online',
      features: ['Threat modeling', 'Secure coding', 'Incident response', 'Network security', 'Practical tasks'],
    },
    {
      key: 'java',
      title: 'Java Training Program',
      subtitle: 'Core Java, OOP concepts, and practical programming for development.',
      price: 4500,
      category: 'technical',
      duration: '10 weeks',
      level: 'Beginner',
      mode: 'Online',
      features: ['Java basics & syntax', 'OOP concepts', 'Collections & algorithms', 'Exception handling', 'Mini projects'],
    },
    {
      key: 'bigdata',
      title: 'Big Data Analytics',
      subtitle: 'Learn big data processing concepts and scalable analytics.',
      price: 5500,
      category: 'technical',
      duration: '12 weeks',
      level: 'Intermediate',
      mode: 'Online',
      features: ['Big data architecture', 'Data processing', 'Analytics pipelines', 'Dataset exercises', 'Capstone project'],
    },
  ];

  const nonTechnicalCourses = [
    {
      key: 'softskills',
      title: 'Soft Skills Training',
      subtitle: 'Communication, confidence, teamwork, and workplace readiness.',
      price: 2000,
      category: 'nontechnical',
      duration: '8 weeks',
      level: 'All Levels',
      mode: 'Online',
      features: ['Communication skills', 'Interview readiness', 'Teamwork', 'Goal setting', 'Practical exercises'],
    },
    {
      key: 'aptitude',
      title: 'Aptitude Training',
      subtitle: 'Quantitative aptitude, logical reasoning, and exam-focused practice.',
      price: 2000,
      category: 'nontechnical',
      duration: '6 weeks',
      level: 'All Levels',
      mode: 'Online',
      features: ['Quantitative aptitude', 'Logical reasoning', 'Time management', 'Practice sets', 'Mock tests'],
    },
    {
      key: 'business-communication',
      title: 'Business Communication',
      subtitle: 'Professional communication skills for the workplace.',
      price: 1500,
      category: 'nontechnical',
      duration: '4 weeks',
      level: 'Beginner',
      mode: 'Online',
      features: ['Professional writing', 'Presentation skills', 'Email etiquette', 'Meeting communication', 'Cross-cultural communication'],
    },
    {
      key: 'digital-marketing',
      title: 'Digital Marketing Fundamentals',
      subtitle: 'Learn SEO, social media marketing, and online advertising.',
      price: 3000,
      category: 'nontechnical',
      duration: '8 weeks',
      level: 'Beginner',
      mode: 'Online',
      features: ['SEO basics', 'Social media marketing', 'Google Ads', 'Content marketing', 'Analytics'],
    },
    {
      key: 'finance-basics',
      title: 'Financial Literacy',
      subtitle: 'Understand personal finance, investing, and money management.',
      price: 1500,
      category: 'nontechnical',
      duration: '4 weeks',
      level: 'Beginner',
      mode: 'Online',
      features: ['Budgeting', 'Investment basics', 'Tax planning', 'Insurance', 'Retirement planning'],
    },
    {
      key: 'project-management',
      title: 'Project Management Essentials',
      subtitle: 'Learn Agile, Scrum, and project management methodologies.',
      price: 3500,
      category: 'nontechnical',
      duration: '8 weeks',
      level: 'Intermediate',
      mode: 'Online',
      features: ['Agile methodology', 'Scrum framework', 'Risk management', 'Stakeholder communication', 'Project tools'],
    },
  ];

  res.json({
    ok: true,
    data: {
      technical: technicalCourses,
      nontechnical: nonTechnicalCourses,
      all: [...technicalCourses, ...nonTechnicalCourses],
    },
  });
});

router.get('/:category', (req, res) => {
  const { category } = req.params;
  const validCategories = ['technical', 'nontechnical'];

  if (!validCategories.includes(category)) {
    return res.status(404).json({
      ok: false,
      error: 'Invalid category. Use "technical" or "nontechnical".',
    });
  }

  // In production, fetch from database
  res.json({ ok: true, category, data: [] });
});

export default router;
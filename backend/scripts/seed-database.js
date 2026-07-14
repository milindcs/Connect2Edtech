import { getDb } from '../mongoClient.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import bcrypt from 'bcryptjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function ensureWorkingDns() {
  const configured = (process.env.DNS_SERVERS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const candidates = [
    ...configured,
    '192.168.29.1',
    '8.8.8.8',
    '1.1.1.1',
  ];
  const target = 'cluster0.nyefwik.mongodb.net';
  try {
    await dns.promises.resolveSrv(`_mongodb._tcp.${target}`);
    return;
  } catch {
  }
  for (const server of candidates) {
    try {
      dns.setServers([server]);
      await dns.promises.resolveSrv(target);
      console.log(`🔧 Using DNS server ${server}`);
      return;
    } catch {
    }
  }
}

async function seedDatabase() {
  console.log('🌱 Seeding Database\n');
  console.log('='.repeat(60));

  try {
    await ensureWorkingDns();
    const db = await getDb();
    console.log('✅ Connected to database:', db.databaseName);
    console.log();

    // Pre-hash passwords so seeded accounts can actually authenticate.
    const adminHash = await bcrypt.hash('@2026C2f', 10);
    const userHash = await bcrypt.hash('Milind@2000', 10);

    const signups = db.collection('signups');
    const enrollments = db.collection('enrollments');
    const contacts = db.collection('contacts');
    const courses = db.collection('courses');

    await signups.deleteMany({});
    await enrollments.deleteMany({});
    await contacts.deleteMany({});
    await courses.deleteMany({});
    console.log('🗑️  Cleared existing data\n');

    const realUserResult = await signups.insertOne({
      name: 'Milind',
      email: 'shmilind2000@gmail.com',
      phone: '9876543210',
      passwordHash: userHash,
      role: 'user',
      verified: true,
      whatsappNumber: '919876543210',
      createdAt: new Date('2026-07-13T21:43:14+05:30'),
    });
    console.log('✅ Real user created:', realUserResult.insertedId);

    const adminResult = await signups.insertOne({
      name: 'Connect2Edtech Admin',
      email: 'hr@connect2future.com',
      phone: '7019426720',
      passwordHash: adminHash,
      role: 'admin',
      verified: true,
      whatsappNumber: '917019426720',
      createdAt: new Date('2026-07-13T21:43:14+05:30'),
    });
    console.log('✅ Admin user created:', adminResult.insertedId);

    const studentResult = await signups.insertOne({
      name: 'Test Student',
      email: 'student@test.com',
      phone: '9876543210',
      passwordHash: adminHash,
      role: 'user',
      verified: true,
      whatsappNumber: '919876543210',
      createdAt: new Date('2026-07-13T21:43:14+05:30'),
    });
    console.log('✅ Test student created:', studentResult.insertedId);

    const hrResult = await signups.insertOne({
      name: 'HR Manager',
      email: 'hr@test.com',
      phone: '9123456789',
      passwordHash: adminHash,
      role: 'hr',
      verified: true,
      whatsappNumber: '919123456789',
      createdAt: new Date('2026-07-13T21:43:14+05:30'),
    });
    console.log('✅ HR user created:', hrResult.insertedId);

    const courseDocs = [
      {
        title: 'Web Development',
        duration: '3 months',
        fee: '4500',
        trainer: 'Vikas Gowda',
        description: 'Complete training in both front-end and back-end web development with modern frameworks and tools.',
        image: '/assets/Gemini_Generated_Image_lu6gizlu6gizlu6g.png',
        courseKey: 'webdev',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Data Science',
        duration: '2 months',
        fee: '2000',
        trainer: 'Karthik Gowda',
        description: 'Learn to analyze and interpret complex data with industry-standard tools and techniques.',
        image: '/assets/f3ca92ae-1a4e-4d16-8a8e-a9a5b47dd196.jpg',
        courseKey: 'datascience',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Cyber Security',
        duration: '2 months',
        fee: '2000',
        trainer: 'Expert Trainer',
        description: 'Comprehensive security training covering network security, cryptography, and ethical hacking.',
        image: '/assets/Gemini_Generated_Image_sy80b6sy80b6sy80.png',
        courseKey: 'security',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Technical Training',
        duration: '2 months',
        fee: '2000',
        trainer: 'Expert Trainer',
        description: 'Learn practical concepts through guided modules, real-world exercises, and structured assessments.',
        image: '/assets/Gemini_Generated_Image_exv5gwexv5gwexv5.png',
        courseKey: 'technical',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'EdTech Management',
        duration: '3 months',
        fee: '4500',
        trainer: 'Expert Trainer',
        description: 'Get help with LMS setup, digital classroom tooling, student engagement, and academic tech support.',
        image: '/assets/Gemini_Generated_Image_lu6gizlu6gizlu6g.png',
        courseKey: 'management',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Skill Development Programs',
        duration: '3 months',
        fee: '4500',
        trainer: 'Expert Trainer',
        description: 'Build competence with training modules, certification preparation, and real-world learning experiences.',
        image: '/assets/Gemini_Generated_Image_sy80b6sy80b6sy80.png',
        courseKey: 'skills',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Free Training Initiatives',
        duration: '1 month',
        fee: '0',
        trainer: 'Expert Trainer',
        description: 'We provide free digital literacy and guided learning to help create equal opportunities.',
        image: '/assets/Gemini_Generated_Image_u91l8ru91l8ru91l.png',
        courseKey: 'free',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Non-Technical Training',
        duration: '3 months',
        fee: '4500',
        trainer: 'Expert Trainer',
        description: 'Improve business and communication foundations with practical modules and guided practice.',
        image: '/assets/f3ca92ae-1a4e-4d16-8a8e-a9a5b47dd196.jpg',
        courseKey: 'nontechnical',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Emerging Technologies',
        duration: '3 months',
        fee: '4500',
        trainer: 'Expert Trainer',
        description: 'Learn emerging technology concepts with hands-on activities and curated learning paths.',
        image: '/assets/Gemini_Generated_Image_sy80b6sy80b6sy80.png',
        courseKey: 'emerging',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Career & Placement Support',
        duration: '3 months',
        fee: '4500',
        trainer: 'Expert Trainer',
        description: 'Get comprehensive career counseling, interview preparation, and placement assistance.',
        image: '/assets/Gemini_Generated_Image_sy80b6sy80b6sy80.png',
        courseKey: 'placement',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Non-Technical Training Plus',
        duration: '3 months',
        fee: '4500',
        trainer: 'Expert Trainer',
        description: 'Comprehensive non-technical training covering advanced analytics, finance, change management, and more.',
        image: '/assets/f3ca92ae-1a4e-4d16-8a8e-a9a5b47dd196.jpg',
        courseKey: 'nontechplus',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Aptitude Training Program',
        duration: '3 months',
        fee: '4500',
        trainer: 'Expert Trainer',
        description: 'Build strong aptitude foundations with timed practice sets, shortcuts, and step-by-step problem-solving techniques.',
        image: '/assets/Gemini_Generated_Image_exv5gwexv5gwexv5.png',
        courseKey: 'aptitude',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Soft Skills Training Program',
        duration: '3 months',
        fee: '4500',
        trainer: 'Expert Trainer',
        description: 'Develop real-world communication skills with guided activities, role-plays, and practical feedback.',
        image: '/assets/Gemini_Generated_Image_lu6gizlu6gizlu6g.png',
        courseKey: 'softskills',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Artificial Intelligence Training Program',
        duration: '3 months',
        fee: '4500',
        trainer: 'Expert Trainer',
        description: 'Learn AI fundamentals and build practical AI/ML project workflows with curated modules and exercises.',
        image: '/assets/f3ca92ae-1a4e-4d16-8a8e-a9a5b47dd196.jpg',
        courseKey: 'ai1000',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'MERN Stack Training Program',
        duration: '3 months',
        fee: '4500',
        trainer: 'Expert Trainer',
        description: 'Learn the MERN stack end-to-end through hands-on web app development and real-world style projects.',
        image: '/assets/Gemini_Generated_Image_lu6gizlu6gizlu6g.png',
        courseKey: 'mern',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Java Training Program',
        duration: '3 months',
        fee: '4500',
        trainer: 'Expert Trainer',
        description: 'Strengthen Java fundamentals with OOP concepts, coding practice, and mini-projects.',
        image: '/assets/Gemini_Generated_Image_exv5gwexv5gwexv5.png',
        courseKey: 'java',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Big Data Training Program',
        duration: '3 months',
        fee: '4500',
        trainer: 'Expert Trainer',
        description: 'Understand big data architecture and work on dataset-based analytics workflows.',
        image: '/assets/f3ca92ae-1a4e-4d16-8a8e-a9a5b47dd196.jpg',
        courseKey: 'bigdata',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Cyber Security Training Program',
        duration: '3 months',
        fee: '4500',
        trainer: 'Expert Trainer',
        description: 'Learn security essentials with practical modules focused on threats, controls, and ethical hacking concepts.',
        image: '/assets/Gemini_Generated_Image_sy80b6sy80b6sy80.png',
        courseKey: 'cyber',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'Python Full Stack Training Program',
        duration: '3 months',
        fee: '2000',
        trainer: 'Expert Trainer',
        description: 'Learn Python web development concepts with practical exercises and project-style learning.',
        image: '/assets/Gemini_Generated_Image_exv5gwexv5gwexv5.png',
        courseKey: 'pythonfullstack',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
      {
        title: 'C++ Training Program',
        duration: '3 months',
        fee: '2000',
        trainer: 'Expert Trainer',
        description: 'Learn C++ fundamentals including OOP, core language constructs, and problem-solving practice.',
        image: '/assets/Gemini_Generated_Image_exv5gwexv5gwexv5.png',
        courseKey: 'cpp2000',
        students: 0,
        status: 'Active',
        createdAt: new Date(),
      },
    ];

    const courseInsertResult = await courses.insertMany(courseDocs);
    console.log(`✅ ${courseInsertResult.insertedCount} courses created\n`);

    const enrollmentDocs = [
      {
        name: 'Milind',
        email: 'shmilind2000@gmail.com',
        phone: '9876543210',
        college: 'Mysore University',
        courseKey: 'webdev',
        courseTitle: 'Web Development',
        message: 'Enrolled from homepage',
        createdAt: new Date('2026-07-10T21:43:14+05:30'),
      },
      {
        name: 'Milind',
        email: 'shmilind2000@gmail.com',
        phone: '9876543210',
        college: 'Mysore University',
        courseKey: 'datascience',
        courseTitle: 'Data Science',
        message: 'Interested in ML projects',
        createdAt: new Date('2026-07-09T21:43:14+05:30'),
      },
      {
        name: 'Milind',
        email: 'shmilind2000@gmail.com',
        phone: '9876543210',
        college: 'Mysore University',
        courseKey: 'security',
        courseTitle: 'Cyber Security',
        message: 'Want to learn ethical hacking',
        createdAt: new Date('2026-07-08T21:43:14+05:30'),
      },
      {
        name: 'Milind',
        email: 'shmilind2000@gmail.com',
        phone: '9876543210',
        college: 'Mysore University',
        courseKey: 'mern',
        courseTitle: 'MERN Stack Training Program',
        message: 'Looking for full-stack training',
        createdAt: new Date('2026-07-07T21:43:14+05:30'),
      },
      {
        name: 'Milind',
        email: 'shmilind2000@gmail.com',
        phone: '9876543210',
        college: 'Mysore University',
        courseKey: 'ai1000',
        courseTitle: 'Artificial Intelligence Training Program',
        message: 'Excited about AI/ML',
        createdAt: new Date('2026-07-06T21:43:14+05:30'),
      },
      {
        name: 'Test Student',
        email: 'student@test.com',
        phone: '9876543210',
        college: 'Mysore University',
        courseKey: 'webdev',
        courseTitle: 'Web Development',
        message: 'Enrolled from courses page',
        createdAt: new Date(Date.now() - 86400000 * 10),
      },
      {
        name: 'Test Student',
        email: 'student@test.com',
        phone: '9876543210',
        college: 'Mysore University',
        courseKey: 'datascience',
        courseTitle: 'Data Science',
        message: 'Interested in ML projects',
        createdAt: new Date(Date.now() - 86400000 * 8),
      },
      {
        name: 'Test Student',
        email: 'student@test.com',
        phone: '9876543210',
        college: 'Mysore University',
        courseKey: 'security',
        courseTitle: 'Cyber Security',
        message: 'Want to learn ethical hacking',
        createdAt: new Date(Date.now() - 86400000 * 6),
      },
      {
        name: 'Test Student',
        email: 'student@test.com',
        phone: '9876543210',
        college: 'Mysore University',
        courseKey: 'mern',
        courseTitle: 'MERN Stack Training Program',
        message: 'Looking for full-stack training',
        createdAt: new Date(Date.now() - 86400000 * 4),
      },
      {
        name: 'Test Student',
        email: 'student@test.com',
        phone: '9876543210',
        college: 'Mysore University',
        courseKey: 'ai1000',
        courseTitle: 'Artificial Intelligence Training Program',
        message: 'Excited about AI/ML',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
    ];

    const enrollmentResult = await enrollments.insertMany(enrollmentDocs);
    console.log(`✅ ${enrollmentResult.insertedCount} sample enrollments created\n`);

    const contactDocs = [
      {
        name: 'Milind',
        email: 'shmilind2000@gmail.com',
        phone: '9876543210',
        message: 'I have a question about the Web Development course schedule and placement assistance.',
        courses: 'Web Development',
        createdAt: new Date('2026-07-05T21:43:14+05:30'),
        replied: true,
        replies: [
          {
            from: 'Connect2Edtech Team',
            body: 'Hi! The Web Development course starts on the 1st of every month. Placement assistance is included in the program.',
            at: new Date('2026-07-04T21:43:14+05:30'),
          },
        ],
      },
      {
        name: 'Milind',
        email: 'shmilind2000@gmail.com',
        phone: '9876543210',
        message: 'Can you provide more details about the Data Science certification?',
        courses: 'Data Science',
        createdAt: new Date('2026-07-03T21:43:14+05:30'),
        replied: false,
        replies: [],
      },
      {
        name: 'Milind',
        email: 'shmilind2000@gmail.com',
        phone: '9876543210',
        message: 'I would like to know if there are any prerequisites for the Cyber Security course.',
        courses: 'Cyber Security',
        createdAt: new Date('2026-07-02T21:43:14+05:30'),
        replied: false,
        replies: [],
      },
      {
        name: 'Milind',
        email: 'shmilind2000@gmail.com',
        phone: '9876543210',
        message: 'Is the MERN Stack course suitable for beginners with no prior coding experience?',
        courses: 'MERN Stack Training Program',
        createdAt: new Date('2026-07-01T21:43:14+05:30'),
        replied: false,
        replies: [],
      },
      {
        name: 'Test Student',
        email: 'student@test.com',
        phone: '9876543210',
        message: 'I have a question about the Web Development course schedule and placement assistance.',
        courses: 'Web Development',
        createdAt: new Date(Date.now() - 86400000 * 5),
        replied: true,
        replies: [
          {
            from: 'Connect2Edtech Team',
            body: 'Hi! The Web Development course starts on the 1st of every month. Placement assistance is included in the program.',
            at: new Date(Date.now() - 86400000 * 4),
          },
        ],
      },
      {
        name: 'Test Student',
        email: 'student@test.com',
        phone: '9876543210',
        message: 'Can you provide more details about the Data Science certification?',
        courses: 'Data Science',
        createdAt: new Date(Date.now() - 86400000 * 3),
        replied: false,
        replies: [],
      },
      {
        name: 'Test Student',
        email: 'student@test.com',
        phone: '9876543210',
        message: 'I would like to know if there are any prerequisites for the Cyber Security course.',
        courses: 'Cyber Security',
        createdAt: new Date(Date.now() - 86400000 * 1),
        replied: false,
        replies: [],
      },
      {
        name: 'Test Student',
        email: 'student@test.com',
        phone: '9876543210',
        message: 'Is the MERN Stack course suitable for beginners with no prior coding experience?',
        courses: 'MERN Stack Training Program',
        createdAt: new Date(Date.now() - 86400000 * 0.5),
        replied: false,
        replies: [],
      },
    ];

    const contactResult = await contacts.insertMany(contactDocs);
    console.log(`✅ ${contactResult.insertedCount} sample contacts created\n`);

    console.log('='.repeat(60));
    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${await signups.countDocuments()}`);
    console.log(`   - Courses: ${await courses.countDocuments()}`);
    console.log(`   - Enrollments: ${await enrollments.countDocuments()}`);
    console.log(`   - Contacts: ${await contacts.countDocuments()}`);
    console.log('\n🔑 Test Accounts:');
    console.log('   Admin: hr@connect2future.com / @2026C2f');
    console.log('   HR: hr@test.com / @2026C2f');
    console.log('   Student: student@test.com / @2026C2f');
    console.log('   Real User: shmilind2000@gmail.com / Milind@2000');
    console.log('\n💡 Next steps:');
    console.log('   1. Start backend: npm start');
    console.log('   2. Visit http://localhost:10000/student');
    console.log('   3. Login with real user credentials to view user dashboard');
    console.log('   4. Visit http://localhost:10000/admin');
    console.log('   5. Login with admin credentials to view admin dashboard');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('\n🔧 Troubleshooting:');
      console.error('   1. Check MongoDB Atlas cluster is running');
      console.error('   2. Verify MONGODB_URI in backend/.env');
      console.error('   3. Ensure your IP is whitelisted in MongoDB Atlas');
      console.error('   4. Check network connectivity');
    }
    
    process.exit(1);
  }
}

seedDatabase();

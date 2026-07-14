import { getDb } from './mongoClient.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dns from 'node:dns';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

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
  const target = '_mongodb._tcp.cluster0.nyefwik.mongodb.net';
  try {
    await dns.promises.resolveSrv(target);
    return;
  } catch {
  }
  for (const server of candidates) {
    try {
      dns.setServers([server]);
      await dns.promises.resolveSrv(target);
      console.log(`🔧 Using DNS server ${server} (system default was unreachable)`);
      return;
    } catch {
    }
  }
}

async function seedTestData() {
  await ensureWorkingDns();
  console.log('🌱 Seeding test data...\n');

  try {
    const db = await getDb();
    console.log('✅ Connected to database');

    // Clear existing data
    console.log('\n🗑️  Clearing existing test data...');
    await db.collection('signups').deleteMany({});
    await db.collection('courses').deleteMany({});
    await db.collection('enrollments').deleteMany({});
    await db.collection('contacts').deleteMany({});
    console.log('   ✅ Existing data cleared');

    // Create test users/students
    console.log('\n👥 Creating test students...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const students = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543210',
        whatsappNumber: '9876543210',
        passwordHash,
        role: 'user',
        verified: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        phone: '9876543211',
        whatsappNumber: '9876543211',
        passwordHash,
        role: 'user',
        verified: true,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      },
      {
        name: 'Amit Kumar',
        email: 'amit@example.com',
        phone: '9876543212',
        whatsappNumber: '9876543212',
        passwordHash,
        role: 'user',
        verified: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        name: 'Sneha Gupta',
        email: 'sneha@example.com',
        phone: '9876543213',
        whatsappNumber: '9876543213',
        passwordHash,
        role: 'user',
        verified: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        phone: '9876543214',
        whatsappNumber: '9876543214',
        passwordHash,
        role: 'user',
        verified: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ];

    const studentResult = await db.collection('signups').insertMany(students);
    console.log(`   ✅ Created ${studentResult.insertedCount} students`);

    // Create single Admin/HR user
    console.log('\n👔 Creating Admin user...');
    const hrUsers = [
      {
        name: 'Milind',
        email: 'shmilind2000@gmail.com',
        phone: '7019426720',
        whatsappNumber: '7019426720',
        passwordHash: await bcrypt.hash('Milind@2000', salt),
        role: 'admin',
        verified: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    ];

    const hrResult = await db.collection('signups').insertMany(hrUsers);
    console.log(`   ✅ Created ${hrResult.insertedCount} Admin user`);

    // Create test courses
    console.log('\n📚 Creating test courses...');
    const courses = [
      {
        title: 'Full Stack Web Development',
        duration: '6 months',
        fee: '45000',
        trainer: 'Mr. Rajesh Kumar',
        description: 'Complete web development course covering React, Node.js, Express, and MongoDB',
        image: 'https://via.placeholder.com/300x200',
        courseKey: 'fullstack-web',
        students: 45,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Data Science & Machine Learning',
        duration: '8 months',
        fee: '65000',
        trainer: 'Dr. Priya Sharma',
        description: 'Learn Python, Machine Learning, Data Analysis, and visualization',
        image: 'https://via.placeholder.com/300x200',
        courseKey: 'data-science',
        students: 32,
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Mobile App Development with React Native',
        duration: '4 months',
        fee: '35000',
        trainer: 'Mr. Amit Verma',
        description: 'Build cross-platform mobile apps using React Native and Expo',
        image: 'https://via.placeholder.com/300x200',
        courseKey: 'mobile-react',
        students: 28,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Cloud Computing & DevOps',
        duration: '5 months',
        fee: '50000',
        trainer: 'Ms. Neha Singh',
        description: 'Master AWS, Docker, Kubernetes, and CI/CD pipelines',
        image: 'https://via.placeholder.com/300x200',
        courseKey: 'cloud-devops',
        students: 38,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'UI/UX Design Fundamentals',
        duration: '3 months',
        fee: '25000',
        trainer: 'Ms. Anjali Mehta',
        description: 'Learn Figma, Adobe XD, and design thinking principles',
        image: 'https://via.placeholder.com/300x200',
        courseKey: 'uiux-design',
        students: 55,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
    ];

    const courseResult = await db.collection('courses').insertMany(courses);
    console.log(`   ✅ Created ${courseResult.insertedCount} courses`);

    // Create test enrollments
    console.log('\n📝 Creating test enrollments...');
    const enrollments = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543210',
        college: 'Delhi University',
        courseKey: 'fullstack-web',
        courseTitle: 'Full Stack Web Development',
        message: 'Interested in learning full stack development',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        phone: '9876543211',
        college: 'Mumbai University',
        courseKey: 'data-science',
        courseTitle: 'Data Science & Machine Learning',
        message: 'Want to pursue career in data science',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        name: 'Amit Kumar',
        email: 'amit@example.com',
        phone: '9876543212',
        college: 'Bangalore Institute of Technology',
        courseKey: 'mobile-react',
        courseTitle: 'Mobile App Development with React Native',
        message: 'Looking to build mobile apps',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        name: 'Sneha Gupta',
        email: 'sneha@example.com',
        phone: '9876543213',
        college: 'Pune University',
        courseKey: 'cloud-devops',
        courseTitle: 'Cloud Computing & DevOps',
        message: 'Want to learn cloud technologies',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        phone: '9876543214',
        college: 'Hyderabad Central University',
        courseKey: 'uiux-design',
        courseTitle: 'UI/UX Design Fundamentals',
        message: 'Passionate about design',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543210',
        college: 'Delhi University',
        courseKey: 'data-science',
        courseTitle: 'Data Science & Machine Learning',
        message: 'Also interested in data science',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
    ];

    const enrollmentResult = await db.collection('enrollments').insertMany(enrollments);
    console.log(`   ✅ Created ${enrollmentResult.insertedCount} enrollments`);

    // Create test contacts/messages
    console.log('\n💬 Creating test contact messages...');
    const contacts = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543210',
        message: 'What are the placement opportunities after completing the Full Stack course?',
        courses: 'fullstack-web',
        replied: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        phone: '9876543211',
        message: 'Do you offer EMI options for the Data Science course?',
        courses: 'data-science',
        replied: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Guest User',
        email: 'guest@example.com',
        phone: '9123456789',
        message: 'Can I get a demo class before enrolling?',
        courses: '',
        replied: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Amit Kumar',
        email: 'amit@example.com',
        phone: '9876543212',
        message: 'What is the batch timing for React Native course?',
        courses: 'mobile-react',
        replied: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        name: 'Sneha Gupta',
        email: 'sneha@example.com',
        phone: '9876543213',
        message: 'Is there any certification after course completion?',
        courses: 'cloud-devops',
        replied: true,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    ];

    const contactResult = await db.collection('contacts').insertMany(contacts);
    console.log(`   ✅ Created ${contactResult.insertedCount} contact messages`);

    // Summary
    console.log('\n📊 Test Data Summary:');
    console.log('   👥 Students: 5 regular + 1 Admin');
    console.log('   📚 Courses: 5');
    console.log('   📝 Enrollments: 6');
    console.log('   💬 Contact Messages: 5');
    console.log('\n✅ Test data seeded successfully!');
    console.log('\n🔐 Login credentials for testing:');
    console.log('   Student: rahul@example.com / password123');
    console.log('   Admin: shmilind2000@gmail.com / Milind@2000');
    console.log('\n🌐 Visit http://localhost:5173 to view the dashboards');

  } catch (error) {
    console.error('\n❌ Error seeding test data:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    process.exit(1);
  }
}

seedTestData();
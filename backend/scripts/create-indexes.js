import { getDb } from '../mongoClient.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function createIndexes() {
  console.log('📇 Creating MongoDB Indexes\n');
  console.log('='.repeat(60));

  try {
    const db = await getDb();
    console.log('✅ Connected to database:', db.databaseName);
    console.log();

    // Index definitions for optimal query performance
    const indexes = {
      signups: [
        { 
          key: { email: 1 }, 
          options: { unique: true, name: 'email_unique', background: true },
          description: 'Unique index for email lookups (signup, signin)'
        },
        { 
          key: { verified: 1, createdAt: -1 }, 
          options: { name: 'verified_created_idx', background: true },
          description: 'Compound index for verified users sorted by date'
        },
        { 
          key: { role: 1, createdAt: -1 }, 
          options: { name: 'role_created_idx', background: true },
          description: 'Compound index for role-based queries'
        },
        { 
          key: { createdAt: -1 }, 
          options: { name: 'created_at_desc_idx', background: true },
          description: 'Index for sorting users by creation date'
        }
      ],
      enrollments: [
        { 
          key: { email: 1, createdAt: -1 }, 
          options: { name: 'email_created_idx', background: true },
          description: 'Compound index for user enrollments'
        },
        { 
          key: { courseKey: 1, createdAt: -1 }, 
          options: { name: 'course_created_idx', background: true },
          description: 'Compound index for course enrollments'
        },
        { 
          key: { createdAt: -1 }, 
          options: { name: 'created_at_desc_idx', background: true },
          description: 'Index for recent enrollments'
        }
      ],
      contacts: [
        { 
          key: { email: 1 }, 
          options: { name: 'email_idx', background: true },
          description: 'Index for contact lookups by email'
        },
        { 
          key: { createdAt: -1 }, 
          options: { name: 'created_at_desc_idx', background: true },
          description: 'Index for recent contacts'
        },
        { 
          key: { replied: 1, createdAt: -1 }, 
          options: { name: 'replied_created_idx', background: true },
          description: 'Compound index for replied messages'
        }
      ],
      checkouts: [
        { 
          key: { email: 1, createdAt: -1 }, 
          options: { name: 'email_created_idx', background: true },
          description: 'Compound index for user checkouts'
        },
        { 
          key: { sessionId: 1, createdAt: -1 }, 
          options: { name: 'session_created_idx', background: true },
          description: 'Compound index for session-based queries'
        },
        { 
          key: { createdAt: -1 }, 
          options: { name: 'created_at_desc_idx', background: true },
          description: 'Index for recent checkouts'
        }
      ],
      cart: [
        { 
          key: { sessionId: 1, courseKey: 1 }, 
          options: { unique: true, name: 'session_course_unique', background: true },
          description: 'Unique compound index for cart items'
        },
        { 
          key: { sessionId: 1, addedAt: -1 }, 
          options: { name: 'session_added_idx', background: true },
          description: 'Compound index for user cart items'
        }
      ]
    };

    let totalIndexes = 0;
    let skippedIndexes = 0;

    // Create indexes for each collection
    for (const [collectionName, collectionIndexes] of Object.entries(indexes)) {
      const collection = db.collection(collectionName);
      console.log(`\n📁 Collection: ${collectionName}`);
      
      // Ensure collection exists
      await db.listCollections({ name: collectionName }).toArray();
      
      for (const indexConfig of collectionIndexes) {
        try {
          await collection.createIndex(indexConfig.key, indexConfig.options);
          console.log(`  ✅ ${indexConfig.name}`);
          console.log(`     ${indexConfig.description}`);
          totalIndexes++;
        } catch (err) {
          if (err.code === 85 || err.codeName === 'IndexOptionsConflict') {
            console.log(`  ⚠️  ${indexConfig.name} (already exists)`);
            skippedIndexes++;
          } else {
            console.error(`  ❌ Failed to create ${indexConfig.name}:`, err.message);
          }
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Index Creation Summary:');
    console.log(`   ✅ Created: ${totalIndexes}`);
    console.log(`   ⚠️  Skipped: ${skippedIndexes}`);
    
    // Display current indexes
    console.log('\n🔍 Current Indexes:');
    for (const collectionName of Object.keys(indexes)) {
      const collection = db.collection(collectionName);
      const currentIndexes = await collection.indexes();
      console.log(`\n   ${collectionName}:`);
      currentIndexes.forEach(idx => {
        console.log(`     - ${idx.name}: ${JSON.stringify(idx.key)}`);
      });
    }

    console.log('\n✅ Index creation completed!');
    console.log('\n💡 Performance Tips:');
    console.log('   1. Monitor query performance in MongoDB Atlas');
    console.log('   2. Use explain() to verify index usage');
    console.log('   3. Consider compound indexes for frequent queries');
    console.log('   4. Review slow queries regularly');

  } catch (error) {
    console.error('\n❌ Index creation failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('\n🔧 Connection Troubleshooting:');
      console.error('   1. Verify MongoDB Atlas cluster is running');
      console.error('   2. Check MONGODB_URI in backend/.env');
      console.error('   3. Whitelist your IP in MongoDB Atlas Network Access');
      console.error('   4. Verify database user credentials');
      console.error('   5. Check firewall/antivirus settings');
    }
    
    process.exit(1);
  }
}

createIndexes();
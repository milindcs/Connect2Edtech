import { getDb, getMongoClient } from './mongoClient.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from backend directory
const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function setupMongoDB() {
  console.log('🚀 MongoDB Setup and Optimization\n');
  console.log('=' .repeat(60));

  try {
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    const db = await getDb();
    console.log('✅ Connected successfully');
    console.log(`   Database: ${db.databaseName}`);

    // Define collections and their indexes
    const collectionsConfig = {
      signups: {
        indexes: [
          { key: { email: 1 }, options: { unique: true, name: 'email_unique' } },
          { key: { verified: 1, createdAt: -1 }, options: { name: 'verified_created' } },
          { key: { role: 1 }, options: { name: 'role_idx' } },
          { key: { createdAt: -1 }, options: { name: 'created_at_idx' } }
        ]
      },
      enrollments: {
        indexes: [
          { key: { email: 1, createdAt: -1 }, options: { name: 'email_created' } },
          { key: { courseKey: 1 }, options: { name: 'course_key_idx' } },
          { key: { createdAt: -1 }, options: { name: 'created_at_idx' } }
        ]
      },
      contacts: {
        indexes: [
          { key: { email: 1 }, options: { name: 'email_idx' } },
          { key: { createdAt: -1 }, options: { name: 'created_at_idx' } },
          { key: { replied: 1 }, options: { name: 'replied_idx' } }
        ]
      },
      dashboard: {
        indexes: [
          { key: { type: 1 }, options: { unique: true, name: 'type_unique' } },
          { key: { updatedAt: -1 }, options: { name: 'updated_at_idx' } }
        ]
      },
      settings: {
        indexes: [
          { key: { type: 1 }, options: { unique: true, name: 'type_unique' } },
          { key: { updatedAt: -1 }, options: { name: 'updated_at_idx' } }
        ]
      }
    };

    // Create indexes for each collection
    console.log('\n📇 Creating database indexes...');
    for (const [collectionName, config] of Object.entries(collectionsConfig)) {
      const collection = db.collection(collectionName);
      
      // Create collection if it doesn't exist
      const exists = await db.listCollections({ name: collectionName }).toArray();
      if (exists.length === 0) {
        console.log(`   ✓ Created collection: ${collectionName}`);
      } else {
        console.log(`   ✓ Collection exists: ${collectionName}`);
      }

      // Create indexes
      for (const indexConfig of config.indexes) {
        try {
          await collection.createIndex(indexConfig.key, indexConfig.options);
          console.log(`     ✓ Index created: ${indexConfig.options.name}`);
        } catch (err) {
          if (err.code === 85 || err.codeName === 'IndexOptionsConflict') {
            console.log(`     ⚠️  Index already exists: ${indexConfig.options.name}`);
          } else {
            console.error(`     ❌ Failed to create index ${indexConfig.options.name}:`, err.message);
          }
        }
      }
    }

    // Get collection statistics
    console.log('\n📊 Collection Statistics:');
    for (const collectionName of Object.keys(collectionsConfig)) {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      console.log(`   ${collectionName}: ${count} document(s)`);
    }

    // Verify indexes
    console.log('\n🔍 Verifying indexes...');
    for (const collectionName of Object.keys(collectionsConfig)) {
      const collection = db.collection(collectionName);
      const indexes = await collection.indexes();
      console.log(`   ${collectionName}: ${indexes.length} index(es)`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ MongoDB setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Connection: Established');
    console.log('   - Indexes: Created/Verified');
    console.log('   - Collections: Ready');
    console.log('\n💡 Next steps:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Test API endpoints');
    console.log('   3. Monitor performance in MongoDB Atlas');

  } catch (error) {
    console.error('\n❌ MongoDB setup failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('\n🔧 Troubleshooting:');
      console.error('   1. Check your MongoDB Atlas cluster is running');
      console.error('   2. Verify the MONGODB_URI in backend/.env');
      console.error('   3. Ensure your IP is whitelisted in MongoDB Atlas');
      console.error('   4. Check network connectivity');
    }
    
    process.exit(1);
  }
}

setupMongoDB();
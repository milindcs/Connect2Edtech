import { getDb, getMongoClient } from './mongoClient.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from backend directory
const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function testMongoDB() {
  console.log('🔍 Testing MongoDB Connection...\n');

  try {
    // Test 1: Get client
    console.log('1. Testing MongoDB client connection...');
    const client = await getMongoClient();
    console.log('   ✅ MongoDB client connected successfully');

    // Test 2: Get database
    console.log('\n2. Testing database access...');
    const db = await getDb();
    console.log('   ✅ Database accessed successfully');
    console.log(`   📊 Database name: ${db.databaseName}`);

    // Test 3: List collections
    console.log('\n3. Listing existing collections...');
    const collections = await db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('   ℹ️  No collections found (database is empty)');
    } else {
      console.log(`   📁 Found ${collections.length} collection(s):`);
      collections.forEach(col => {
        console.log(`      - ${col.name}`);
      });
    }

    // Test 4: Test write operation
    console.log('\n4. Testing write operation...');
    const testCollection = db.collection('_test_connection');
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'MongoDB connection test'
    };
    const result = await testCollection.insertOne(testDoc);
    console.log('   ✅ Write operation successful');
    console.log(`   📝 Inserted document ID: ${result.insertedId}`);

    // Test 5: Test read operation
    console.log('\n5. Testing read operation...');
    const foundDoc = await testCollection.findOne({ _id: result.insertedId });
    console.log('   ✅ Read operation successful');
    console.log(`   📄 Retrieved document: ${JSON.stringify(foundDoc, null, 2)}`);

    // Test 6: Clean up test document
    console.log('\n6. Cleaning up test document...');
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('   ✅ Test document deleted');

    // Test 7: Check collections used by the app
    console.log('\n7. Checking application collections...');
    const appCollections = ['signups', 'enrollments', 'contacts', 'dashboard', 'settings'];
    const existingCollections = collections.map(c => c.name);
    
    for (const colName of appCollections) {
      if (existingCollections.includes(colName)) {
        const count = await db.collection(colName).countDocuments();
        console.log(`   ✓ ${colName}: ${count} document(s)`);
      } else {
        console.log(`   ⚠️  ${colName}: Collection does not exist yet`);
      }
    }

    console.log('\n✅ All MongoDB tests passed successfully!');
    console.log('\n📊 Connection Details:');
    console.log(`   - Host: ${client.topology.s.options.hosts[0]?.host || 'N/A'}`);
    console.log(`   - Database: ${db.databaseName}`);
    console.log(`   - Status: Connected`);

  } catch (error) {
    console.error('\n❌ MongoDB connection test failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    process.exit(1);
  }
}

testMongoDB();
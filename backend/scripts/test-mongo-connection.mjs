import mongoose from 'mongoose';

const standardUri = 'mongodb://hr_connect2future:%402026C2f@cluster0.nyefwik.mongodb.net:27017/connect2future?retryWrites=true&w=majority&directConnection=true';

async function testStandardConnection() {
  console.log('Testing MongoDB Atlas standard connection (non-SRV)...');
  console.log('URI:', standardUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

  try {
    await mongoose.connect(standardUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    console.log('✓ MongoDB connection successful!');
    console.log('  Database:', mongoose.connection.name);
    console.log('  Host:', mongoose.connection.host);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('✗ MongoDB standard connection failed:');
    console.error('  Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('  → Port 27017 blocked or host unreachable.');
    } else if (error.message.includes('Authentication failed')) {
      console.error('  → Invalid username or password.');
    }
    process.exit(1);
  }
}

testStandardConnection();

import { MongoClient } from 'mongodb';

async function checkUsers() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/content';
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const users = await db.collection('userrefs').find({}).toArray();

    console.log(`\n📊 Total users in cache: ${users.length}`);
    console.log('\n👥 Users:');
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User ID: ${user.user_id}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Role: ${user.role || 'N/A'}`);
      console.log(`   Created: ${user.createdAt || 'N/A'}`);
    });

    if (users.length === 0) {
      console.log('\n⚠️  NO USERS FOUND IN CACHE!');
      console.log('This means the auth.tokenGenerated event is not being processed.');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkUsers();


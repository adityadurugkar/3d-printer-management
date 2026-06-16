require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'admin', status: 'active' } }
    );
    console.log(`Migrated ${result.modifiedCount} existing users to admin role`);

    const statusResult = await User.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );
    console.log(`Set active status for ${statusResult.modifiedCount} users`);

    await mongoose.disconnect();
    console.log('Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

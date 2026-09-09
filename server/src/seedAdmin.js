const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdminUser = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const email = 'complaintwork2@gmail.com';
    const password = '12345678';
    const mobile = '9900000000';

    // Delete existing user if email or mobile exists to ensure fresh seed
    await User.deleteMany({
      $or: [{ email: email.toLowerCase() }, { mobile }]
    });

    const adminUser = new User({
      name: 'Super Admin (ComplaintWork)',
      email: email.toLowerCase(),
      mobile,
      password,
      role: 'ADMIN',
      isMobileVerified: true,
      isEmailVerified: true,
      stateCode: 'KA'
    });

    await adminUser.save();
    console.log('✅ Super Admin account created successfully!');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   User ID: ${adminUser.userId}`);
    console.log(`   Role: ${adminUser.role}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Super Admin account:', err);
    process.exit(1);
  }
};

seedAdminUser();

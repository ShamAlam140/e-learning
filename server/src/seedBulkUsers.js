const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const bulkUsers = [
  // 5 Teachers
  { name: 'Dr. Rajesh Sharma', email: 'teacher1@eduverse.in', mobile: '9811111111', password: 'password123', role: 'TEACHER', stateCode: 'KA', kycStatus: 'VERIFIED' },
  { name: 'Prof. Ananya Sen', email: 'teacher2@eduverse.in', mobile: '9811111112', password: 'password123', role: 'TEACHER', stateCode: 'MH', kycStatus: 'VERIFIED' },
  { name: 'Dr. Vikramaditya Rao', email: 'teacher3@eduverse.in', mobile: '9811111113', password: 'password123', role: 'TEACHER', stateCode: 'DL', kycStatus: 'VERIFIED' },
  { name: 'Meera Deshmukh', email: 'teacher4@eduverse.in', mobile: '9811111114', password: 'password123', role: 'TEACHER', stateCode: 'WB', kycStatus: 'VERIFIED' },
  { name: 'Dr. Suresh Verma', email: 'teacher5@eduverse.in', mobile: '9811111115', password: 'password123', role: 'TEACHER', stateCode: 'UP', kycStatus: 'VERIFIED' },

  // 5 Students
  { name: 'Rahul Verma', email: 'student1@eduverse.in', mobile: '9800000001', password: 'password123', role: 'STUDENT', stateCode: 'KA', kycStatus: 'VERIFIED' },
  { name: 'Priya Singh', email: 'student2@eduverse.in', mobile: '9800000002', password: 'password123', role: 'STUDENT', stateCode: 'MH', kycStatus: 'VERIFIED' },
  { name: 'Amit Patel', email: 'student3@eduverse.in', mobile: '9800000003', password: 'password123', role: 'STUDENT', stateCode: 'GJ', kycStatus: 'VERIFIED' },
  { name: 'Sneha Reddy', email: 'student4@eduverse.in', mobile: '9800000004', password: 'password123', role: 'STUDENT', stateCode: 'TS', kycStatus: 'VERIFIED' },
  { name: 'Rohan Kapoor', email: 'student5@eduverse.in', mobile: '9800000005', password: 'password123', role: 'STUDENT', stateCode: 'DL', kycStatus: 'VERIFIED' },

  // 10 Referral Partner Students
  { name: 'Shamshad Student', email: 'affiliate1@eduverse.in', mobile: '9555555551', password: 'password123', role: 'STUDENT', stateCode: 'KA', kycStatus: 'VERIFIED' },
  { name: 'Vikram Student', email: 'affiliate2@eduverse.in', mobile: '9555555552', password: 'password123', role: 'STUDENT', stateCode: 'MH', kycStatus: 'VERIFIED' },
  { name: 'Neha Student', email: 'affiliate3@eduverse.in', mobile: '9555555553', password: 'password123', role: 'STUDENT', stateCode: 'DL', kycStatus: 'VERIFIED' },
  { name: 'Arjun Student', email: 'affiliate4@eduverse.in', mobile: '9555555554', password: 'password123', role: 'STUDENT', stateCode: 'RJ', kycStatus: 'VERIFIED' },
  { name: 'Kavita Student', email: 'affiliate5@eduverse.in', mobile: '9555555555', password: 'password123', role: 'STUDENT', stateCode: 'TN', kycStatus: 'VERIFIED' }
];

const seedBulkUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    let createdCount = 0;

    for (const u of bulkUsers) {
      // Check if user exists by email or mobile
      const existing = await User.findOne({
        $or: [{ email: u.email }, { mobile: u.mobile }]
      });

      if (!existing) {
        const newUser = new User({
          ...u,
          isMobileVerified: true,
          isEmailVerified: true
        });
        await newUser.save();
        console.log(`✅ Created ${u.role}: ${u.name} (${u.email}) [ID: ${newUser.userId}]`);
        createdCount++;
      } else {
        console.log(`ℹ️ Existing ${u.role}: ${u.name} (${u.email})`);
      }
    }

    console.log(`\n🎉 Bulk Seeding Completed! Created ${createdCount} new users.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during bulk user seeding:', err);
    process.exit(1);
  }
};

seedBulkUsers();

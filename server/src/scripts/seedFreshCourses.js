const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/elearning';

const freshCoursesData = [
  // Module 1: SCHOOL_K12
  {
    title: 'CBSE Class 10th Science & Maths Master Class',
    description: 'Comprehensive Board Preparation for CBSE Class 10 with Live Problem Solving, Physics, Chemistry, Biology & Maths.',
    price: 1499,
    originalPrice: 3999,
    stateCode: 'DL',
    categoryCode: 'SCHOOL_K12',
    subCategory: 'CBSE_BOARD',
    subCategoryTitle: 'CBSE Board (Classes 1–10)',
    stream: '',
    boardOrGrade: 'CBSE Class 10th',
    subjectName: 'All Subjects (Complete Package)',
    courseMode: 'LIVE_ONLINE',
    liveMeetingUrl: 'https://zoom.us/j/9900000001',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800'
  },
  {
    title: 'Karnataka State Board SSLC 10th Kannada Medium Toppers Batch',
    description: 'SSLC 10th Complete Syllabus Coverage in Kannada Medium for Science, Maths, Social Science & Languages.',
    price: 1299,
    originalPrice: 2999,
    stateCode: 'KA',
    categoryCode: 'SCHOOL_K12',
    subCategory: 'STATE_BOARD_MEDIUM',
    subCategoryTitle: 'State Board - State Medium / Bilingual (Classes 1–10)',
    stream: '',
    boardOrGrade: 'Karnataka SSLC Class 10th',
    subjectName: 'State Language (Kannada / Hindi / Regional)',
    courseMode: 'LIVE_ONLINE',
    liveMeetingUrl: 'https://zoom.us/j/9900000002',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800'
  },
  {
    title: '2nd PUC Science (PCMB) KCET & Board Intensive Batch',
    description: 'Physics, Chemistry, Mathematics & Biology Comprehensive Coaching for 2nd PUC Board Exams & KCET Rank Boost.',
    price: 2499,
    originalPrice: 5999,
    stateCode: 'KA',
    categoryCode: 'SCHOOL_K12',
    subCategory: 'PUC_SENIOR_SECONDARY',
    subCategoryTitle: 'PUC / Senior Secondary (+1 & +2)',
    stream: 'Science Stream (Subjects 1–6)',
    boardOrGrade: '2nd PUC Science',
    subjectName: 'Physics',
    courseMode: 'HYBRID',
    liveMeetingUrl: 'https://zoom.us/j/9900000003',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800'
  },
  {
    title: 'ICSE Class 9th & 10th Mathematics Foundation Series',
    description: 'Master ICSE Board Geometry, Algebra, Trigonometry & Coordinate Geometry with Expert Faculty.',
    price: 1799,
    originalPrice: 4499,
    stateCode: 'GLOBAL',
    categoryCode: 'SCHOOL_K12',
    subCategory: 'ICSE_BOARD',
    subCategoryTitle: 'ICSE Board (Classes 1–10)',
    stream: '',
    boardOrGrade: 'ICSE Class 10th',
    subjectName: 'Mathematics',
    courseMode: 'RECORDED_VIDEO',
    liveMeetingUrl: '',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800'
  },

  // Module 2: COMPETITIVE_EXAMS
  {
    title: 'NEET UG 2026 Target Medical Excellence Batch (Physics & Chemistry)',
    description: '3000+ NCERT Based MCQs, Live Doubt Resolution & Mock Test Series for NEET UG Medical Entrance.',
    price: 2999,
    originalPrice: 7999,
    stateCode: 'GLOBAL',
    categoryCode: 'COMPETITIVE_EXAMS',
    subCategory: 'NEET',
    subCategoryTitle: 'NEET (National Eligibility cum Entrance Test)',
    stream: '',
    boardOrGrade: 'NEET Medical Aspirants',
    subjectName: 'Biology',
    courseMode: 'LIVE_ONLINE',
    liveMeetingUrl: 'https://zoom.us/j/9900000004',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800'
  },
  {
    title: 'JEE Mains & Advanced 2026 Mathematics Rank Booster',
    description: 'Advanced Problem Solving Techniques in Calculus, Algebra & Vectors for IIT JEE Main & Advanced.',
    price: 3499,
    originalPrice: 8999,
    stateCode: 'GLOBAL',
    categoryCode: 'COMPETITIVE_EXAMS',
    subCategory: 'JEE',
    subCategoryTitle: 'JEE (Joint Entrance Examination)',
    stream: '',
    boardOrGrade: 'IIT-JEE Aspirants',
    subjectName: 'Mathematics',
    courseMode: 'HYBRID',
    liveMeetingUrl: 'https://zoom.us/j/9900000005',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800'
  },
  {
    title: 'J Jawahar Navodaya Entrance Exam (JNVST Class 6th Target)',
    description: 'Mental Ability Test, Arithmetic & Language Comprehensive Practice Batch for Navodaya Entrance.',
    price: 999,
    originalPrice: 2499,
    stateCode: 'KA',
    categoryCode: 'COMPETITIVE_EXAMS',
    subCategory: 'NAVODAYA',
    subCategoryTitle: 'Navodaya Entrance Exam',
    stream: '',
    boardOrGrade: 'Class 6 Entrance',
    subjectName: 'Quantitative Aptitude & Reasoning',
    courseMode: 'RECORDED_VIDEO',
    liveMeetingUrl: '',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800'
  },

  // Module 3: HIGHER_EDU
  {
    title: 'MBA Financial Management & Managerial Economics Master Class',
    description: 'Advanced Corporate Finance, Accounting for Managers, Economics & Business Decision Analytics.',
    price: 2499,
    originalPrice: 6499,
    stateCode: 'GLOBAL',
    categoryCode: 'HIGHER_EDU',
    subCategory: 'MBA',
    subCategoryTitle: 'MBA (Master of Business Administration)',
    stream: '',
    boardOrGrade: 'MBA 1st & 2nd Year',
    subjectName: 'Financial Management & Business Analytics',
    courseMode: 'RECORDED_VIDEO',
    liveMeetingUrl: '',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800'
  },
  {
    title: 'M.Com Corporate Accounting & Direct Taxation Fast-Track',
    description: 'Complete Syllabus Coverage of Advanced Corporate Accounting, GST, Direct Tax & Financial Reporting.',
    price: 1999,
    originalPrice: 4999,
    stateCode: 'MH',
    categoryCode: 'HIGHER_EDU',
    subCategory: 'MCOM',
    subCategoryTitle: 'M.Com (Master of Commerce)',
    stream: '',
    boardOrGrade: 'M.Com PG Degree',
    subjectName: 'Financial Management & Business Analytics',
    courseMode: 'LIVE_ONLINE',
    liveMeetingUrl: 'https://zoom.us/j/9900000006',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800'
  },

  // Module 4: STATE_GOVT_JOBS
  {
    title: 'UPPSC PCS Prelims & Mains General Studies (Uttar Pradesh PCS)',
    description: 'UP History, Economy, Polity, Geography & General Hindi for UPPSC PCS Officers Exam.',
    price: 3499,
    originalPrice: 8999,
    stateCode: 'UP',
    categoryCode: 'STATE_GOVT_JOBS',
    subCategory: 'UPPSC',
    subCategoryTitle: 'UPPSC (UP Public Service Commission / PCS)',
    stream: '',
    boardOrGrade: 'UPPSC PCS Prelims',
    subjectName: 'State Special GK & Current Affairs (राज्य विशेष व समसामयिकी)',
    courseMode: 'LIVE_ONLINE',
    liveMeetingUrl: 'https://zoom.us/j/9900000021',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800'
  },
  {
    title: 'UPSSSC Revenue Lekhpal & VDO Target Batch (General Hindi & Math)',
    description: 'Complete Preparation for UPSSSC Lekhpal, VDO, Junior Assistant & PET Examination.',
    price: 1499,
    originalPrice: 3999,
    stateCode: 'UP',
    categoryCode: 'STATE_GOVT_JOBS',
    subCategory: 'UPSSSC',
    subCategoryTitle: 'UPSSSC (Subordinate Services & Lekhpal/VDO)',
    stream: '',
    boardOrGrade: 'UPSSSC Lekhpal & VDO',
    subjectName: 'General Hindi (सामान्य हिंदी)',
    courseMode: 'RECORDED_VIDEO',
    liveMeetingUrl: '',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800'
  },
  {
    title: 'UP Police Constable & Sub-Inspector (SI) Selection Batch',
    description: 'Mental Aptitude, Reasoning, General Knowledge, Law/Constitution & General Hindi for UP Police.',
    price: 1299,
    originalPrice: 3499,
    stateCode: 'UP',
    categoryCode: 'STATE_GOVT_JOBS',
    subCategory: 'UP_POLICE',
    subCategoryTitle: 'UP Police Constable & Sub-Inspector (SI)',
    stream: '',
    boardOrGrade: 'UP Police SI & Constable',
    subjectName: 'Quantitative Aptitude & Mathematics',
    courseMode: 'HYBRID',
    liveMeetingUrl: 'https://zoom.us/j/9900000022',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800'
  },
  {
    title: 'KAS Prelims & Mains General Studies (Karnataka Administrative Services)',
    description: 'Karnataka History, Economy, Polity, Geography & Mental Ability for KPSC KAS Examination.',
    price: 2999,
    originalPrice: 7499,
    stateCode: 'KA',
    categoryCode: 'STATE_GOVT_JOBS',
    subCategory: 'KAS',
    subCategoryTitle: 'KAS (Karnataka Administrative Services)',
    stream: '',
    boardOrGrade: 'KPSC Officers Exam',
    subjectName: 'General Knowledge & Current Affairs',
    courseMode: 'LIVE_ONLINE',
    liveMeetingUrl: 'https://zoom.us/j/9900000007',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800'
  },
  {
    title: 'Karnataka SDA / FDA Recruitment General Knowledge & General Kannada Batch',
    description: 'Comprehensive Preparation for Second Division Assistant & First Division Assistant KPSC Recruitment.',
    price: 1599,
    originalPrice: 3999,
    stateCode: 'KA',
    categoryCode: 'STATE_GOVT_JOBS',
    subCategory: 'SDA',
    subCategoryTitle: 'SDA (Second Division Assistant)',
    stream: '',
    boardOrGrade: 'SDA/FDA Aspirants',
    subjectName: 'State Language (Kannada / Hindi / Regional)',
    courseMode: 'RECORDED_VIDEO',
    liveMeetingUrl: '',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800'
  },

  // Module 5: CENTRAL_GOVT_JOBS
  {
    title: 'Banking IBPS PO / SBI Clerk Quantitative Aptitude & Reasoning Special',
    description: 'Data Interpretation, Logical Reasoning, Puzzles & Speed Mathematics for All Banking Exams.',
    price: 1899,
    originalPrice: 4999,
    stateCode: 'GLOBAL',
    categoryCode: 'CENTRAL_GOVT_JOBS',
    subCategory: 'BANKING',
    subCategoryTitle: 'Banking Exams (IBPS, SBI, etc.)',
    stream: '',
    boardOrGrade: 'IBPS / SBI PO & Clerk',
    subjectName: 'Quantitative Aptitude & Reasoning',
    courseMode: 'LIVE_ONLINE',
    liveMeetingUrl: 'https://zoom.us/j/9900000008',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800'
  },
  {
    title: 'Railway RRB NTPC & Group D General Awareness & Science Crash Course',
    description: 'Physics, Chemistry, General Science, Current Affairs & Railway Aptitude Previous Year Solved Papers.',
    price: 1199,
    originalPrice: 2999,
    stateCode: 'GLOBAL',
    categoryCode: 'CENTRAL_GOVT_JOBS',
    subCategory: 'RRB',
    subCategoryTitle: 'Railway Recruitment Board (RRB)',
    stream: '',
    boardOrGrade: 'RRB NTPC & Group D',
    subjectName: 'General Science',
    courseMode: 'RECORDED_VIDEO',
    liveMeetingUrl: '',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=800'
  },

  // Module 6: TEACHER_PREP
  {
    title: 'CTET Paper 1 & Paper 2 Child Development & Pedagogy (CDP) Master Batch',
    description: 'Full Pedagogy Syllabus, Learning Theories, Inclusive Education & 2000+ CTET Practice Questions.',
    price: 1699,
    originalPrice: 3999,
    stateCode: 'GLOBAL',
    categoryCode: 'TEACHER_PREP',
    subCategory: 'CTET',
    subCategoryTitle: 'CTET (Central Teacher Eligibility Test)',
    stream: '',
    boardOrGrade: 'CTET Paper I & II',
    subjectName: 'Child Development & Pedagogy',
    courseMode: 'LIVE_ONLINE',
    liveMeetingUrl: 'https://zoom.us/j/9900000009',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800'
  },
  {
    title: 'Karnataka K-TET Primary & Higher Primary Teacher Recruitment Complete Guide',
    description: 'TET Paper 1 & Paper 2 Educational Psychology, Kannada, English, Environmental Studies & Mathematics.',
    price: 1599,
    originalPrice: 3899,
    stateCode: 'KA',
    categoryCode: 'TEACHER_PREP',
    subCategory: 'TET',
    subCategoryTitle: 'TET (Teacher Eligibility Test)',
    stream: '',
    boardOrGrade: 'Karnataka K-TET',
    subjectName: 'Child Development & Pedagogy',
    courseMode: 'HYBRID',
    liveMeetingUrl: 'https://zoom.us/j/9900000010',
    lectureVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800'
  }
];

const runSeeder = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB!');

    console.log('Deleting all existing old courses...');
    const deleteResult = await Course.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} old courses successfully!`);

    // Fetch Super Admin / Teacher user to set as instructor
    const adminUser = await User.findOne({ role: { $in: ['ADMIN', 'TEACHER'] } }).lean() || await User.findOne({}).lean();
    const instructorId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

    // Fetch existing categories
    const categories = await Category.find({}).lean();
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.code] = cat._id;
    });

    console.log('Seeding fresh new courses with full 6-level taxonomy & subject fields...');

    const coursesToInsert = [];
    for (const cData of freshCoursesData) {
      let catId = categoryMap[cData.categoryCode];
      if (!catId && categories.length > 0) {
        catId = categories[0]._id;
      }

      coursesToInsert.push({
        title: cData.title,
        description: cData.description,
        price: cData.price,
        originalPrice: cData.originalPrice,
        stateCode: cData.stateCode,
        category: catId,
        subCategory: cData.subCategory,
        subCategoryTitle: cData.subCategoryTitle,
        stream: cData.stream,
        boardOrGrade: cData.boardOrGrade,
        subjectName: cData.subjectName,
        courseMode: cData.courseMode,
        liveMeetingUrl: cData.liveMeetingUrl,
        lectureVideoUrl: cData.lectureVideoUrl,
        thumbnail: cData.thumbnail,
        instructor: instructorId,
        validityDays: 365,
        active: true,
        isFeatured: true
      });
    }

    const insertedCourses = await Course.insertMany(coursesToInsert);
    console.log(`🎉 Successfully seeded ${insertedCourses.length} fresh courses into database!`);

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

runSeeder();

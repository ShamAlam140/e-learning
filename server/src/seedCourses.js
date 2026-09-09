const mongoose = require('mongoose');
const Course = require('./models/Course');
const Category = require('./models/Category');
const User = require('./models/User');
const { CORE_MODULES_TAXONOMY } = require('./config/categoryTaxonomy');
require('dotenv').config();

const runSeedScript = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elearning_dev_db';
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // 1. CLEAR ALL OLD COURSES FROM DATABASE
    console.log('🗑️ Deleting all existing courses from database...');
    const deleteResult = await Course.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} old courses successfully!`);

    // 2. Ensure Categories exist in database
    let categories = await Category.find({}).lean();
    if (categories.length === 0) {
      console.log('🌱 Seeding initial 6 Core Categories...');
      const categoriesToInsert = CORE_MODULES_TAXONOMY.map((m, idx) => ({
        code: m.code,
        title: m.title,
        description: m.description,
        icon: m.icon,
        sequence: idx + 1
      }));
      await Category.insertMany(categoriesToInsert);
      categories = await Category.find({}).lean();
    }

    const defaultCatId = categories[0]?._id;
    const getCatId = (code) => {
      const found = categories.find((c) => c.code === code);
      return found ? found._id : defaultCatId;
    };

    // Find any teacher or admin user as instructor
    const teacher = await User.findOne({ role: { $in: ['TEACHER', 'ADMIN'] } });

    // 3. SEED BRAND NEW 6 CORE MODULE COURSES
    const freshCourses = [
      // Module I: School Education
      {
        title: 'CBSE Class 10th All-in-One Science & Maths Board Prep',
        slug: 'cbse-class-10-board-prep',
        category: getCatId('SCHOOL_K12'),
        subCategory: 'CBSE_BOARD',
        subCategoryTitle: 'CBSE Board (Classes 1–10)',
        stateCode: 'GLOBAL',
        boardOrGrade: 'CBSE Class 10',
        description: 'Complete NCERT video solutions, chapterwise notes, and mock board tests for Class 10.',
        price: 1499,
        originalPrice: 2999,
        instructor: teacher ? teacher._id : undefined,
        active: true,
        isFeatured: true
      },
      {
        title: 'Karnataka State Board SSLC Kannada & English Medium Crash Course',
        slug: 'karnataka-sslc-board-prep',
        category: getCatId('SCHOOL_K12'),
        subCategory: 'STATE_BOARD_MEDIUM',
        subCategoryTitle: 'State Board - State Medium / Bilingual',
        stateCode: 'KA',
        boardOrGrade: 'Karnataka State SSLC',
        description: 'Bilingual Karnataka Secondary Board exam preparation module with model question papers.',
        price: 1299,
        originalPrice: 2499,
        instructor: teacher ? teacher._id : undefined,
        active: true,
        isFeatured: true
      },
      {
        title: '12th PUC Science Stream (Physics, Chem, Math, Bio) Master Batch',
        slug: '12th-puc-science-stream',
        category: getCatId('SCHOOL_K12'),
        subCategory: 'PUC_SENIOR_SECONDARY',
        subCategoryTitle: 'PUC / Senior Secondary (+1 & +2)',
        stream: 'Science Stream (Subjects 1–6)',
        stateCode: 'GLOBAL',
        boardOrGrade: '+2 Senior Secondary Science',
        description: 'Comprehensive 2-year integrated course for Class 12 Science stream board & CET exams.',
        price: 2499,
        originalPrice: 4999,
        instructor: teacher ? teacher._id : undefined,
        active: true,
        isFeatured: true
      },
      // Module II: Competitive Exams
      {
        title: 'NEET UG 2026 Physics & Chemistry Concept Booster',
        slug: 'neet-ug-2026-concept-booster',
        category: getCatId('COMPETITIVE_EXAMS'),
        subCategory: 'NEET',
        subCategoryTitle: 'NEET (National Eligibility cum Entrance Test)',
        stateCode: 'GLOBAL',
        boardOrGrade: 'NEET Entrance',
        description: 'Top-ranker NEET preparation suite with 10,000+ chapterwise MCQs and speed solution techniques.',
        price: 2999,
        originalPrice: 5999,
        instructor: teacher ? teacher._id : undefined,
        active: true,
        isFeatured: true
      },
      {
        title: 'JEE Main & Advanced Mathematics & Physics Intensive',
        slug: 'jee-main-advanced-maths-physics',
        category: getCatId('COMPETITIVE_EXAMS'),
        subCategory: 'JEE',
        subCategoryTitle: 'JEE (Joint Entrance Examination)',
        stateCode: 'GLOBAL',
        boardOrGrade: 'JEE Entrance',
        description: 'Advanced problem solving techniques, shortcut methods, and 50+ full length NTA mock tests.',
        price: 3499,
        originalPrice: 6999,
        instructor: teacher ? teacher._id : undefined,
        active: true,
        isFeatured: true
      },
      // Module III: Higher Education
      {
        title: 'MBA Financial Management & Strategic Leadership Specialization',
        slug: 'mba-financial-management-leadership',
        category: getCatId('HIGHER_EDU'),
        subCategory: 'MBA',
        subCategoryTitle: 'MBA (Master of Business Administration)',
        stateCode: 'GLOBAL',
        boardOrGrade: 'Post Graduation (MBA)',
        description: 'Master business analytics, financial modeling, marketing strategies & case studies.',
        price: 3999,
        originalPrice: 7999,
        instructor: teacher ? teacher._id : undefined,
        active: true,
        isFeatured: true
      },
      // Module IV: State Govt Jobs
      {
        title: 'KAS (Karnataka Administrative Services) Prelims & Mains General Studies',
        slug: 'kas-prelims-mains-gs',
        category: getCatId('STATE_GOVT_JOBS'),
        subCategory: 'KAS',
        subCategoryTitle: 'KAS (Karnataka Administrative Services)',
        stateCode: 'KA',
        boardOrGrade: 'KAS State Exam',
        description: 'Complete Karnataka history, polity, economy, geography, and current affairs master class.',
        price: 2499,
        originalPrice: 4999,
        instructor: teacher ? teacher._id : undefined,
        active: true,
        isFeatured: true
      },
      {
        title: 'FDA & SDA State Revenue Exam Complete Coaching Batch',
        slug: 'fda-sda-state-revenue-exam',
        category: getCatId('STATE_GOVT_JOBS'),
        subCategory: 'FDA',
        subCategoryTitle: 'FDA (First Division Assistant)',
        stateCode: 'KA',
        boardOrGrade: 'FDA / SDA State Job',
        description: 'General Kannada, General Knowledge & Computer Literacy comprehensive course.',
        price: 1899,
        originalPrice: 3799,
        instructor: teacher ? teacher._id : undefined,
        active: true,
        isFeatured: true
      },
      // Module V: Central Govt Jobs
      {
        title: 'Banking Exams 2026 (IBPS PO, SBI Clerk & RRB) Complete Prep',
        slug: 'banking-ibps-sbi-po-clerk',
        category: getCatId('CENTRAL_GOVT_JOBS'),
        subCategory: 'BANKING',
        subCategoryTitle: 'Banking Exams (IBPS, SBI, etc.)',
        stateCode: 'GLOBAL',
        boardOrGrade: 'Banking Competitive Exam',
        description: 'Quantitative Aptitude, Logical Reasoning, English Language, and Banking Awareness.',
        price: 1999,
        originalPrice: 3999,
        instructor: teacher ? teacher._id : undefined,
        active: true,
        isFeatured: true
      },
      // Module VI: Teacher Prep
      {
        title: 'CTET & State TET Paper 1 & Paper 2 Child Pedagogy Master Course',
        slug: 'ctet-state-tet-paper-1-2',
        category: getCatId('TEACHER_PREP'),
        subCategory: 'CTET',
        subCategoryTitle: 'CTET (Central Teacher Eligibility Test)',
        stateCode: 'GLOBAL',
        boardOrGrade: 'TET / CTET Certification',
        description: 'Child Development, Pedagogy, EVS, Mathematics & Language 1 & 2 complete syllabus.',
        price: 1499,
        originalPrice: 2999,
        instructor: teacher ? teacher._id : undefined,
        active: true,
        isFeatured: true
      }
    ];

    const insertedCourses = await Course.insertMany(freshCourses);
    console.log(`🎉 Successfully seeded ${insertedCourses.length} fresh 6-Level Hierarchy courses across all 6 Core Modules!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing seed script:', err);
    process.exit(1);
  }
};

runSeedScript();

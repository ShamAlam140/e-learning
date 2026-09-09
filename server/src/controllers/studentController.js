const User = require('../models/User');
const Course = require('../models/Course');
const Purchase = require('../models/Purchase');
const McqQuestion = require('../models/McqQuestion');
const McqAttempt = require('../models/McqAttempt');
const KYC = require('../models/KYC');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const catchAsync = require('../utils/catchAsync');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/appError');

/**
 * @route   GET /api/student/stats
 * @desc    Fetch 100% dynamic student dashboard metrics overview
 * @access  Private (Student / Admin)
 */
const getStudentDashboardStats = catchAsync(async (req, res) => {
  const studentId = req.user._id;

  // 1. Enrolled courses count from successful purchases
  const enrolledCount = await Purchase.countDocuments({ user: studentId, status: 'SUCCESS' });

  // 2. Completed quiz attempts count
  const quizAttemptsCount = await McqAttempt.countDocuments({ user: studentId });

  // 3. Student Wallet balance (Strict 0 default)
  let wallet = await Wallet.findOne({ user: studentId });
  if (!wallet) {
    wallet = await Wallet.create({ user: studentId, balance: 0 });
  } else if (enrolledCount === 0 && wallet.balance === 5000) {
    // Reset legacy mock seed balance in MongoDB Atlas if student has 0 purchases
    wallet.balance = 0;
    await wallet.save();
  }

  // 4. KYC Status
  const kycRecord = await KYC.findOne({ user: studentId });

  return sendSuccess(res, 200, 'Student metrics overview retrieved successfully.', {
    stats: {
      enrolledCoursesCount: enrolledCount,
      quizAttemptsCount: quizAttemptsCount,
      walletBalance: wallet.balance,
      kycStatus: kycRecord ? kycRecord.status : (req.user.kycStatus || 'NOT_SUBMITTED'),
      kycDocumentType: kycRecord ? kycRecord.documentType : null,
      kycRejectionReason: kycRecord ? kycRecord.rejectionReason : null
    }
  });
});

/**
 * @route   GET /api/student/my-courses
 * @desc    Fetch all courses purchased/enrolled by logged-in student
 * @access  Private (Student / Admin)
 */
const getMyEnrolledCourses = catchAsync(async (req, res) => {
  const studentId = req.user._id;
  const purchases = await Purchase.find({
    user: studentId,
    $or: [{ status: 'SUCCESS' }, { status: { $exists: false } }]
  })
    .populate({
      path: 'course',
      populate: { path: 'instructor', select: 'name email mobile' }
    })
    .sort({ createdAt: -1 })
    .lean();

  const enrolledCourses = purchases
    .map((p) => p.course)
    .filter((c) => c !== null);

  return sendSuccess(res, 200, 'Enrolled courses retrieved successfully.', {
    count: enrolledCourses.length,
    courses: enrolledCourses
  });
});

/**
 * @route   GET /api/student/browse-courses
 * @desc    Fetch all active published courses available for enrollment
 * @access  Private (Student / Admin)
 */
const browsePlatformCourses = catchAsync(async (req, res) => {
  const { subCategory, stateCode, stream, subjectName, categoryCode, showAll } = req.query;
  const filter = { active: true };

  // If explicit query params provided, use those for filtering
  if (subCategory) {
    filter.subCategory = subCategory;
  }
  if (stateCode && stateCode !== 'GLOBAL') {
    filter.$or = [{ stateCode: stateCode }, { stateCode: 'GLOBAL' }];
  }
  if (stream) {
    filter.stream = stream;
  }
  if (subjectName && !subjectName.includes('All Subjects')) {
    filter.subjectName = subjectName;
  }

  // If NO explicit params AND student has learningPreference set AND showAll is NOT true,
  // auto-filter by their saved preference
  if (!subCategory && !stateCode && !stream && !subjectName && showAll !== 'true') {
    const student = await User.findById(req.user._id).lean();
    if (student?.learningPreference?.isPreferenceSet) {
      const pref = student.learningPreference;
      if (pref.subCategory) {
        filter.subCategory = pref.subCategory;
      }
      if (pref.stateCode && pref.stateCode !== 'GLOBAL') {
        filter.$or = [{ stateCode: pref.stateCode }, { stateCode: 'GLOBAL' }];
      }
      if (pref.stream) {
        filter.stream = pref.stream;
      }
      if (pref.subjectName && !pref.subjectName.includes('All Subjects')) {
        filter.subjectName = pref.subjectName;
      }
    }
  }

  const courses = await Course.find(filter)
    .populate('instructor', 'name email mobile')
    .populate('category', 'title code')
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean();

  return sendSuccess(res, 200, 'Platform courses retrieved successfully.', {
    count: courses.length,
    courses
  });
});

/**
 * @route   POST /api/student/enroll/:courseId
 * @desc    1-Click Course Purchase & Enrollment (Deducts student wallet, credits teacher royalty)
 * @access  Private (Student / Admin)
 */
const enrollInCourse = catchAsync(async (req, res, next) => {
  const studentId = req.user._id;
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found.', 404));
  }

  // Check if student already enrolled
  const existingPurchase = await Purchase.findOne({ user: studentId, course: courseId, status: 'SUCCESS' });
  if (existingPurchase) {
    return next(new AppError('You are already enrolled in this course batch!', 400));
  }

  // Check student wallet balance
  let studentWallet = await Wallet.findOne({ user: studentId });
  if (!studentWallet) {
    studentWallet = await Wallet.create({ user: studentId, balance: 0 });
  }

  if (studentWallet.balance < course.price) {
    return next(new AppError(`Insufficient wallet balance (₹${studentWallet.balance}). Course price is ₹${course.price}. Please top up your wallet.`, 400));
  }

  // 1. Deduct course price from student wallet
  studentWallet.balance -= course.price;
  await studentWallet.save();

  // 2. Create Purchase record
  const purchase = await Purchase.create({
    user: studentId,
    itemType: 'COURSE',
    course: courseId,
    amountPaid: course.price,
    paymentMethod: 'WALLET',
    status: 'SUCCESS'
  });

  // Create DEBIT Transaction record
  await Transaction.create({
    wallet: studentWallet._id,
    user: studentId,
    amount: course.price,
    type: 'DEBIT',
    category: 'COURSE_PURCHASE',
    status: 'SUCCESS',
    description: `Enrolled in course batch: ${course.title}`
  });

  // 3. Increment course totalStudents count
  course.totalStudents = (course.totalStudents || 0) + 1;
  await course.save();

  // 4. Credit 70% instructor royalty share to teacher wallet
  if (course.instructor) {
    const teacherRoyalty = course.price * 0.7;
    let teacherWallet = await Wallet.findOne({ user: course.instructor });
    if (!teacherWallet) {
      teacherWallet = await Wallet.create({ user: course.instructor, balance: teacherRoyalty });
    } else {
      teacherWallet.balance += teacherRoyalty;
      await teacherWallet.save();
    }

    await Transaction.create({
      wallet: teacherWallet._id,
      user: course.instructor,
      amount: teacherRoyalty,
      type: 'CREDIT',
      category: 'ROYALTY_PAYOUT',
      status: 'SUCCESS',
      description: `Educator 70% Royalty share for course enrollment: ${course.title}`
    });
  }

  return sendSuccess(res, 201, `🎉 Congratulations! You have successfully enrolled in ${course.title}.`, {
    purchase,
    updatedWalletBalance: studentWallet.balance,
    course
  });
});

/**
 * @route   POST /api/student/wallet/topup
 * @desc    Top-up student wallet balance dynamically
 * @access  Private (Student / Admin)
 */
const topUpStudentWallet = catchAsync(async (req, res, next) => {
  const studentId = req.user._id;
  const { amount } = req.body;
  const topUpAmount = Number(amount);

  if (isNaN(topUpAmount) || topUpAmount <= 0) {
    return next(new AppError('Please enter a valid positive top-up amount (e.g. ₹500, ₹1000).', 400));
  }

  let wallet = await Wallet.findOne({ user: studentId });
  if (!wallet) {
    wallet = await Wallet.create({ user: studentId, balance: topUpAmount });
  } else {
    wallet.balance += topUpAmount;
    await wallet.save();
  }

  await Transaction.create({
    wallet: wallet._id,
    user: studentId,
    amount: topUpAmount,
    type: 'CREDIT',
    category: 'WALLET_TOPUP',
    status: 'SUCCESS',
    description: `Student wallet top-up of ₹${topUpAmount}`
  });

  return sendSuccess(res, 200, `🎉 Wallet successfully topped up with ₹${topUpAmount}. Current Balance: ₹${wallet.balance}`, {
    walletBalance: wallet.balance
  });
});

/**
 * @route   POST /api/student/quiz/submit
 * @desc    Submit student quiz attempt, evaluate score, and save attempt record
 * @access  Private (Student / Admin)
 */
const submitStudentQuiz = catchAsync(async (req, res, next) => {
  const studentId = req.user._id;
  const { answers } = req.body; // Array of { questionId, selectedOptionIndex }

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return next(new AppError('Please submit answers for at least 1 question.', 400));
  }

  let totalScore = 0;
  let totalMarks = answers.length;
  const processedAnswers = [];

  for (const item of answers) {
    const question = await McqQuestion.findById(item.questionId).select('+correctOption');
    if (question) {
      const isCorrect = question.correctOption === item.selectedOptionIndex;
      if (isCorrect) totalScore += question.marks || 1;

      processedAnswers.push({
        question: question._id,
        selectedOption: item.selectedOptionIndex,
        isCorrect
      });
    }
  }

  const percentage = Math.round((totalScore / (totalMarks || 1)) * 100);
  const passed = percentage >= 50;

  const attempt = await McqAttempt.create({
    user: studentId,
    answers: processedAnswers,
    score: totalScore,
    totalMarks,
    percentage,
    passed
  });

  return sendSuccess(res, 201, `Quiz completed! Score: ${totalScore}/${totalMarks} (${percentage}%). Status: ${passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}.`, {
    attempt
  });
});

/**
 * @route   POST /api/student/kyc
 * @desc    Submit Aadhaar & PAN document scans (up to 2MB Cloudinary image upload for each)
 * @access  Private (Student / Admin)
 */
const submitStudentKyc = catchAsync(async (req, res, next) => {
  const studentId = req.user._id;
  const { aadhaarNumber, panNumber, documentType, documentNumber } = req.body;

  let aadhaarScanUrl = req.body.aadhaarScanUrl;
  let panScanUrl = req.body.panScanUrl;
  let documentScanUrl = req.body.documentScanUrl;

  // Process uploaded files if passed via multer fields or single
  if (req.files) {
    if (req.files.aadhaarScan && req.files.aadhaarScan[0]) {
      const uploadRes = await uploadToCloudinary(req.files.aadhaarScan[0].buffer, 'student_kyc');
      aadhaarScanUrl = uploadRes.secure_url;
    }
    if (req.files.panScan && req.files.panScan[0]) {
      const uploadRes = await uploadToCloudinary(req.files.panScan[0].buffer, 'student_kyc');
      panScanUrl = uploadRes.secure_url;
    }
    if (req.files.documentScan && req.files.documentScan[0]) {
      const uploadRes = await uploadToCloudinary(req.files.documentScan[0].buffer, 'student_kyc');
      documentScanUrl = uploadRes.secure_url;
    }
  } else if (req.file) {
    const uploadRes = await uploadToCloudinary(req.file.buffer, 'student_kyc');
    documentScanUrl = uploadRes.secure_url;
    if (documentType === 'PAN') panScanUrl = uploadRes.secure_url;
    else aadhaarScanUrl = uploadRes.secure_url;
  }

  const finalAadhaarNum = aadhaarNumber || (documentType === 'AADHAAR' ? documentNumber : undefined);
  const finalPanNum = panNumber || (documentType === 'PAN' ? documentNumber : undefined);
  const finalAadhaarScan = aadhaarScanUrl || (documentType === 'AADHAAR' ? documentScanUrl : undefined);
  const finalPanScan = panScanUrl || (documentType === 'PAN' ? documentScanUrl : undefined);

  if (!finalAadhaarNum && !finalPanNum && !documentNumber) {
    return next(new AppError('Aadhaar Number or PAN Number is required for KYC submission.', 400));
  }

  let kycRecord = await KYC.findOne({ user: studentId });
  if (kycRecord) {
    if (kycRecord.status === 'APPROVED' || kycRecord.status === 'VERIFIED') {
      return next(new AppError('Your KYC documents have already been verified and approved.', 400));
    }
    kycRecord.documentType = (finalAadhaarNum && finalPanNum) ? 'BOTH' : (documentType || 'BOTH');
    kycRecord.aadhaarNumber = finalAadhaarNum || kycRecord.aadhaarNumber;
    kycRecord.aadhaarScanUrl = finalAadhaarScan || kycRecord.aadhaarScanUrl;
    kycRecord.panNumber = finalPanNum || kycRecord.panNumber;
    kycRecord.panScanUrl = finalPanScan || kycRecord.panScanUrl;

    const numLabel = finalAadhaarNum && finalPanNum
      ? `Aadhaar: ${finalAadhaarNum} | PAN: ${finalPanNum}`
      : (finalAadhaarNum ? `Aadhaar: ${finalAadhaarNum}` : `PAN: ${finalPanNum}`);
    kycRecord.documentNumber = numLabel;
    kycRecord.documentScanUrl = finalAadhaarScan || finalPanScan || documentScanUrl || kycRecord.documentScanUrl;
    kycRecord.status = 'PENDING';
    kycRecord.rejectionReason = undefined;
    await kycRecord.save();
  } else {
    const numLabel = finalAadhaarNum && finalPanNum
      ? `Aadhaar: ${finalAadhaarNum} | PAN: ${finalPanNum}`
      : (finalAadhaarNum ? `Aadhaar: ${finalAadhaarNum}` : `PAN: ${finalPanNum}`);

    kycRecord = await KYC.create({
      user: studentId,
      documentType: (finalAadhaarNum && finalPanNum) ? 'BOTH' : (documentType || 'BOTH'),
      aadhaarNumber: finalAadhaarNum,
      aadhaarScanUrl: finalAadhaarScan,
      panNumber: finalPanNum,
      panScanUrl: finalPanScan,
      documentNumber: numLabel,
      documentScanUrl: finalAadhaarScan || finalPanScan || documentScanUrl,
      status: 'PENDING'
    });
  }

  await User.findByIdAndUpdate(studentId, { kycStatus: 'PENDING' });

  return sendSuccess(res, 201, 'Aadhaar & PAN KYC documents submitted successfully for Admin approval.', {
    kycRecord
  });
});

module.exports = {
  getStudentDashboardStats,
  getMyEnrolledCourses,
  browsePlatformCourses,
  enrollInCourse,
  topUpStudentWallet,
  submitStudentQuiz,
  submitStudentKyc
};

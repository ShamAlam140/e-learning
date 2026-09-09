const jwt = require('jsonwebtoken');
const User = require('../models/User');
const State = require('../models/State');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const { placeNodeInBinaryTree } = require('../utils/mlmService');
const { sendEmailOTP } = require('../utils/emailService');

/**
 * Sign Access Token (15 Minutes Expiration)
 */
const signAccessToken = (id) => {
  const secret = process.env.JWT_SECRET || 'super_secure_jwt_secret_key_2026_enterprise_level';
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  return jwt.sign({ id, type: 'access' }, secret, { expiresIn });
};

/**
 * Sign Refresh Token (7 Days Expiration)
 */
const signRefreshToken = (id) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'super_secure_refresh_secret_key_2026_enterprise_level';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign({ id, type: 'refresh' }, secret, { expiresIn });
};

/**
 * Standard Dual-Token Response Sender with Secure HttpOnly Cookies
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  const isProduction = process.env.NODE_ENV === 'production';

  // HttpOnly Cookie for 15-minute Access Token
  res.cookie('accessToken', accessToken, {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax'
  });

  // HttpOnly Cookie for 7-day Refresh Token
  res.cookie('refreshToken', refreshToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax'
  });

  // Legacy fallback cookie
  res.cookie('jwt', accessToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax'
  });

  user.password = undefined;
  user.otp = undefined;
  user.otpExpires = undefined;

  return sendSuccess(res, statusCode, message, {
    token: accessToken,
    accessToken,
    refreshToken,
    expiresInSeconds: 900, // 15 mins
    user
  });
};

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Obtain new 15-minute Access Token using 7-day Refresh Token
 * @access  Public
 */
const refreshAccessToken = catchAsync(async (req, res, next) => {
  let token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return next(new AppError('Refresh token missing. Please log in again.', 401));
  }

  const secret = process.env.JWT_REFRESH_SECRET || 'super_secure_refresh_secret_key_2026_enterprise_level';
  
  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User belonging to this token no longer exists.', 401));
  }

  const newAccessToken = signAccessToken(currentUser._id);

  res.cookie('accessToken', newAccessToken, {
    expires: new Date(Date.now() + 15 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  res.cookie('jwt', newAccessToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return sendSuccess(res, 200, 'Access token refreshed successfully.', {
    token: newAccessToken,
    accessToken: newAccessToken,
    expiresInSeconds: 900
  });
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account with mobile OTP dispatch
 * @access  Public
 */
const register = catchAsync(async (req, res, next) => {
  const { name, mobile, password, email, role, stateCode, referredBy } = req.body;

  const existingUser = await User.findOne({ mobile }).lean();
  if (existingUser) {
    return next(new AppError('A user with this mobile number is already registered.', 400));
  }

  if (email && email.trim()) {
    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() }).lean();
    if (existingEmail) {
      return next(new AppError('A user with this email address is already registered.', 400));
    }
  }

  let stateId = null;
  if (stateCode) {
    const stateObj = await State.findOne({ code: stateCode.toUpperCase() }).lean();
    if (stateObj) stateId = stateObj._id;
  }

  const newUser = new User({
    name,
    mobile,
    password,
    email: email && email.trim() ? email.trim().toLowerCase() : undefined,
    role: role ? role.toUpperCase() : 'STUDENT',
    selectedState: stateId,
    stateCode: stateCode ? stateCode.toUpperCase() : 'KA',
    referredBy
  });

  const otpCode = newUser.createOTP();
  await newUser.save();

  // If registered via referral code, place user into sponsor's binary MLM tree
  if (referredBy) {
    const sponsor = await User.findOne({
      $or: [{ referralCode: referredBy.trim() }, { userId: referredBy.trim() }]
    }).lean();

    if (sponsor) {
      try {
        await placeNodeInBinaryTree(sponsor._id, newUser._id);
      } catch (err) {
        // Log placement warning without breaking user registration flow
      }
    }
  }

  newUser.password = undefined;

  return sendSuccess(res, 201, 'User account registered successfully. OTP dispatched.', {
    userId: newUser.userId,
    mobile: newUser.mobile,
    referralCode: newUser.referralCode,
    otpSimulated: otpCode
  });
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify 6-digit OTP and issue JWT access token
 * @access  Public
 */
const verifyOTP = catchAsync(async (req, res, next) => {
  const { mobile, otp } = req.body;

  const user = await User.findOne({ mobile }).select('+otp +otpExpires');
  if (!user) {
    return next(new AppError('No user account found with this mobile number.', 404));
  }

  if (!user.otp || user.otp !== otp) {
    return next(new AppError('Invalid OTP code. Verification failed.', 400));
  }

  if (user.otpExpires && user.otpExpires < Date.now()) {
    return next(new AppError('OTP code has expired. Please request a new OTP.', 400));
  }

  user.isMobileVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return sendTokenResponse(user, 200, res, 'Mobile number verified successfully. Authenticated.');
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user via Email/Mobile/UserID + Password, dispatch 6-digit Email OTP
 * @access  Public
 */
const login = catchAsync(async (req, res, next) => {
  const { identifier, password } = req.body;

  const trimmedIdentifier = identifier.trim();

  const user = await User.findOne({
    $or: [
      { email: trimmedIdentifier.toLowerCase() },
      { mobile: trimmedIdentifier },
      { userId: trimmedIdentifier }
    ]
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid Email / Mobile Number or Password.', 401));
  }

  // Blocked User Check
  if (user.isBlocked || user.status === 'BLOCKED') {
    return next(new AppError('Your account has been blocked by Admin. Please contact support at admin@eduverse.in.', 403));
  }

  // OTP Email dispatch commented out until App Password is set up
  // const emailOtp = user.createEmailOTP();
  // await user.save({ validateBeforeSave: false });
  // const recipientEmail = user.email || `${user.mobile}@eduverse.in`;
  // await sendEmailOTP(recipientEmail, emailOtp, user.name);

  // Issue Access Token & Refresh Token directly on Email + Password verification
  return sendTokenResponse(user, 200, res, 'Login successful.');
});

/**
 * @route   POST /api/auth/verify-email-otp
 * @desc    Verify 6-digit Email OTP and issue dual Access + Refresh tokens
 * @access  Public
 */
const verifyEmailOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const trimmedEmail = (email || '').trim().toLowerCase();

  const user = await User.findOne({
    $or: [
      { email: trimmedEmail },
      { mobile: email },
      { userId: email }
    ]
  }).select('+emailOtp +emailOtpExpires');

  if (!user) {
    return next(new AppError('No account found for this email address.', 404));
  }

  if (!user.emailOtp || user.emailOtp !== otp.trim()) {
    return next(new AppError('Invalid Email OTP code. Verification failed.', 400));
  }

  if (user.emailOtpExpires && user.emailOtpExpires < Date.now()) {
    return next(new AppError('Email OTP code has expired. Please request a new OTP.', 400));
  }

  user.isEmailVerified = true;
  user.emailOtp = undefined;
  user.emailOtpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return sendTokenResponse(user, 200, res, 'Email OTP verified successfully. Authenticated.');
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private
 */
const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('selectedState', 'code name')
    .lean();

  return sendSuccess(res, 200, 'User profile fetched successfully.', { user });
});

/**
 * @route   PUT /api/auth/state
 * @desc    Update Indian State localization preference
 * @access  Private
 */
const updateStatePreference = catchAsync(async (req, res, next) => {
  const { stateCode } = req.body;

  const stateObj = await State.findOne({ code: stateCode.toUpperCase() }).lean();
  if (!stateObj) {
    return next(new AppError(`Invalid state code '${stateCode}'. State not found.`, 404));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      selectedState: stateObj._id,
      stateCode: stateObj.code
    },
    { new: true, runValidators: true }
  ).populate('selectedState', 'code name').lean();

  return sendSuccess(res, 200, 'State preference updated successfully.', {
    user: updatedUser
  });
});

/**
 * @route   PUT /api/auth/preference
 * @desc    Update 6-Level student course learning preference
 * @access  Private
 */
const updateStudentPreference = catchAsync(async (req, res, next) => {
  const { stateCode, categoryCode, subCategory, subCategoryTitle, stream, boardOrGrade, subjectName } = req.body;

  const learningPreference = {
    stateCode: stateCode || 'GLOBAL',
    categoryCode: categoryCode || '',
    subCategory: subCategory || '',
    subCategoryTitle: subCategoryTitle || '',
    stream: stream || '',
    boardOrGrade: boardOrGrade || subCategoryTitle || '',
    subjectName: subjectName || 'All Subjects',
    isPreferenceSet: true
  };

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { learningPreference, stateCode: stateCode || 'GLOBAL' },
    { new: true, runValidators: true }
  ).populate('selectedState', 'code name').lean();

  return sendSuccess(res, 200, 'Learning preference updated successfully.', {
    user: updatedUser
  });
});

module.exports = {
  register,
  verifyOTP,
  verifyEmailOTP,
  login,
  getMe,
  updateStatePreference,
  updateStudentPreference,
  refreshAccessToken
};

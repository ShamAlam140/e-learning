const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      index: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      index: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['STUDENT', 'TEACHER', 'ADMIN'],
      default: 'STUDENT',
      index: true
    },
    selectedState: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State'
    },
    stateCode: {
      type: String,
      default: 'KA',
      index: true
    },
    learningPreference: {
      stateCode: { type: String, default: 'GLOBAL' },
      categoryCode: { type: String, default: '' },
      subCategory: { type: String, default: '' },
      subCategoryTitle: { type: String, default: '' },
      stream: { type: String, default: '' },
      boardOrGrade: { type: String, default: '' },
      subjectName: { type: String, default: 'All Subjects' },
      isPreferenceSet: { type: Boolean, default: false }
    },
    kycStatus: {
      type: String,
      enum: ['NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED'],
      default: 'NOT_SUBMITTED',
      index: true
    },
    isMobileVerified: {
      type: Boolean,
      default: false
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'BLOCKED'],
      default: 'ACTIVE',
      index: true
    },
    otp: {
      type: String,
      select: false
    },
    otpExpires: {
      type: Date,
      select: false
    },
    emailOtp: {
      type: String,
      select: false
    },
    emailOtpExpires: {
      type: Date,
      select: false
    },
    referralCode: {
      type: String,
      unique: true,
      index: true
    },
    referredBy: {
      type: String,
      trim: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook for auto IDs & password hashing
userSchema.pre('save', async function (next) {
  if (!this.userId) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    this.userId = `EDU-${randomNum}`;
  }

  if (!this.referralCode) {
    const randomRef = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.referralCode = `REF-${randomRef}`;
  }

  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance Method: Compare candidate password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance Method: Generate 6-digit SMS OTP
userSchema.methods.createOTP = function () {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otpCode;
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
  return otpCode;
};

// Instance Method: Generate 6-digit Email OTP
userSchema.methods.createEmailOTP = function () {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailOtp = otpCode;
  this.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otpCode;
};

// Compound indexes for optimal paginated queries & fast sorting
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ stateCode: 1, role: 1, createdAt: -1 });
userSchema.index({ kycStatus: 1, createdAt: -1 });
userSchema.index({ isBlocked: 1, createdAt: -1 });
userSchema.index({ name: 1, role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;

const express = require('express');
const {
  register,
  verifyOTP,
  verifyEmailOTP,
  login,
  getMe,
  updateStatePreference,
  updateStudentPreference,
  refreshAccessToken
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  statePreferenceSchema,
  validateRequest
} = require('../validators/authValidator');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOTP);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh-token', refreshAccessToken);

// Protected Routes
router.use(protect);
router.get('/me', getMe);
router.put('/state', validateRequest(statePreferenceSchema), updateStatePreference);
router.put('/preference', updateStudentPreference);

module.exports = router;

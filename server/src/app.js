const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const kycRoutes = require('./routes/kycRoutes');
const stateRoutes = require('./routes/stateRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const assetRoutes = require('./routes/assetRoutes');
const mcqRoutes = require('./routes/mcqRoutes');
const progressRoutes = require('./routes/progressRoutes');
const walletRoutes = require('./routes/walletRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const ebookRoutes = require('./routes/ebookRoutes');
const mlmRoutes = require('./routes/mlmRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const { globalRateLimiter } = require('./middlewares/rateLimiter');
const globalErrorHandler = require('./middlewares/errorMiddleware');
const AppError = require('./utils/appError');

const app = express();

// Security Headers
app.use(helmet());

app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));

// Global Rate Limiting
app.use('/api', globalRateLimiter);

// Body Parsing & Cookie Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// NoSQL Injection Sanitization
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/mcq', mcqRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/ebooks', ebookRoutes);
app.use('/api/mlm', mlmRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

// Unhandled Route Handler (404)
app.use((req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.originalUrl} on this server`, 404));
});

// Global Error Middleware
app.use(globalErrorHandler);

module.exports = app;

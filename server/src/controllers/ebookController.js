const Ebook = require('../models/Ebook');
const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendPaginatedSuccess } = require('../utils/apiResponse');

/**
 * @route   GET /api/ebooks
 * @desc    Fetch paginated list of active digital e-books
 * @access  Public
 */
const getAllEbooks = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = { active: true };

  const [totalRecords, ebooks] = await Promise.all([
    Ebook.countDocuments(filter),
    Ebook.find(filter)
      .populate('category', 'code title icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
  ]);

  return sendPaginatedSuccess(
    res,
    200,
    'E-books catalog fetched successfully.',
    ebooks,
    page,
    limit,
    totalRecords
  );
});

/**
 * @route   POST /api/ebooks/seed
 * @desc    Seed sample digital e-books into catalog
 * @access  Public / Admin
 */
const seedEbooks = catchAsync(async (req, res) => {
  let categories = await Category.find({}).lean();
  const catId = categories.length > 0 ? categories[0]._id : undefined;

  await Ebook.deleteMany({});

  await Ebook.insertMany([
    {
      title: 'NCERT Class 10 Physics Master Formulas & Quick Revision Book',
      author: 'Dr. Vikram Sharma',
      category: catId,
      description: 'Comprehensive formula sheet, vector shortcuts & 200+ solved numerical problems.',
      price: 199,
      coverImage: 'https://cdn.eduverse.in/covers/physics_class10_thumb.jpg',
      samplePdfUrl: 'https://cdn.eduverse.in/ebooks/samples/physics_ch1_sample.pdf',
      fullPdfUrl: 'https://cdn.eduverse.in/ebooks/full/physics_class10_complete.pdf',
      pages: 140
    },
    {
      title: 'NEET UG Biology 5000+ High-Yield MCQ Question Bank',
      author: 'Prof. Ananya Sen',
      category: catId,
      description: 'NCERT line-by-line question bank with detailed diagrams & memory trick mnemonics.',
      price: 299,
      coverImage: 'https://cdn.eduverse.in/covers/neet_bio_mcqs_thumb.jpg',
      samplePdfUrl: 'https://cdn.eduverse.in/ebooks/samples/neet_bio_sample.pdf',
      fullPdfUrl: 'https://cdn.eduverse.in/ebooks/full/neet_bio_5000mcq_complete.pdf',
      pages: 320
    }
  ]);

  const sampleEbooks = await Ebook.find({}).lean();

  return sendSuccess(res, 201, 'Sample e-books seeded successfully.', { sampleEbooks });
});

module.exports = {
  getAllEbooks,
  seedEbooks
};

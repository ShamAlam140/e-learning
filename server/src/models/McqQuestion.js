const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema(
  {
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      index: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    options: {
      type: [String],
      validate: [
        function (val) {
          return val.length === 4;
        },
        'MCQ Question must have exactly 4 options (A, B, C, D)'
      ],
      required: true
    },
    correctOption: {
      type: Number,
      enum: [0, 1, 2, 3],
      required: [true, 'Correct option index (0 to 3) is required'],
      select: false // Hidden by default during quiz delivery
    },
    explanation: {
      type: String,
      trim: true
    },
    marks: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

mcqQuestionSchema.index({ chapter: 1, createdAt: -1 });

const McqQuestion = mongoose.model('McqQuestion', mcqQuestionSchema);

module.exports = McqQuestion;

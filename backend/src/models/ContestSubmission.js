const mongoose = require('mongoose');

const contestSubmissionSchema = new mongoose.Schema({
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true,
    index: true,
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
    index: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  submittedCode: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'compile_error', 'runtime_error', 'time_limit_exceeded', 'memory_limit_exceeded'],
    default: 'pending',
    index: true,
  },
  executionTime: Number, // in ms
  memoryUsage: Number,   // in kb
  score: {
    type: Number,
    default: 0,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

contestSubmissionSchema.index({ contest: 1, student: 1, problem: 1 });

module.exports = mongoose.model('ContestSubmission', contestSubmissionSchema);

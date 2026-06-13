const mongoose = require('mongoose');

const logicBuildStatsSchema = new mongoose.Schema({
  executionTime: Number, // in ms
  memoryUsage: Number,   // in kb
  compileErrors: String,
  runtimeErrors: String,
  successRate: {
    type: Number,
    default: 0,
  },
  complexityHint: String,
  optimizationSuggestions: [String],
  codingWeakness: [String],
});

const submissionSchema = new mongoose.Schema({
  task: {
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
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  fileUrl: String,
  githubUrl: String,
  submittedCode: String,
  language: String,
  logicBuildStats: logicBuildStatsSchema,
  rating: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating',
  },
  feedback: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback',
  },
}, {
  timestamps: true,
});

submissionSchema.index({ student: 1, task: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);

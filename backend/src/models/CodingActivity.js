const mongoose = require('mongoose');

const codingActivitySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  language: {
    type: String,
    required: true,
  },
  executionTime: Number, // in ms
  memoryUsage: Number,   // in kb
  status: {
    type: String,
    enum: ['success', 'compile_error', 'runtime_error'],
    required: true,
  },
  code: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model('CodingActivity', codingActivitySchema);

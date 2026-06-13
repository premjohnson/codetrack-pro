const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
    index: true,
  },
  evaluator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Rating', ratingSchema);

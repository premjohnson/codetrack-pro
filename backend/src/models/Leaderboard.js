const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  solvedCount: {
    type: Number,
    default: 0,
  },
  streakCount: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
    index: true,
  },
  type: {
    type: String,
    enum: ['weekly', 'monthly', 'all_time'],
    default: 'all_time',
    index: true,
  },
}, {
  timestamps: true,
});

leaderboardSchema.index({ type: 1, score: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);

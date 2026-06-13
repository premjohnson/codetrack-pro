const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  iconUrl: String,
  criteria: {
    streakRequired: {
      type: Number,
      default: 0,
    },
    tasksRequired: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Badge', badgeSchema);

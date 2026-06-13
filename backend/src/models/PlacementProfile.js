const mongoose = require('mongoose');

const technicalScoreSummarySchema = new mongoose.Schema({
  averageScore: {
    type: Number,
    default: 0,
  },
  totalContests: {
    type: Number,
    default: 0,
  },
  rank: Number,
});

const placementProfileSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  resumeUrl: String,
  githubUrl: String,
  linkedInUrl: String,
  skills: [String],
  cgpa: Number,
  experience: String,
  projects: String,
  isPlaced: {
    type: Boolean,
    default: false,
    index: true,
  },
  technicalScoreSummary: technicalScoreSummarySchema,
}, {
  timestamps: true,
});

module.exports = mongoose.model('PlacementProfile', placementProfileSchema);

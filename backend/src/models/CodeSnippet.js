const mongoose = require('mongoose');

const fileSnippetSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
});

const codeSnippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  language: {
    type: String,
    required: true,
  },
  files: [fileSnippetSchema], // Multi file support!
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CodeSnippet', codeSnippetSchema);

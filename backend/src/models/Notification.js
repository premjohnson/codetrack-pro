const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'contest', 'badge'],
    default: 'info',
  },
  link: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);

const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email: email.toLowerCase() });
  }

  async incrementLoginAttempts(user) {
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return user;
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock for 1 hour after 5 failed attempts
    if (user.loginAttempts + 1 >= 5) {
      updates.$set = { lockUntil: new Date(Date.now() + 3600000) };
    }
    
    return this.model.findByIdAndUpdate(user._id, updates, { new: true });
  }

  async resetLoginAttempts(userId) {
    return this.model.findByIdAndUpdate(userId, {
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 }
    }, { new: true });
  }
}

module.exports = new UserRepository();

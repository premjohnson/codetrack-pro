const BaseRepository = require('./BaseRepository');
const OTP = require('../models/OTP');

class OTPRepository extends BaseRepository {
  constructor() {
    super(OTP);
  }

  async findLatestValidOTP(email, type) {
    return this.model.findOne({
      email: email.toLowerCase(),
      type,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
  }

  async deleteOTP(email, type) {
    return this.model.deleteMany({ email: email.toLowerCase(), type });
  }
}

module.exports = new OTPRepository();

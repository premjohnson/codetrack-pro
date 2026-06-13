const BaseRepository = require('./BaseRepository');
const Attendance = require('../models/Attendance');

class AttendanceRepository extends BaseRepository {
  constructor() {
    super(Attendance);
  }

  async markAttendance(studentId, ipAddress, userAgent) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      return await this.create({
        student: studentId,
        date: today,
        ipAddress,
        userAgent,
      });
    } catch (err) {
      if (err.code === 11000) {
        // Attendance already marked for today
        return this.model.findOne({ student: studentId, date: today });
      }
      throw err;
    }
  }

  async getAttendanceHistory(studentId) {
    return this.model.find({ student: studentId }).sort({ date: -1 });
  }
}

module.exports = new AttendanceRepository();

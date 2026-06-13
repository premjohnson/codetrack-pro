const logger = require('../config/logger');

const registerSocketHandlers = (io, socket) => {
  // Handle join room requests
  socket.on('join', (data) => {
    if (!data) return;
    const { role, userId } = data;
    if (role === 'admin') {
      socket.join('admin-room');
      logger.info(`Socket ${socket.id} joined admin-room`);
    } else if (role === 'student' && userId) {
      socket.join(`student:${userId}`);
      socket.join('students-room');
      logger.info(`Socket ${socket.id} joined student:${userId} & students-room`);
    }
  });

  // Handle contest channel subscription
  socket.on('contest:join', ({ contestId }) => {
    if (!contestId) return;
    socket.join(`contest:${contestId}`);
    logger.info(`Socket ${socket.id} joined contest room: contest:${contestId}`);
  });

  socket.on('contest:leave', ({ contestId }) => {
    if (!contestId) return;
    socket.leave(`contest:${contestId}`);
    logger.info(`Socket ${socket.id} left contest room: contest:${contestId}`);
  });

  socket.on('disconnect', () => {
    logger.info('Socket client disconnected: %s', socket.id);
  });
};

module.exports = registerSocketHandlers;

const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const SwapRequest = require('../models/SwapRequest');

module.exports = function chatSocket(io) {
  // Authenticate every socket connection using the JWT sent in the handshake
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: user ${socket.userId}`);

    // Join a room scoped to a specific swap conversation
    socket.on('joinSwap', async (swapId) => {
      try {
        const swap = await SwapRequest.findById(swapId);
        if (!swap) return socket.emit('error', 'Swap not found');
        const isParticipant = [swap.fromUser.toString(), swap.toUser.toString()].includes(
          socket.userId
        );
        if (!isParticipant) return socket.emit('error', 'Not authorized for this swap');
        socket.join(`swap:${swapId}`);
      } catch (err) {
        socket.emit('error', 'Failed to join swap room');
      }
    });

    // Send + persist a chat message
    socket.on('sendMessage', async ({ swapId, text }) => {
      try {
        if (!text || !text.trim()) return;
        const swap = await SwapRequest.findById(swapId);
        if (!swap) return socket.emit('error', 'Swap not found');
        const isParticipant = [swap.fromUser.toString(), swap.toUser.toString()].includes(
          socket.userId
        );
        if (!isParticipant) return socket.emit('error', 'Not authorized for this swap');

        const message = await Message.create({
          swapId,
          sender: socket.userId,
          text: text.trim(),
        });
        const populated = await message.populate('sender', 'name');

        io.to(`swap:${swapId}`).emit('newMessage', populated);
      } catch (err) {
        socket.emit('error', 'Failed to send message');
      }
    });

    socket.on('typing', ({ swapId, isTyping }) => {
      socket.to(`swap:${swapId}`).emit('userTyping', { userId: socket.userId, isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: user ${socket.userId}`);
    });
  });
};

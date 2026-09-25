const express = require('express');
const Message = require('../models/Message');
const SwapRequest = require('../models/SwapRequest');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/:swapId - fetch chat history for a swap
router.get('/:swapId', auth, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.swapId);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });

    const isParticipant = [swap.fromUser.toString(), swap.toUser.toString()].includes(req.userId);
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    const messages = await Message.find({ swapId: req.params.swapId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
});

module.exports = router;

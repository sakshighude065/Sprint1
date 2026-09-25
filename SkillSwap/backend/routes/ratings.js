const express = require('express');
const Rating = require('../models/Rating');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/ratings - rate the other participant after a completed swap
router.post('/', auth, async (req, res) => {
  try {
    const { swapId, score, comment } = req.body;
    if (!swapId || !score) {
      return res.status(400).json({ message: 'swapId and score are required' });
    }
    const swap = await SwapRequest.findById(swapId);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });
    if (swap.status !== 'completed') {
      return res.status(400).json({ message: 'Swap must be completed before rating' });
    }

    const participants = [swap.fromUser.toString(), swap.toUser.toString()];
    if (!participants.includes(req.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const toUser = participants.find((id) => id !== req.userId);

    const rating = await Rating.create({
      swapId,
      fromUser: req.userId,
      toUser,
      score,
      comment: comment || '',
    });

    // Recalculate the ratee's average rating
    const stats = await Rating.aggregate([
      { $match: { toUser: rating.toUser } },
      { $group: { _id: '$toUser', avg: { $avg: '$score' }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      await User.findByIdAndUpdate(toUser, {
        ratingAvg: Math.round(stats[0].avg * 10) / 10,
        ratingCount: stats[0].count,
      });
    }

    res.status(201).json({ rating });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You already rated this swap' });
    }
    res.status(500).json({ message: 'Failed to submit rating', error: err.message });
  }
});

// GET /api/ratings/:userId - list ratings received by a user
router.get('/:userId', async (req, res) => {
  try {
    const ratings = await Rating.find({ toUser: req.params.userId })
      .populate('fromUser', 'name')
      .sort({ createdAt: -1 });
    res.json({ ratings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ratings', error: err.message });
  }
});

module.exports = router;

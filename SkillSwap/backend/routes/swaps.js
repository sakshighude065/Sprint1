const express = require('express');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/swaps - send a swap request
router.post('/', auth, async (req, res) => {
  try {
    const { toUser, offeredSkill, requestedSkill, message } = req.body;
    if (!toUser || !offeredSkill || !requestedSkill) {
      return res.status(400).json({ message: 'toUser, offeredSkill and requestedSkill are required' });
    }
    if (toUser === req.userId) {
      return res.status(400).json({ message: "You can't send a swap request to yourself" });
    }
    const swap = await SwapRequest.create({
      fromUser: req.userId,
      toUser,
      offeredSkill,
      requestedSkill,
      message: message || '',
    });
    const populated = await swap.populate(['fromUser', 'toUser']);
    res.status(201).json({ swap: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create swap request', error: err.message });
  }
});

// GET /api/swaps - list swaps involving me (incoming + outgoing)
router.get('/', auth, async (req, res) => {
  try {
    const swaps = await SwapRequest.find({
      $or: [{ fromUser: req.userId }, { toUser: req.userId }],
    })
      .populate('fromUser', 'name email ratingAvg')
      .populate('toUser', 'name email ratingAvg')
      .sort({ createdAt: -1 });
    res.json({ swaps });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch swaps', error: err.message });
  }
});

// PUT /api/swaps/:id - update status (accept/reject/cancel/complete)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['accepted', 'rejected', 'cancelled', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of ${allowed.join(', ')}` });
    }
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found' });

    const isParticipant = [swap.fromUser.toString(), swap.toUser.toString()].includes(req.userId);
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    // Only the recipient can accept/reject; either party can cancel/complete
    if ((status === 'accepted' || status === 'rejected') && swap.toUser.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the recipient can accept or reject this request' });
    }

    const wasAlreadyCompleted = swap.status === 'completed';
    swap.status = status;
    await swap.save();

    // Bump both participants' swapsCompleted counter (drives the streak
    // badge on the board) the first time a swap is marked completed.
    if (status === 'completed' && !wasAlreadyCompleted) {
      await User.updateMany(
        { _id: { $in: [swap.fromUser, swap.toUser] } },
        { $inc: { swapsCompleted: 1 } }
      );
    }

    const populated = await swap.populate(['fromUser', 'toUser']);
    res.json({ swap: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update swap request', error: err.message });
  }
});

// PUT /api/swaps/:id/schedule - propose/set a date+time for the swap
router.put('/:id/schedule', auth, async (req, res) => {
  try {
    const { scheduledAt } = req.body;
    if (!scheduledAt) return res.status(400).json({ message: 'scheduledAt is required' });

    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found' });

    const isParticipant = [swap.fromUser.toString(), swap.toUser.toString()].includes(req.userId);
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    swap.scheduledAt = new Date(scheduledAt);
    await swap.save();
    const populated = await swap.populate(['fromUser', 'toUser']);
    res.json({ swap: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to schedule swap', error: err.message });
  }
});

module.exports = router;

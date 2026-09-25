const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users - public board listing (no auth). Supports ?search= and
// ?category= (matches the CATEGORY_MAP computed per-user on the model).
router.get('/', async (req, res) => {
  try {
    const { search, category, limit } = req.query;
    const query = { isPinned: true };
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ teachSkills: regex }, { learnSkills: regex }, { name: regex }];
    }
    const cap = Math.min(parseInt(limit, 10) || 24, 60);
    let users = await User.find(query).sort({ createdAt: -1 }).limit(cap);
    let mapped = users.map((u) => u.toPublicJSON());
    if (category && category !== 'all') {
      mapped = mapped.filter((u) => u.categories.includes(category));
    }
    res.json({ users: mapped });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// GET /api/users/:id - view any user's public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

// PUT /api/users/me - update own profile / skills / pin-to-board visibility
router.put('/me', auth, async (req, res) => {
  try {
    const { name, bio, teachSkills, learnSkills, isPinned } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (teachSkills !== undefined) update.teachSkills = teachSkills;
    if (learnSkills !== undefined) update.learnSkills = learnSkills;
    if (isPinned !== undefined) update.isPinned = isPinned;

    const user = await User.findByIdAndUpdate(req.userId, update, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
});

module.exports = router;

const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/matches - find users who complement my teach/learn skills.
// Mutual matches (they teach what I want to learn AND want to learn what I
// teach) are ranked first and flagged so the frontend can show a badge.
router.get('/', auth, async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    if (!me) return res.status(404).json({ message: 'User not found' });

    if (me.teachSkills.length === 0 && me.learnSkills.length === 0) {
      return res.json({ matches: [] });
    }

    const candidates = await User.find({
      _id: { $ne: me._id },
      isPinned: true,
      $or: [
        { teachSkills: { $in: me.learnSkills } },
        { learnSkills: { $in: me.teachSkills } },
      ],
    });

    const mySet = {
      teach: new Set(me.teachSkills),
      learn: new Set(me.learnSkills),
    };

    const scored = candidates.map((candidate) => {
      const theyTeachIWantToLearn = candidate.teachSkills.filter((s) => mySet.learn.has(s));
      const theyWantToLearnIWantTeach = candidate.learnSkills.filter((s) => mySet.teach.has(s));

      const isMutual = theyTeachIWantToLearn.length > 0 && theyWantToLearnIWantTeach.length > 0;
      const score = theyTeachIWantToLearn.length * 2 + theyWantToLearnIWantTeach.length * 2 + (isMutual ? 5 : 0);

      return {
        user: candidate.toPublicJSON(),
        matchType: isMutual ? 'mutual' : 'partial',
        theyCanTeachYou: theyTeachIWantToLearn,
        theyWantToLearnFromYou: theyWantToLearnIWantTeach,
        score,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    res.json({ matches: scored });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute matches', error: err.message });
  }
});

module.exports = router;

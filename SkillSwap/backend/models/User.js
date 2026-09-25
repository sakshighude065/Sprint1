const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Skill -> category map used for the board's filter pills. Kept simple and
// server-side so the frontend doesn't have to duplicate this logic.
const CATEGORY_MAP = {
  html: 'code', css: 'code', javascript: 'code', python: 'code', sql: 'code',
  'data basics': 'code', react: 'code',
  guitar: 'music', piano: 'music', 'music theory': 'music', singing: 'music',
  spanish: 'language', french: 'language', german: 'language', english: 'language',
  photography: 'media', 'video editing': 'media', design: 'media', illustration: 'media',
  chess: 'games', strategy: 'games', poker: 'games',
};

function categoriesForSkills(skills = []) {
  const cats = new Set();
  skills.forEach((s) => {
    const cat = CATEGORY_MAP[s.toLowerCase()];
    if (cat) cats.add(cat);
  });
  return Array.from(cats);
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    bio: { type: String, default: '', maxlength: 500 },
    teachSkills: [{ type: String, trim: true, lowercase: true }],
    learnSkills: [{ type: String, trim: true, lowercase: true }],
    // Whether this profile is publicly browsable / matchable on the board.
    isPinned: { type: Boolean, default: true },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    swapsCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    bio: this.bio,
    teachSkills: this.teachSkills,
    learnSkills: this.learnSkills,
    isPinned: this.isPinned,
    ratingAvg: this.ratingAvg,
    ratingCount: this.ratingCount,
    swapsCompleted: this.swapsCompleted,
    categories: categoriesForSkills([...this.teachSkills, ...this.learnSkills]),
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);

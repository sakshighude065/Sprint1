// Seeds the database with the same demo people used throughout the design
// (Riya, Arjun, Meera, etc.) so Matches / the public board aren't empty on
// a fresh install. Safe to re-run — it clears only these seed accounts
// first (matched by email), never touches real user accounts.
//
// Usage:  node seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const DEMO_USERS = [
  {
    name: 'Riya S.',
    email: 'riya@demo.skillswap',
    password: 'password123',
    bio: 'Backend developer by day, always tinkering with side projects. Happy to pair on real code, not just theory.',
    teachSkills: ['python', 'data basics', 'sql'],
    learnSkills: ['guitar'],
    ratingAvg: 4.9,
    ratingCount: 12,
    swapsCompleted: 12,
  },
  {
    name: 'Arjun K.',
    email: 'arjun@demo.skillswap',
    password: 'password123',
    bio: "Been playing guitar for 10 years, mostly self-taught. Can help you go from zero to your first song.",
    teachSkills: ['guitar', 'music theory'],
    learnSkills: ['spanish'],
    ratingAvg: 5.0,
    ratingCount: 7,
    swapsCompleted: 7,
  },
  {
    name: 'Meera T.',
    email: 'meera@demo.skillswap',
    password: 'password123',
    bio: 'Native Spanish speaker, also love cooking. Lessons usually turn into a chat about food.',
    teachSkills: ['spanish', 'cooking'],
    learnSkills: ['python'],
    ratingAvg: 4.8,
    ratingCount: 20,
    swapsCompleted: 20,
  },
  {
    name: 'Devansh P.',
    email: 'devansh@demo.skillswap',
    password: 'password123',
    bio: 'Freelance photographer. I can teach you composition and lighting basics in a weekend.',
    teachSkills: ['photography'],
    learnSkills: ['video editing'],
    ratingAvg: 4.7,
    ratingCount: 5,
    swapsCompleted: 5,
  },
  {
    name: 'Sana W.',
    email: 'sana@demo.skillswap',
    password: 'password123',
    bio: 'Edit videos for a living. Premiere, DaVinci, all of it. Trading edits for photo tips.',
    teachSkills: ['video editing'],
    learnSkills: ['photography'],
    ratingAvg: 5.0,
    ratingCount: 14,
    swapsCompleted: 14,
  },
  {
    name: 'Karan B.',
    email: 'karan@demo.skillswap',
    password: 'password123',
    bio: 'Club-level chess player. I break down openings and endgames in plain language.',
    teachSkills: ['chess', 'strategy'],
    learnSkills: ['html', 'css'],
    ratingAvg: 4.9,
    ratingCount: 9,
    swapsCompleted: 9,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const emails = DEMO_USERS.map((u) => u.email);
  await User.deleteMany({ email: { $in: emails } });
  console.log('Cleared any existing demo accounts.');

  // Insert one at a time so the pre-save bcrypt hook runs for each
  // (insertMany skips document middleware by default).
  for (const demoUser of DEMO_USERS) {
    await User.create(demoUser);
    console.log(`Created ${demoUser.name} (${demoUser.email})`);
  }

  console.log(`\nDone — ${DEMO_USERS.length} demo users added.`);
  console.log('All demo accounts use the password: password123');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

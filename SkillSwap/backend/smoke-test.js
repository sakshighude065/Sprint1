require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { io: ioClient } = require('socket.io-client');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/matches');
const swapRoutes = require('./routes/swaps');
const messageRoutes = require('./routes/messages');
const ratingRoutes = require('./routes/ratings');
const chatSocket = require('./socket/chatSocket');

async function main() {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  console.log('✓ Connected to in-memory MongoDB');

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/matches', matchRoutes);
  app.use('/api/swaps', swapRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/ratings', ratingRoutes);

  const server = http.createServer(app);
  const io = new Server(server);
  chatSocket(io);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  console.log(`✓ Server listening on ${port}`);

  const req = async (method, path, body, token) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  // 1. Register two users, one with skills (goes straight to board), one without (onboarding)
  const riya = await req('POST', '/api/auth/register', {
    name: 'Riya S.',
    email: 'riya@test.com',
    password: 'password123',
    teachSkills: ['python'],
    learnSkills: ['guitar'],
  });
  console.assert(riya.status === 201, 'Riya register failed: ' + JSON.stringify(riya.data));
  console.assert(riya.data.needsOnboarding === false, 'Riya should not need onboarding');
  console.log('✓ Registered Riya (with skills, no onboarding needed)');

  const arjun = await req('POST', '/api/auth/register', {
    name: 'Arjun K.',
    email: 'arjun@test.com',
    password: 'password123',
    teachSkills: ['guitar'],
    learnSkills: ['python'],
  });
  console.assert(arjun.status === 201, 'Arjun register failed: ' + JSON.stringify(arjun.data));
  console.log('✓ Registered Arjun (mutual match candidate)');

  const noSkills = await req('POST', '/api/auth/register', {
    name: 'NoSkills Guy',
    email: 'noskills@test.com',
    password: 'password123',
  });
  console.assert(noSkills.data.needsOnboarding === true, 'NoSkills should need onboarding');
  console.log('✓ User with no skills correctly flagged needsOnboarding=true');

  const riyaToken = riya.data.token;
  const arjunToken = arjun.data.token;

  // 2. Duplicate email should fail
  const dupe = await req('POST', '/api/auth/register', {
    name: 'Dupe', email: 'riya@test.com', password: 'password123',
  });
  console.assert(dupe.status === 409, 'Duplicate email should 409, got ' + dupe.status);
  console.log('✓ Duplicate email rejected');

  // 3. Login
  const login = await req('POST', '/api/auth/login', { email: 'riya@test.com', password: 'password123' });
  console.assert(login.status === 200 && login.data.token, 'Login failed: ' + JSON.stringify(login.data));
  console.log('✓ Login works');

  // 4. Wrong password
  const badLogin = await req('POST', '/api/auth/login', { email: 'riya@test.com', password: 'wrong' });
  console.assert(badLogin.status === 401, 'Bad login should 401, got ' + badLogin.status);
  console.log('✓ Wrong password rejected');

  // 5. Public users listing (board) - only pinned users show
  const board = await req('GET', '/api/users');
  console.assert(board.data.users.length === 3, 'Expected 3 pinned users, got ' + board.data.users.length);
  console.log('✓ Public board listing returns pinned users:', board.data.users.map(u => u.name).join(', '));

  // 6. Category filter (guitar/python -> code/music categories)
  const codeFiltered = await req('GET', '/api/users?category=code');
  console.assert(codeFiltered.data.users.some(u => u.name === 'Riya S.'), 'Riya should appear under code category');
  console.log('✓ Category filter works');

  // 7. Matches - Riya should see Arjun as a mutual match
  const matches = await req('GET', '/api/matches', null, riyaToken);
  console.assert(matches.status === 200, 'Matches failed: ' + JSON.stringify(matches.data));
  const arjunMatch = matches.data.matches.find(m => m.user.name === 'Arjun K.');
  console.assert(arjunMatch, 'Arjun should appear in Riya matches');
  console.assert(arjunMatch.matchType === 'mutual', 'Arjun should be a mutual match, got ' + arjunMatch?.matchType);
  console.log('✓ Mutual match detected correctly:', arjunMatch.matchType);

  // 8. Send swap request Riya -> Arjun
  const swapCreate = await req('POST', '/api/swaps', {
    toUser: arjun.data.user.id,
    offeredSkill: 'python',
    requestedSkill: 'guitar',
    message: 'Excited to learn!',
  }, riyaToken);
  console.assert(swapCreate.status === 201, 'Swap create failed: ' + JSON.stringify(swapCreate.data));
  const swapId = swapCreate.data.swap._id;
  console.log('✓ Swap request created:', swapId);

  // 9. Only recipient (Arjun) can accept
  const badAccept = await req('PUT', `/api/swaps/${swapId}`, { status: 'accepted' }, riyaToken);
  console.assert(badAccept.status === 403, 'Riya should not be able to accept her own request, got ' + badAccept.status);
  console.log('✓ Only recipient can accept (sender blocked correctly)');

  const accept = await req('PUT', `/api/swaps/${swapId}`, { status: 'accepted' }, arjunToken);
  console.assert(accept.status === 200 && accept.data.swap.status === 'accepted', 'Accept failed: ' + JSON.stringify(accept.data));
  console.log('✓ Arjun accepted the swap');

  // 10. Schedule it
  const schedule = await req('PUT', `/api/swaps/${swapId}/schedule`, { scheduledAt: '2026-09-15T17:00:00Z' }, riyaToken);
  console.assert(schedule.status === 200 && schedule.data.swap.scheduledAt, 'Schedule failed: ' + JSON.stringify(schedule.data));
  console.log('✓ Swap scheduled');

  // 11. Chat via socket.io
  const socketRiya = ioClient(base, { auth: { token: riyaToken } });
  const socketArjun = ioClient(base, { auth: { token: arjunToken } });
  await new Promise((resolve, reject) => {
    let connected = 0;
    const done = () => { connected++; if (connected === 2) resolve(); };
    socketRiya.on('connect', done);
    socketArjun.on('connect', done);
    socketRiya.on('connect_error', reject);
    socketArjun.on('connect_error', reject);
  });
  socketRiya.emit('joinSwap', swapId);
  socketArjun.emit('joinSwap', swapId);
  await new Promise((r) => setTimeout(r, 200));

  const messageReceived = new Promise((resolve) => {
    socketArjun.on('newMessage', (msg) => resolve(msg));
  });
  socketRiya.emit('sendMessage', { swapId, text: 'Hi! Ready for Tuesday?' });
  const received = await messageReceived;
  console.assert(received.text === 'Hi! Ready for Tuesday?', 'Message content mismatch');
  console.log('✓ Real-time chat message delivered via Socket.io:', received.text);
  socketRiya.close();
  socketArjun.close();

  // 12. Message history persisted
  const history = await req('GET', `/api/messages/${swapId}`, null, riyaToken);
  console.assert(history.data.messages.length === 1, 'Expected 1 persisted message, got ' + history.data.messages.length);
  console.log('✓ Chat message persisted to database');

  // 13. Mark completed + swapsCompleted counter increments
  const complete = await req('PUT', `/api/swaps/${swapId}`, { status: 'completed' }, riyaToken);
  console.assert(complete.status === 200, 'Complete failed: ' + JSON.stringify(complete.data));
  const riyaAfter = await req('GET', '/api/auth/me', null, riyaToken);
  console.assert(riyaAfter.data.user.swapsCompleted === 1, 'Riya swapsCompleted should be 1, got ' + riyaAfter.data.user.swapsCompleted);
  console.log('✓ swapsCompleted counter incremented for streak badge:', riyaAfter.data.user.swapsCompleted);

  // 14. Rate the swap
  const rate = await req('POST', '/api/ratings', { swapId, score: 5, comment: 'Great teacher!' }, riyaToken);
  console.assert(rate.status === 201, 'Rating failed: ' + JSON.stringify(rate.data));
  const arjunAfterRating = await req('GET', `/api/users/${arjun.data.user.id}`);
  console.assert(arjunAfterRating.data.user.ratingAvg === 5, 'Arjun ratingAvg should be 5, got ' + arjunAfterRating.data.user.ratingAvg);
  console.log('✓ Rating submitted and average recalculated:', arjunAfterRating.data.user.ratingAvg);

  // 15. Duplicate rating blocked
  const dupeRate = await req('POST', '/api/ratings', { swapId, score: 3 }, riyaToken);
  console.assert(dupeRate.status === 409, 'Duplicate rating should 409, got ' + dupeRate.status);
  console.log('✓ Duplicate rating on same swap blocked');

  // 16. Pin-to-board toggle: unpin, confirm disappears from board and matches
  await req('PUT', '/api/users/me', { isPinned: false }, arjunToken);
  const boardAfterUnpin = await req('GET', '/api/users');
  console.assert(!boardAfterUnpin.data.users.some(u => u.name === 'Arjun K.'), 'Arjun should be hidden after unpinning');
  console.log('✓ Unpinning removes user from public board');

  console.log('\n🎉 ALL SMOKE TESTS PASSED');

  await mongoose.disconnect();
  await mongod.stop();
  server.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ SMOKE TEST FAILED:', err);
  process.exit(1);
});

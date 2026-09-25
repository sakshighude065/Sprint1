const mongoose = require('mongoose');

const SwapRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Skill fromUser will TEACH toUser
    offeredSkill: { type: String, required: true, trim: true, lowercase: true },
    // Skill fromUser wants to LEARN from toUser
    requestedSkill: { type: String, required: true, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    scheduledAt: { type: Date, default: null },
    message: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

SwapRequestSchema.index({ fromUser: 1, toUser: 1, status: 1 });

module.exports = mongoose.model('SwapRequest', SwapRequestSchema);

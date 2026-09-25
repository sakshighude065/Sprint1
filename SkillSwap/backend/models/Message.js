const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    swapId: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

MessageSchema.index({ swapId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);

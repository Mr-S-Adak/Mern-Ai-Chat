const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      default: "New Chat",
    },
  },
  {
    timestamps: true,
  },
);

// Useful for retrieving a user's conversations sorted by latest activity
conversationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);

const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { generateAIResponse } = require("../services/aiService");

// Get messages for a conversation
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    // Check conversation ownership
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// Send user message and generate AI response
const createUserMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    // Validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    // Validate message
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const cleanContent = content.trim();

    // Check conversation ownership
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check how many messages existed before this message
    const existingMessageCount = await Message.countDocuments({
      conversationId: conversation._id,
    });

    // Save user message
    const userMessage = await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: cleanContent,
    });

    // Automatically create title from first user message
    if (
      existingMessageCount === 0 &&
      (!conversation.title || conversation.title === "New Chat")
    ) {
      conversation.title = cleanContent.substring(0, 60);

      if (cleanContent.length > 60) {
        conversation.title += "...";
      }
    }

    // Get complete conversation history
    const history = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: 1 })
      .lean();

    // Generate AI response
    const aiResponse = await generateAIResponse(history);

    // Validate AI response
    if (!aiResponse || !aiResponse.trim()) {
      return res.status(502).json({
        success: false,
        message: "AI returned an empty response",
        userMessage,
      });
    }

    // Save AI response
    const assistantMessage = await Message.create({
      conversationId: conversation._id,
      role: "assistant",
      content: aiResponse.trim(),
    });

    // Update conversation activity
    conversation.updatedAt = new Date();
    await conversation.save();

    // Return both messages
    res.status(201).json({
      success: true,
      userMessage,
      assistantMessage,
      conversation,
    });
  } catch (error) {
    console.error("AI message error:", error);

    next(error);
  }
};

module.exports = {
  getMessages,
  createUserMessage,
};

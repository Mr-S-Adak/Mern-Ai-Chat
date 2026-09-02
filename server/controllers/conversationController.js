const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// Create a new conversation
const createConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.create({
      userId: req.user.userId,
      title: "New Chat",
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// Get all conversations belonging to logged-in user
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      userId: req.user.userId,
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

// Get one conversation
const getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

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

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// Rename conversation
const renameConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Conversation title is required",
      });
    }

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        userId: req.user.userId,
      },
      {
        title: title.trim().substring(0, 200),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversation renamed successfully",
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// Delete conversation and its messages
const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      userId: req.user.userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    await Message.deleteMany({
      conversationId: conversation._id,
    });

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversation,
  renameConversation,
  deleteConversation,
};

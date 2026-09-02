const express = require("express");

const {
  getMessages,
  createUserMessage,
} = require("../controllers/messageController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/:conversationId", getMessages);

router.post("/:conversationId", createUserMessage);

module.exports = router;

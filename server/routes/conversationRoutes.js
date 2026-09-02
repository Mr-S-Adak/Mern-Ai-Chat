const express = require("express");

const {
  createConversation,
  getConversations,
  getConversation,
  renameConversation,
  deleteConversation,
} = require("../controllers/conversationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createConversation);
router.get("/", getConversations);
router.get("/:conversationId", getConversation);
router.patch("/:conversationId", renameConversation);
router.delete("/:conversationId", deleteConversation);

module.exports = router;

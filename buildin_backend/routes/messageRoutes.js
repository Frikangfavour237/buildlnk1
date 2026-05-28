const express = require("express");
const router = express.Router();

// SEND MESSAGE
router.post("/", (req, res) => {
  const { senderId, receiverId, message } = req.body;

  res.status(201).json({
    message: "Message sent",
    senderId,
    receiverId,
  });
});

// GET MESSAGES
router.get("/:userId", (req, res) => {
  res.json({
    message: "Messages fetched",
    userId: req.params.userId,
    messages: [],
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();

// GET NOTIFICATIONS
router.get("/:userId", (req, res) => {
  res.json({
    message: "Notifications fetched",
    userId: req.params.userId,
    notifications: [],
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();

// GET ALL WORKERS
router.get("/", (req, res) => {
  res.json({
    message: "Workers fetched successfully",
    workers: [],
  });
});

// UPDATE WORKER
router.put("/:id", (req, res) => {
  res.json({
    message: "Worker updated",
    workerId: req.params.id,
  });
});

module.exports = router;

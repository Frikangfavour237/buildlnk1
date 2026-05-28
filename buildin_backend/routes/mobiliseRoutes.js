const express = require("express");
const router = express.Router();

// SEND MOBILISATION REQUEST
router.post("/", (req, res) => {
  const { workerId, projectId } = req.body;

  res.status(201).json({
    message: "Mobilisation request sent",
    workerId,
    projectId,
    status: "pending",
  });
});

// ACCEPT / REJECT
router.put("/:id", (req, res) => {
  const { status } = req.body;

  res.json({
    message: `Mobilisation ${status}`,
    mobilisationId: req.params.id,
  });
});

module.exports = router;

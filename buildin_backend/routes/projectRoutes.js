const express = require("express");
const router = express.Router();

// CREATE PROJECT
router.post("/", (req, res) => {
  const { title, description, location } = req.body;

  res.status(201).json({
    message: "Project created successfully",
    project: { title, description, location },
  });
});

// GET PROJECTS
router.get("/", (req, res) => {
  res.json({
    message: "All projects fetched",
    projects: [],
  });
});

module.exports = router;

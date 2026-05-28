const express = require("express");
const router = express.Router();

// REGISTER
router.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email and password are required" });
  }

  res.status(201).json({
    message: "User registered successfully",
    user: { name, email, role },
  });
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  res.json({
    message: "Login successful",
    token: "dummy-token-123",
    user: { email },
  });
});

// RESET PASSWORD
router.post("/reset-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  res.json({
    message: "If this email exists, a reset link has been sent",
  });
});

// GET PROFILE (protected — dummy token check)
router.get("/profile", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: no token provided" });
  }

  res.json({
    message: "Profile fetched successfully",
    user: {
      uid: "dummy-uid-123",
      name: "Jean Mbarga",
      email: "jean@company.cm",
      role: "worker",
    },
  });
});

module.exports = router;

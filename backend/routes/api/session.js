const express = require("express");
const { login } = require("../../services/auth.server");
const { validateLogin } = require("../../services/validtors.server.js");
const router = express.Router();

router.post("/", validateLogin, login);

router.delete("/", (_req, res) => {
  res.clearCookie("token");
  return res.json({ message: "success" });
});

router.get("/", (req, res) => {
  const { user } = req;
  if (user) {
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    return res.json({
      user: safeUser,
    });
  } else return res.json({ user: null });
});

module.exports = router;

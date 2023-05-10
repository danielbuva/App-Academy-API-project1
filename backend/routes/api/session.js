const express = require("express");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const {
  setTokenCookie,
  restoreUser,
} = require("../../services/auth.server");
const { User } = require("../../db/models");
const router = express.Router();

router.post("/", async (req, res, next) => {
  const { credential, password } = req.body;

  const data = await User.unscoped().findOne({
    where: {
      [Op.or]: {
        username: credential,
        email: credential,
      },
    },
  });

  if (
    !data ||
    !bcrypt.compareSync(password, data.hashedPassword.toString())
  ) {
    const err = new Error("Login failed");
    err.status = 401;
    err.title = "Login failed";
    err.errors = { credential: "The provided credentials were invalid." };
    return next(err);
  }

  const user = {
    id: data.id,
    email: data.email,
    username: data.username,
  };

  setTokenCookie(res, user);

  return res.json({ user });
});

router.delete("/", (_req, res) => {
  res.clearCookie("token");
  return res.json({ message: "success" });
});

module.exports = router;

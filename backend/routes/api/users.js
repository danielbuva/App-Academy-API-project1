const router = require("express").Router();
const bcrypt = require("bcryptjs");
const {
  setTokenCookie,
  requireAuth,
} = require("../../services/auth.server");
const { User } = require("../../db/models");

router.post("/", async (req, res) => {
  const { email, password, username } = req.body;
  const hashedPassword = bcrypt.hashSync(password);
  const user = await User.create({ email, username, hashedPassword });

  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  setTokenCookie(res, safeUser);

  return res.json({
    user: safeUser,
  });
});

module.exports = router;

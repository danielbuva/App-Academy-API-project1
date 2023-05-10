const {
  restoreCsrf,
  restoreSession,
  verifyAuth,
} = require("../../services/auth.server");
const sessionRouter = require("./session.js");
const usersRouter = require("./users.js");
const router = require("express").Router();

const returnUser = (req, res) => {
  return res.json(req.user);
};

router.use(restoreSession);
router.use("/session", sessionRouter);
router.use("/users", usersRouter);

router.get("/require-auth", verifyAuth, returnUser);

router.get("/csrf/restore", restoreCsrf);

router.post("/test", function (req, res) {
  res.json({ requestBody: req.body });
});

module.exports = router;

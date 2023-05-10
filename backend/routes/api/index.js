const {
  setTokenCookie,
  restoreCsrf,
  restoreSession,
  verifyAuth,
} = require("../../services/auth.server");
const router = require("express").Router();

const returnUser = (req, res) => {
  return res.json(req.user);
};

router.use(restoreSession);

router.get("/csrf/restore", restoreCsrf);
router.get("/set-token-cookie", setTokenCookie);
router.get("/require-auth", verifyAuth, returnUser);

router.post("/test", function (req, res) {
  res.json({ requestBody: req.body });
});

module.exports = router;

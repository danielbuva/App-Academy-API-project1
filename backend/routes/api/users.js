const { validateSignup } = require("../../services/validtors.server");
const { signup } = require("../../services/auth.server");
const router = require("express").Router();

router.post("/", validateSignup, signup);

module.exports = router;

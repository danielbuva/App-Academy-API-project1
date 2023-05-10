const jwt = require("jsonwebtoken");
const { jwtConfig, isProduction } = require("../config");
const { User } = require("../db/models");
const { secret, expiresIn } = jwtConfig;

const setTokenCookie = (res, data) => {
  const user = {
    id: data.id,
    email: data.email,
    username: data.username,
  };

  const token = jwt.sign(
    { data: user },
    secret,
    { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
  );

  res.cookie("token", token, {
    maxAge: expiresIn * 1000, // in milliseconds
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
  });

  return token;
};

const restoreSession = (req, res, next) => {
  const { token } = req.cookies;
  req.user = null;

  return jwt.verify(token, secret, null, async (err, jwtPayload) => {
    if (err) {
      return next();
    }

    try {
      const { id } = jwtPayload.data;
      req.user = await User.findByPk(id, {
        attributes: {
          include: ["email", "createdAt", "updatedAt"],
        },
      });
    } catch (e) {
      res.clearCookie("token");
      return next();
    }

    if (!req.user) res.clearCookie("token");

    return next();
  });
};

const verifyAuth = (req, _, next) => {
  if (req.user) return next();

  const err = new Error("Authentication required");
  err.title = "Authentication required";
  err.errors = { message: "Authentication required" };
  err.status = 401;
  return next(err);
};

const restoreCsrf = (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200).json({
    "XSRF-Token": csrfToken,
  });
};

module.exports = {
  setTokenCookie,
  restoreSession,
  verifyAuth,
  restoreCsrf,
};

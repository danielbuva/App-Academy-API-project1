const {
  notFoundHandler,
  sqlValidationHandler,
  errorFormatter,
} = require("./services/error.server.js");
const cookieParser = require("cookie-parser");
const { isProduction } = require("./config");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
require("express-async-errors");
const csurf = require("csurf");
const cors = require("cors");
const routes = require("./routes");

const app = express();

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(routes);

if (!isProduction) {
  app.use(cors());
}

app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);

app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true,
    },
  })
);

app.get("/", (_, res) => {
  res.json("ola mundo");
});

app.use(notFoundHandler);
app.use(sqlValidationHandler);
app.use(errorFormatter);

module.exports = app;

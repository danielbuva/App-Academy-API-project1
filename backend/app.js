const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const csurf = require("csurf");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { environment } = require("./config");
const isProduction = environment === "production";
const app = express();
const routes = require("./routes");
const {
  notFoundHandler,
  sqlValidationHandler,
  errorFormatter,
} = require("./services/error.server.js");

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

app.get("/", (req, res) => {
  res.json("ola mundo");
});

app.use(notFoundHandler);
app.use(sqlValidationHandler);
app.use(errorFormatter);

module.exports = app;

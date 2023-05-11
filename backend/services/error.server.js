const { ValidationError } = require("sequelize");

const { isProduction } = require("../config");

const notFoundHandler = (_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;
  next(err);
};

const sqlValidationHandler = (err, _req, _res, next) => {
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = "Validation error";
    err.errors = errors;
  }
  next(err);
};

const errorFormatter = (err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);
  res.json({
    title: err.title || "Server Error",
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack,
  });
};

const invariant = (condition, message, next) => {
  if (!condition) {
    next({ status: 404, title: "Resource Not Found", message });
  }
};

module.exports = {
  notFoundHandler,
  sqlValidationHandler,
  errorFormatter,
  invariant,
};

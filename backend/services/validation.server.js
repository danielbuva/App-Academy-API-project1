const { validationResult } = require("express-validator");
const { Event, Membership } = require("../db/models");
const { invariant } = require("./error.server");
const { Op } = require("sequelize");

const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors
      .array()
      .forEach((error) => (errors[error.param] = error.msg));

    const err = Error("Bad request.");
    err.errors = errors;
    err.status = 400;
    err.title = "Bad request.";
    next(err);
  }
  next();
};

const validateGroup = (
  { name, about, type, private, city, state },
  _,
  next
) => {
  let errorResult = { errors: {}, message: "Bad Request", status: 400 };
  if (name.length > 60) {
    errorResult.errors.name = "Name must be 60 characters or less";
  }
  if (about.length > 50) {
    errorResult.errors.about = "About must be 50 characters or more";
  }
  if (type !== "Online" || type !== "In person") {
    errorResult.errors.type = "Type must be 'Online' or 'In person'";
  }
  if (typeof private !== "boolean") {
    errorResult.errors.private = "Private must be a boolean";
  }
  if (!city) {
    errorResult.errors.city = "City is required";
  }
  if (!state) {
    errorResult.errors.state = "State is required";
  }
  if (Object.keys(errors).length > 0) {
    next(errorResult);
  }

  next();
};

const validateVenue = ({ address, city, state, lat, lng }, _, next) => {
  let errorResult = { errors: {}, message: "Bad Request", status: 400 };
  if (!address) {
    errorResult.errors.address = "Street address is required";
  }
  if (!city) {
    errorResult.errors.city = "City is required";
  }
  if (!state) {
    errorResult.errors.state = "State is required";
  }
  if (isNaN(parseInt(lat))) {
    errorResult.errors.lat = "Latitude is not valid";
  }
  if (isNaN(parseInt(lng))) {
    errorResult.errors.lng = "Longitude is not valid";
  }
  if (Object.keys(errors).length > 0) {
    next(errorResult);
  }

  next();
};

const validateEvent = (
  {
    venueId,
    name,
    type,
    capacity,
    price,
    description,
    startDate,
    endDate,
  },
  _,
  next
) => {
  let errorResult = { errors: {}, message: "Bad Request", status: 400 };
  if (!venueId) {
    errorResult.errors.venueId = "Venue does not exist";
  }
  if (name.length < 5) {
    errorResult.errors.name = "Name must be at least 5 characters";
  }
  if (type !== "Online" || type !== "In person") {
    errorResult.errors.type = "Type must be Online or In person";
  }
  if (isNaN(parseInt(capacity))) {
    errorResult.errors.capacity = "Capacity must be an integer";
  }
  if (isNaN(parseInt(price))) {
    errorResult.errors.price = "Price is invalid";
  }
  if (!description) {
    errorResult.errors.description = "description is required";
  }
  if (startDate > new Date()) {
    errorResult.errors.startDate = "Start date must be in the future";
  }
  if (endDate < startDate) {
    errorResult.errors.endDate = "End date is less than start date";
  }
  if (Object.keys(errors).length > 0) {
    next(errorResult);
  }

  next();
};

const validateRole = async (req, _, next) => {
  const userId = req.user.id;
  const { groupId } = req.params;

  const role = await Membership.findOne({
    attribute: ["status"],
    where: { userId, groupId },
  });

  const hasValidRole = role.status === "co-host" || role.status === "host";

  invariant(hasValidRole, "Group couldn't be found", next);

  next();
};

const validateEventRole = async (req, _, next) => {
  const event = await Event.findByPk(req.params.eventId);
  invariant(event, "Event couldn't be found", next);

  req.event = event;

  const role = await Membership.findOne({
    attribute: ["status"],
    where: { userId: req.user.id, groupId: event.groupId },
  });

  const hasValidRole = role.status === "co-host" || role.status === "host";

  invariant(hasValidRole, "Event couldn't be found", next);

  req.user.status = hasValidRole ? role.status : null;

  next();
};

const addHostStatus = async (req, _, next) => {
  const event = await Event.findByPk(req.params.eventId);
  invariant(event, "Event couldn't be found", next);

  const role = await Membership.findOne({
    attribute: ["status"],
    where: { userId: req.user.id, groupId: event.groupId },
  });

  const hasValidRole = role.status === "co-host" || role.status === "host";

  req.user.status = hasValidRole ? role.status : null;

  next();
};

const addUserStatus = async (req, _, next) => {
  const event = await Event.findByPk(req.params.eventId);
  invariant(event, "Event couldn't be found", next);

  const role = await Membership.findOne({
    attribute: ["status"],
    where: { userId: req.user.id, groupId: event.groupId },
  });
  invariant(role && role !== "pending", "Event couldn't be found");

  req.user.status = role.status;

  next();
};

const getLeadershipRole = async (req, next) => {
  const userId = req.user.id;
  const { groupId } = req.params;

  const role = await Membership.findOne({
    attributes: ["status"],
    where: { userId, groupId },
  });

  const hasValidRole = role.status === "co-host" || role.status === "host";

  invariant(hasValidRole, "Group couldn't be found", next);

  return role.status;
};

const validateQuery = ({ page, size, name, type, startDate }) => {
  let errorResult = { errors: {}, message: "Bad Request", status: 400 };
  if ((page && page < 1) || page > 10) {
    errorResult.errors.page = "Page must be greater than or equal to 1";
  }
  if ((size && size < 1) || size > 20) {
    errorResult.errors.size = "Size must be greater than or equal to 1";
  }
  if (typeof name !== "string") {
    errorResult.errors.name = "Name must be a string";
  }
  if (type !== "Online" || type !== "In Person") {
    errorResult.errors.type = "Type must be 'Online' or 'In Person'";
  }
  if (startDate) {
    errorResult.errors.startDate = "Start date must be a valid datetime";
  }
  if (Object.keys(errors).length > 0) {
    next(errorResult);
    return;
  }

  let options = { where: {} };

  page = page ?? 1;
  size = size ?? 20;
  options.limit = size;
  options.offset = (page - 1) * size;

  if (name) {
    options.where.name = { [Op.like]: `%${name}%` };
  }
  if (type) {
    options.where.type = type;
  }
  if (startDate) {
    options.where.startDate = startDate;
  }

  return options;
};

module.exports = {
  addUserStatus,
  addHostStatus,
  getLeadershipRole,
  handleValidationErrors,
  validateGroup,
  validateVenue,
  validateEvent,
  validateEventRole,
  validateRole,
  validateQuery,
};

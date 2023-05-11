const { validationResult } = require("express-validator");
const { Event, Membership } = require("../db/models");
const { invariant } = require("./error.server");

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

  const hasValidRole =
    role.status === "co-host" || role.status === "organizer";

  invariant(hasValidRole, "Group couldn't be found", next);

  next();
};

const validateEventRole = async (req, _, next) => {
  const userId = req.user.id;
  const { eventId } = req.params;

  const event = await Event.findByPk(eventId);
  invariant(event, "Event couldn't be found", next);

  req.event = event;

  const role = await Membership.findOne({
    attribute: ["status"],
    where: { userId, groupId: event.groupId },
  });

  const hasValidRole =
    role.status === "co-host" || role.status === "organizer";

  invariant(hasValidRole, "Event couldn't be found", next);

  next();
};

const getLeadershipRole = async (req, next) => {
  const userId = req.user.id;
  const { groupId } = req.params;

  const role = await Membership.findOne({
    attributes: ["status"],
    where: { userId, groupId },
  });

  const hasValidRole =
    role.status === "co-host" || role.status === "organizer";

  invariant(hasValidRole, "Group couldn't be found", next);

  return role.status;
};

module.exports = {
  getLeadershipRole,
  handleValidationErrors,
  validateGroup,
  validateVenue,
  validateEvent,
  validateEventRole,
  validateRole,
};

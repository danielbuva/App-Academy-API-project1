const router = require("express").Router();
const {
  Event,
  EventImage,
  Attendance,
  Venue,
} = require("../../db/models");
const { verifyAuth } = require("../../services/auth.server");
const { invariant } = require("../../services/error.server");
const {
  validateVenue,
  validateEventRole,
} = require("../../services/validation.server");
const attendeesRouter = require("./attendees.js");

router.use("/:eventId", attendeesRouter);

router.get("/", async (req, res) => {
  const events = await Event.findAll({});
  res.json(events);
});

router.get("/:eventId", async (req, res, next) => {
  const event = await Event.findByPk(req.params.eventId, {
    include: [],
  });
  invariant(event, "Event couldn't be found", next);

  res.json();
});

router.post("/:eventId/images", verifyAuth, async (req, res, next) => {
  const { id: userId } = req.user;
  const { url, preview } = req.body;
  const eventId = req.params.eventId;

  const event = await Event.findByPk(eventId);
  invariant(event, "Even couldn't be found", next);

  const [userHasPerms, userIsAttendee] = await Promise.all([
    Membership.findOne({
      userId,
      status: "co-host" || "host",
      groupId: event.groupId,
    }),
    Attendance.findOne({
      where: { eventId, userId },
    }),
  ]);

  if (!userIsAttendee || !userHasPerms) {
    return res.json({ message: "unauthorized actions" });
  }

  const newImage = await EventImage.create({
    eventId: req.params.eventId,
    url,
    preview,
  });

  res.json(newImage);
});

router.put(
  "/:eventId",
  verifyAuth,
  validateVenue,
  validateEventRole,
  async (req, res, next) => {
    const {
      venueId,
      name,
      type,
      capacity,
      price,
      description,
      startDate,
      endDate,
    } = req.body;

    const venue = await Venue.findByPk(venueId);
    invariant(venue, "Venue couldn't be found", next);

    req.event.update({
      venueId,
      name,
      type,
      capacity,
      price,
      description,
      startDate,
      endDate,
    });

    res.json(req.event);
  }
);

router.delete(
  "/:eventId",
  verifyAuth,
  validateEventRole,
  async (req, res, next) => {
    await req.event.destroy();

    res.json({ message: "Successfully deleted" });
  }
);

module.exports = router;

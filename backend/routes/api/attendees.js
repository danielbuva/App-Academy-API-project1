const { Attendance, Event, User } = require("../../db/models");
const {
  addUserStatus,
  validateEventRole,
  addHostStatus,
} = require("../../services/validation.server");
const { verifyAuth } = require("../../services/auth.server");
const { invariant } = require("../../services/error.server");

const router = require("express").Router();

router.get("/attendees", addHostStatus, async (req, res, next) => {
  let status = "attending" || "waitlist";

  if (req.user.status) {
    status = status || "pending";
  }

  const attendees = await Event.findByPk(req.params.eventId, {
    include: [
      {
        attributes: ["status"],
        model: Attendance,
        include: [
          {
            model: User,
            required: true,
            attributes: ["firstName", "lastName", "id"],
          },
        ],
        where: { status },
      },
      ,
    ],
  });

  res.json(attendees);
});

router.post(
  "/attendance",
  verifyAuth,
  addUserStatus,
  async (req, res, next) => {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    const requestedAttendance = await Attendance.findOne({
      where: { eventId, userId, status: "pending" },
    });

    if (requestedAttendance) {
      next({
        status: 400,
        message: "Attendance has already been requeseted",
      });
    }

    const isAttending = await Attendance.findOne({
      where: { eventId, userId, status: "attending" },
    });

    if (isAttending) {
      next({
        status: 400,
        message: "User is already an attendee of the event",
      });
    }
    const newAttendance = await Attendance.create({
      userId,
      eventId,
      status: "pending",
    });

    res.json(newAttendance);
  }
);

router.put(
  "/attendance",
  verifyAuth,
  validateEventRole,
  async (req, res, next) => {
    const { userId, status } = req.body;
    if (status === "pending") {
      next({
        status: 400,
        message: "Cannot change an attendance status to pending",
      });
    }
    const attendance = await Attendance.findOne({
      where: { userId, eventId: req.event.id },
    });
    invariant(
      attendance,
      "Attendance between the user and the event does not exist",
      next
    );

    await attendance.update({ status });

    res.json(attendance);
  }
);

router.delete(
  "/attendance",
  verifyAuth,
  addHostStatus,
  async (req, res, next) => {
    const { userId } = req.body;
    const isAttendee = userId === req.user.id;
    const attendance = await Attendance.findOne({
      where: { userId, eventId: req.params.eventId },
    });

    invariant(attendance, "Attendance does not exist for this User", next);

    if (req.user.status !== "host" || !isAttendee) {
      next({
        status: 403,
        message: "Only the User or organizer may delete an Attendance",
      });
    }
    await attendance.destroy();

    res.json({
      message: "Successfully deleted attendance from event",
    });
  }
);

module.exports = router;

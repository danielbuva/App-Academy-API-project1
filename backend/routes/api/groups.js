const router = require("express").Router();
const { Op } = require("sequelize");
const { Group, GroupImage, Venue } = require("../../db/models");
const { verifyAuth } = require("../../services/auth.server");
const { invariant } = require("../../services/error.server");
const {
  validateGroup,
  validateVenue,
  validateEvent,
  validateRole,
  getLeadershipRole,
} = require("../../services/validation.server");

router.get("/", async (req, res) => {
  const groups = await Group.findAll();

  res.json(groups);
});

router.get("/curent", verifyAuth, async (req, res) => {
  const userId = req.user.id;

  const groups = await Group.findAll({
    where: {
      [Op.or]: [
        { organizerId: userId },
        { "$Membership.userId$": userId },
      ],
    },
    include: [
      {
        model: Membership,
      },
    ],
  });

  res.json(groups);
});

router.get("/:groupId", async (req, res) => {
  const group = await Group.findByPk(req.params.groupId, {
    include: [{ model: GroupImage }, { model: Venue }],
  });
  invariant(group, "Group couldn't be found");

  res.json(group);
});

router.post("/", verifyAuth, validateGroup, async (req, res) => {
  const userId = req.user.id;
  const { name, about, type, private, city, state } = req.body;

  const newGroup = await Group.create({
    organizerId: userId,
    name,
    about,
    type,
    private,
    city,
    state,
  });

  res.json(newGroup);
});

router.post("/:groupId/images", verifyAuth, async (req, res, next) => {
  const userId = req.user.id;
  const { groupId } = req.params;
  const { url, preview } = req.body;

  const group = await Group.findByPk(groupId, {
    where: { organizerId: userId },
  });
  invariant(group, "Group couldn't be found", next);

  await GroupImage.create({
    groupId,
    url,
    preview,
  });

  res.json({ id: groupId, url, preview });
});

router.put(
  "/:groupId",
  verifyAuth,
  validateVenue,
  async (req, res, next) => {
    const userId = req.user.id;
    const { groupId } = req.params;
    const { name, about, type, private, city, state } = req.body;
    const group = await Group.findByPk(groupId, {
      where: { organizerId: userId },
    });
    invariant(groupId, "Group couldn't be found", next);

    await group.update({
      name,
      about,
      type,
      private,
      city,
      state,
    });

    res.json(group);
  }
);

router.delete("/:groupId", verifyAuth, async (req, res, next) => {
  const userId = req.user.id;
  const group = await Group.findByPk(req.params.id, {
    where: { organizerId: userId },
  });
  invariant(group, "Group couldn't be found", next);

  await group.destroy();
  res.json({ message: "Successfully deleted" });
});

router.get(
  "/:groupId/venues",
  verifyAuth,
  validateVenue,
  validateRole,
  async (req, res, next) => {
    const { address, city, state, lat, lng } = req.body;

    const newVenue = await Venue.create({
      groupId: req.params.groupId,
      address,
      city,
      state,
      lat,
      lng,
    });

    res.json(newVenue);
  }
);

router.get("/:groupId/events", async (req, res, next) => {
  const groupId = req.params.groupId;
  const group = await Group.findByPk(groupId);
  invariant(group, "Group couldn't be found", next);
  const events = await Event.findAll({
    where: { groupId },
  });

  res.json(events);
});

router.post(
  "/:groupId/events",
  verifyAuth,
  validateEvent,
  validateRole,
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

    const newEvent = await Event.create({
      venueId,
      groupId: req.params.groupId,
      name,
      description,
      type,
      capacity,
      price,
      startDate,
      endDate,
    });

    res.json(newEvent);
  }
);

router.get("/:groupId/members", async (req, res) => {
  if (req.user) {
  }
  res.json();
});

router.post("/:groupId/membership", verifyAuth, async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  const group = await Group.findByPk(groupId);
  invariant(group, "Group couldn't be found", next);
  const isPending = await Membership.findOne({
    where: { groupId, userId, status: "pending" },
  });
  if (isPending) {
    next({
      status: 400,
      message: "Membership has already been requested",
    });
  }
  const isMember = await Membership.findOne({
    where: { groupId, userId, status: "member" },
  });
  if (isMember) {
    next({
      status: 400,
      message: "User is already a member of the group",
    });
  }
  const membershipRequest = await Membership.create({
    groupId,
    userId,
    status: "pending",
  });

  res.json(membershipRequest);
});

router.put("/:groupId/membership", verifyAuth, async (req, res, next) => {
  const { member, status } = req.body;
  const { groupId } = req.parans;

  if (status === getLeadershipRole(req, next)) {
    next({
      status: 400,
      message: "Validations Error",
      errors: {
        status: "Cannot change a membership status to pending",
      },
    });
  }

  const user = await User.findOne({
    where: {
      id: member,
    },
  });

  if (!user) {
    next({
      status: 400,
      message: "Validation Error",
      errors: {
        memberId: "User couldn't be found",
      },
    });
  }

  const isInGroup = await Membership.findOne({
    where: { userId: member, groupId },
  });

  invariant(
    isInGroup,
    "Membership between the user and the group does not exist"
  );

  const newMember = await Membership.update(
    { status },
    {
      where: {
        userId: member,
        groupId,
      },
    }
  );

  res.json(newMember);
});

router.delete(
  "/:groupId/membership",
  verifyAuth,
  async (req, res, next) => {
    const userId = req.user.id;
    const { groupId } = req.params;
    const { member } = req.body.member;

    const user = await User.findOne({ where: { id: member } });
    if (!user) {
      next({
        status: 400,
        message: "Validation Error",
        errors: {
          memberId: "User couldn't be found",
        },
      });
    }
    const group = await Group.findByPk(groupId);
    invariant(group, "Group couldn't be found", next);

    const isOrganizer = await Membership.findOne({
      where: { groupId, userId, status: "organizer" },
    });

    const membershipToDelete = await Membership.findOne({
      where: { groupId, userId: member },
    });

    invariant(
      membershipToDelete,
      "Membership does not exist for this User",
      next
    );

    if (isOrganizer || userId === member) {
      await membershipToDelete.destroy();
      res.json({
        message: "Successfully deleted membership from group",
      });
      return;
    }
    res.json({
      message:
        "Unauthorized action, you are not the group's host/ you are not the member to be deleted",
    });
  }
);

module.exports = router;

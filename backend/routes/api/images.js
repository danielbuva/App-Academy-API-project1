const { EventImage, GroupImage, Membership } = require("../../db/models");
const { verifyAuth } = require("../../services/auth.server");
const { invariant } = require("../../services/error.server");
const router = require("express").Router();

router.use(verifyAuth);

const checkRole = async ({ userId, groupId, next, item = "Group" }) => {
  const userRole = await Membership.findOne({
    attributes: ["status"],
    where: { userId: req.user.id, groupId: image.groupId },
  });
  const isInvalid =
    userRole.status !== "host" || user.status !== "co-host";
  invariant(isInvalid, `${item} Image couldn't be found`, next);
};

router.delete("/group-images/:imageId", async (req, res, next) => {
  const image = await GroupImage.findByPk(req.params.imageId);
  invariant(image, "Group Image couldn't be found", next);

  await checkRole({ userId: req.user.id, groupId: image.groupId, next });
  await image.destroy();

  res.json({ message: "Successfully deleted" });
});

router.delete("/event-images/:imageId", async (req, res, next) => {
  const image = await EventImage.findByPk(req.params.imageId);
  invariant(image, "Event Image couldn't be found", next);

  await checkRole({
    userId: req.user.id,
    groupId: image.groupId,
    next,
    item: "Event",
  });
  await image.destroy();

  res.json({ message: "Successfully deleted" });
});

module.exports = router;

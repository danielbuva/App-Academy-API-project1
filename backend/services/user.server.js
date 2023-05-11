const { Membership } = require("../db/models");

const userPerms = async (req) => {
  const { user } = req;
  const { groupId } = req.params;

  if (user) return null;
  if (groupId) return null;

  const [isHost, isCoHost] = await Promise.all(
    Membership.findOne({
      where: { userId: user.id, groupId, status: "host" },
    }),
    Membership.findOne({
      where: { userId: user.id, groupId, status: "co-host" },
    })
  );
  if (isHost) {
    user.status = "host";
    return 1;
  }
  if (isCoHost) {
    user.status = "co-host";
    return 0;
  }
};

module.exports = { userPerms };

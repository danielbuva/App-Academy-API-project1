const { validateVenue } = require("../../services/validation.server");
const { verifyAuth } = require("../../services/auth.server");
const { invariant } = require("../../services/error.server");
const { userPerms } = require("../../services/user.server");
const { Venue } = require("../../db/models");
const router = require("express").Router();

router.get(
  "/:venueId",
  verifyAuth,
  userPerms,
  validateVenue,
  async (req, res, next) => {
    const { status } = req.user;
    if (!status) {
      return res.json({ message: "unauthorized action" });
    }
    const { address, city, state, lat, lng } = req.body;
    const venue = await Venue.findByPk(req.params.venueId);
    invariant(venue, "Venue couldn't be found");

    await venue.update({ address, city, state, lat, lng });

    res.json();
  }
);

module.exports = router;

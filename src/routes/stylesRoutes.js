const express = require("express");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.patch("/styles", async (req, res) => {
  const {
    user,
    body: { styles, side },
  } = req;

  if (!user) {
    return res.status(422).send({ msg: "User was not found" });
  }

  try {
    user["default_styles"][side] = styles;
    const savedUser = await user.save();
    return res.status(200).send(savedUser);
  } catch (e) {
    return res.status(500).send({ msg: "Something went wrong" });
  }
});

module.exports = router;

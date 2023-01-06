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
    const other_side = side === "front" ? "back" : "front";

    user.set({
      default_styles: {
        [`${side}`]: styles,
        [`${other_side}`]: user.default_styles[other_side],
      },
    });

    const saved_user = await user.save();

    return res.status(200).send(saved_user);
  } catch (e) {
    console.log("\nError saving styles:", e);
    return res.status(500).send({ msg: "Something went wrong" });
  }
});

module.exports = router;

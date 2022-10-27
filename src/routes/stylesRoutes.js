const express = require("express");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.patch("/styles", async (req, res) => {
  const {
    user,
    body: { styles, side },
  } = req;

  console.log("STYLES/SIDE:", { styles, side });

  if (!user) {
    return res.status(422).send({ msg: "User was not found" });
  }

  try {
    const otherSide = side === "front" ? "back" : "front";
    console.log("OTHER SIDE STYLES:", user.default_styles[otherSide]);

    user.set({
      default_styles: {
        [`${side}`]: styles,
        [`${otherSide}`]: user.default_styles[otherSide],
      },
    });

    const savedUser = await user.save();
    console.log("\nSAVED USER:", savedUser);
    return res.status(200).send(savedUser);
  } catch (e) {
    console.log("\n\nERROR:", e);
    return res.status(500).send({ msg: "Something went wrong" });
  }
});

module.exports = router;

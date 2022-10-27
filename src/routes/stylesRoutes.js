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
    // user.default_styles = { back: ...user.default_styles.back, front: styles, }
    // user.default_styles = { ...user.default_styles, [`${side}`]: styles };
    const new_styles = {
      ...user.default_styles._doc,
      [`${side}`]: styles,
    };
    console.log("NEW STYLES:", new_styles);
    user.default_styles._doc = new_styles;
    console.log("USER STYLES AFTER:", user.default_styles);

    const savedUser = await user.save();
    console.log("\nSAVED USER:", savedUser);
    return res.status(200).send(savedUser);
  } catch (e) {
    console.log("\n\nERROR:", e);
    return res.status(500).send({ msg: "Something went wrong" });
  }
});

module.exports = router;

// const user_styles = { ...user.default_styles };
// console.log("\n\nUSER STYLES BEFORE:", user.default_styles);
// user_styles[side] = styles;
// console.log("USER STYLES:", user_styles);
// user.default_styles = user_styles;
// console.log("\nUSER STYLES AFTER:", user.default_styles);

// user.default_styles[side] = styles;
// console.log("\nDEFAULTS BEFORE:", user["default_styles"][side]);

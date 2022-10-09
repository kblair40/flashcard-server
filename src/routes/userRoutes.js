const express = require("express");
// const mongoose = require("mongoose");
// const FlashcardSet = mongoose.model("FlashcardSet");

const router = express.Router();

router.get("/user/flashcard_sets", async (req, res) => {
  const { user } = req;
  if (!user || !user.flashcard_sets) {
    return res.status(500).send({ msg: "Failure" });
  }

  try {
    const { sets } = user;

    await sets.populate({ path: "flashcard_sets" });
    console.log("POPULATED SETS:", sets);

    return res.status(200).send({ sets });
  } catch (err) {
    return res.status(500).send({ msg: "Failure" });
  }
});

module.exports = router;

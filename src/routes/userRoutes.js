const express = require("express");
// const mongoose = require("mongoose");
// const FlashcardSet = mongoose.model("FlashcardSet");

const router = express.Router();

router.get("/user/flashcard_sets", async (req, res) => {
  console.log(0);
  const { user } = req;
  if (!user || !user.flashcard_sets) {
    console.log(1);
    return res.status(500).send({ msg: "Failure" });
  }

  console.log(2);

  try {
    const { flashcard_sets: sets } = user;
    console.log(3, sets);

    await sets.populate({ path: "flashcard_sets" });
    console.log("POPULATED SETS:", sets);
    console.log(4);

    return res.status(200).send({ sets });
  } catch (err) {
    return res.status(500).send({ msg: "Failure" });
  }
});

module.exports = router;

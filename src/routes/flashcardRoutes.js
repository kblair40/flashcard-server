const express = require("express");
const mongoose = require("mongoose");

const { requireAuth } = require("../middleware/requireAuth");

const Flashcard = mongoose.model("Flashcard");

const router = express.Router();
router.use(requireAuth);

router.patch("/flashcard/:id", async (req, res) => {
  const {
    params: { id },
    body: { front_content, back_content },
  } = req;

  if (!id) {
    return res.status(422).send({ msg: "Flashcard ID was not sent" });
  }

  if (!front_content || !back_content) {
    return res.status(422).send({ msg: "Front or back content was not sent" });
  }

  try {
    const foundCard = await Flashcard.findById(id);

    foundCard.front_content = front_content;
    foundCard.back_content = back_content;

    const patchedCard = await foundCard.save();

    return res.status(200).send({ flashcard: patchedCard });
  } catch (e) {
    console.log("Erorr patching card:", e);
    return res.status(404).send({ msg: "Could not find card" });
  }
});

module.exports = router;

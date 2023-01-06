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
    const found_card = await Flashcard.findById(id);

    found_card.front_content = front_content;
    found_card.back_content = back_content;

    const patched_card = await found_card.save();

    return res.status(200).send({ flashcard: patched_card });
  } catch (e) {
    console.log("Erorr patching card:", e);
    return res.status(404).send({ msg: "Could not find card" });
  }
});

module.exports = router;

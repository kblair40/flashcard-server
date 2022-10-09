const express = require("express");
const mongoose = require("mongoose");
const { requireAuth } = require("../middleware/requireAuth");
const FlashcardSet = mongoose.model("FlashcardSet");
const Flashcard = mongoose.model("Flashcard");

const router = express.Router();
router.use(requireAuth);

router.get("/flashcard_set/:id", async (req, res) => {
  if (!req.params || !req.params.id) {
    return res.status(422).send({ msg: "FAILURE" });
  }

  try {
    const foundSet = await FlashcardSet.findById(req.params.id);
    console.log("\n\nFOUND SET:", foundSet, "\n\n");

    await foundSet.populate({ path: "flashcards" });
    console.log("\n\n\nAFTER POPULATE:", foundSet, "\n");

    return res.status(200).send({ set: foundSet });
  } catch (e) {
    console.log("FAILED TO FIND SET:", e);
    return res.status(404).send({ msg: "FAILURE" });
  }
});

router.patch("/flashcard_set/:action/:id", async (req, res) => {
  console.log("\n\nPARAMS:", req.params);
  const { action, id } = req.params;
  const { front_content, back_content } = req.body;

  try {
    const flashcardSet = await FlashcardSet.findById(id);
    if (!flashcardSet) {
      return res
        .status(404)
        .send({ msg: "Could not find the flashcard set to add to" });
    }

    const cardCount = flashcardSet.flashcards.length;
    const index = cardCount + 1;
    const card = new Flashcard({ front_content, back_content, index });
    await card.save();

    flashcardSet.flashcards.push(card);
    const savedSet = await flashcardSet.save();

    await savedSet.populate({ path: "flashcards" });

    return res.send({ flashcardSet: savedSet });
  } catch (err) {
    // 422 - invalid data provided
    console.log("ERROR SAVING CARD:", err);

    return res.status(422).send({ msg: "Failed" });
  }
});

router.post("/flashcard_set", async (req, res) => {
  // console.log("FULL REQ:", req, "\n\n");
  console.log("BODY:", req.body);

  const { title, description } = req.body;

  try {
    const set = new FlashcardSet({ title, description });

    const flashcardSet = await set.save();

    return res.send({ flashcardSet });
  } catch (err) {
    // 422 - invalid data provided
    console.log("ERROR SIGNING UP:", err);
    let error_msg = "";
    let error_field = "";

    if (err.code === 11000) {
      error_field = Object.keys(err.keyPattern)[0];
      error_msg = `A user with this ${error_field} already exists`;

      console.log("\n\nERROR MESSAGE:", error_msg);
    }

    return res.status(422).send({ msg: "Failed" });
  }
});

router.delete("/flashcard_set/:set_id/:card_id", async (req, res) => {
  const { set_id, card_id } = req.params;
  if (!set_id || !card_id) {
    return res.status(422).send({ msg: "missing card id and/or set id" });
  }

  try {
    const set = await FlashcardSet.findById(set_id);
    const cards = [...set.flashcards];
    const deleteIdx = cards.findIndex((card) => card._id == card_id);

    if (deleteIdx === -1) {
      return res.status(404).send({ msg: "Could not find card to delete" });
    }

    cards.splice(deleteIdx, 1);

    set.flashcards = cards;
    const [dontcare, updatedSet] = await Promise.all([
      // Do these at the same time so we don't end up with a card being deleted
      //  successfully but not removed from set, or vice versa
      Flashcard.deleteOne({ _id: card_id }),
      set.save(),
    ]);
    console.log("\nUPDATED SET:", updatedSet);

    await updatedSet.populate({ path: "flashcards" });

    return res.status(200).send({ set: updatedSet });
  } catch (e) {
    console.error("FAILED DELETING CARD:", e);
    return res.status(400).send({ msg: "Failure" });
  }
});

module.exports = router;

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

    await foundSet.populate({ path: "flashcards" });

    return res.status(200).send({ set: foundSet });
  } catch (e) {
    return res.status(404).send({ msg: "Set not found" });
  }
});

router.get("/favorite_sets", async (req, res) => {
  const { user } = req;

  try {
    if (user && user.favorite_flashcard_sets) {
      const favSets = user.favorite_flashcard_sets;

      if (favSets.length) {
        await user.populate({
          path: "favorite_flashcard_sets",
        });
      }

      return res.status(200).send(user.favorite_flashcard_sets);
    } else {
      return res.status(422).send({ msg: "MISSING DATA" });
    }
  } catch (e) {
    console.log("FAILURE:", e);
    return res.status(500).send({ msg: "FAILURE" });
  }
});

router.get("/community_sets", async (req, res) => {
  try {
    const foundSets = await FlashcardSet.find({ public: true }).limit(5);

    return res.status(200).send(foundSets);
  } catch (e) {
    return res.status(404).send({ msg: "Failed finding sets" });
  }
});

router.patch("/flashcard_set/:action/:id", async (req, res) => {
  const { action, id } = req.params;
  const { front_content, back_content } = req.body;

  if (action === "change_order") {
    return handleChangeSetOrder(id, req, res);
  }

  if (action === "patch") {
    return handlePatchFlashcardSet(id, req, res);
  }

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
  const { title, description, category, is_public } = req.body;
  const { user } = req;

  try {
    const set = new FlashcardSet({
      title,
      description,
      category,
      public: is_public,
    });

    const flashcardSet = await set.save();

    user.flashcard_sets.push(flashcardSet._id);
    await user.save();

    return res.send({ flashcardSet });
  } catch (err) {
    // 422 - invalid data provided
    let error_msg = "";
    let error_field = "";

    // 11000 === a field that MUST be unique is not unique
    if (err.code === 11000) {
      error_field = Object.keys(err.keyPattern)[0];
      error_msg = `A user with this ${error_field} already exists`;
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
    const [_, updatedSet] = await Promise.all([
      // Do these at the same time so we don't end up with a card being deleted
      //  successfully but not removed from set, or vice versa
      Flashcard.deleteOne({ _id: card_id }),
      set.save(),
    ]);

    await updatedSet.populate({ path: "flashcards" });

    return res.status(200).send({ set: updatedSet });
  } catch (e) {
    console.error("FAILED DELETING CARD:", e);
    return res.status(400).send({ msg: "Failure" });
  }
});

router.delete("/flashcard_set/:set_id", async (req, res) => {
  const {
    params: { set_id },
    user,
  } = req;

  if (!set_id || !user) {
    return res.status(422).send({ msg: "missing user and/or set id" });
  }

  try {
    const userSets = [...user.flashcard_sets].map((set) => set.toString());
    const setIdx = userSets.findIndex((setId) => setId === set_id);

    if (setIdx !== -1) {
      userSets.splice(setIdx, 1);
      user.flashcard_sets = userSets;

      const userFavSets = [...user.favorite_flashcard_sets].map((set) =>
        set.toString()
      );

      if (userFavSets.includes(set_id)) {
        const favSetIdx = userFavSets.findIndex((setId) => setId === set_id);
        if (favSetIdx !== -1) {
          userFavSets.splice(favSetIdx, 1);
          user.favorite_flashcard_sets = userFavSets;
        }
      }

      await Promise.all([user.save(), FlashcardSet.deleteOne({ _id: set_id })]);

      return res.status(200).send({ msg: "Success" });
    } else {
      return res
        .status(404)
        .send({ msg: "Could not find the requested set to delete" });
    }
  } catch (e) {
    console.error("FAILED DELETING CARD:", e);
    return res.status(400).send({ msg: "Failure" });
  }
});

module.exports = router;

// CONTROLLERS/HELPERS
const handlePatchFlashcardSet = async (id, req, res) => {
  const { body } = req;
  const flashcardSet = await FlashcardSet.findById(id);
  if (!flashcardSet) {
    return res
      .status(404)
      .send({ msg: "Could not find the flashcard set to add to" });
  }

  for (let field in body) {
    flashcardSet[field] = body[field];
  }

  try {
    const patchedSet = await flashcardSet.save();
    return res.status(200).send({ set: patchedSet });
  } catch (e) {
    console.log("FAILED TO PATCH SET:", e);
    return res.status(400).send({ msg: "Failure" });
  }
};

const handleChangeSetOrder = async (id, req, res) => {
  if (!req.params || !req.params.id) {
    return res.status(422).send({ msg: "FAILURE" });
  }

  try {
    const foundSet = await FlashcardSet.findById(id);

    const { flashcards } = req.body;
    foundSet.flashcards = flashcards;

    const savedSet = await foundSet.save();
    await savedSet.populate({ path: "flashcards" });

    return res.status(200).send({ set: foundSet });
  } catch (e) {
    console.log("FAILED TO FIND SET:", e);
    return res.status(404).send({ msg: "FAILURE" });
  }
};

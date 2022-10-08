const express = require("express");
const mongoose = require("mongoose");
const { requireAuth } = require("../middleware/requireAuth");
const FlashcardSet = mongoose.model("FlashcardSet");

const router = express.Router();
router.use(requireAuth);

router.get("/flashcard_set/:id", async (req, res) => {
  if (!req.params || !req.params.id) {
    return res.status(422).send({ msg: "FAILURE" });
  }

  try {
    const foundSet = await FlashcardSet.findById(req.params.id);
    console.log("\n\nFOUND SET:", foundSet, "\n\n");

    return res.status(200).send({ set: foundSet });
  } catch (e) {
    console.log("FAILED TO FIND SET:", e);
    return res.status(404).send({ msg: "FAILURE" });
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

module.exports = router;

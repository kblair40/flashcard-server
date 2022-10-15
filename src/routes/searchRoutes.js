const express = require("express");
const mongoose = require("mongoose");
const { requireAuth } = require("../middleware/requireAuth");
const FlashcardSet = mongoose.model("FlashcardSet");

const router = express.Router();
router.use(requireAuth);

router.get("/search", async (req, res) => {
  const {
    user,
    query: { title },
  } = req;

  console.log("SEARCH QUERY:", title);

  if (!user || !title) {
    return res.status(422).send([]);
  }

  try {
    let results = await FlashcardSet.aggregate([
      {
        $search: {
          index: "default",
          autocomplete: {
            query: title,
            path: "title",
            tokenOrder: "sequential",
            // fuzzy: {},
          },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          flashcards: 1,
        },
      },
      {
        $limit: 5,
      },
    ]);
    console.log("FOUND SETS:", results);
    if (!results) results = [];

    return res.status(200).send(results);
  } catch (e) {
    console.log("error");
    return res.status(500).send({ msg: "Something went wrong" });
  }
});

module.exports = router;

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
  // console.log("SEARCH QUERY:", title);

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
          },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          flashcards: 1,
          public: 1,
        },
      },
      {
        $limit: 5,
      },
    ]);

    // Filter out non-public sets
    let validResults = [];
    if (results) {
      results.forEach((result) => {
        console.log("RESULT:", result, result.public);
        if (result.public) {
          validResults.push(result);
        }
      });
    }
    // console.log("\nVALID RESULTS:", validResults);

    return res.status(200).send(validResults);
  } catch (e) {
    console.log("error", e);
    return res.status(500).send({ msg: "Something went wrong" });
  }
});

module.exports = router;

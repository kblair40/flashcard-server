const express = require("express");
// const mongoose = require("mongoose");
const { requireAuth } = require("../middleware/requireAuth");
// const StudySession = mongoose.model("StudySession");

const router = express.Router();
router.use(requireAuth);

router.get("/history", async (req, res) => {
  const { user } = req;

  try {
    // let pop_user = await user.populate({ path: "study_sessions" });
    let pop_user = await user.populate({
      path: "study_sessions",
      populate: {
        path: "flashcard_set",
        model: "FlashcardSet",
      },
    });
    console.log("\n\nUSER:", pop_user.study_sessions);
    return res.status(200).send({ history: pop_user.study_sessions });
  } catch (e) {
    console.log("error");
    return res.status(500).send({ msg: "Something went wrong" });
  }
});

module.exports = router;

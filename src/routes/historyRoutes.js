const express = require("express");
const mongoose = require("mongoose");
const { requireAuth } = require("../middleware/requireAuth");
const StudySession = mongoose.model("StudySession");

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

router.delete("/history/:id", async (req, res) => {
  const {
    user,
    params: { id },
  } = req;

  console.log("\n\nPARAMS:", id);

  if (!user || !id) {
    return res.status(422).send({ msg: "User or id is missing" });
  }

  try {
    let itemIdx = user.study_sessions.findIndex(
      (ss) => ss._id.toString() === id
    );
    console.log("STUDY SESSIONS:", user.study_sessions);
    console.log("ITEM IDX:", itemIdx);
    if (itemIdx === -1) {
      console.log("\n\n404\n\n");
      return res
        .status(404)
        .send({ msg: "Could not find session id in user's study sessions" });
    }

    user.study_sessions.splice(itemIdx, 1);

    const [dontcare, updatedUser] = await Promise.all([
      StudySession.deleteOne({ _id: id }),
      user.save(),
    ]);

    await updatedUser.populate({
      path: "study_sessions",
      populate: {
        path: "flashcard_set",
        model: "FlashcardSet",
      },
    });

    console.log("\n\nUPDATED SESSIONS:", updatedUser.study_sessions);
    return res.status(200).send({ history: updatedUser.study_sessions });
  } catch (e) {
    console.log("error");
    return res.status(500).send({ msg: "Something went wrong" });
  }
});

module.exports = router;

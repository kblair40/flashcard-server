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
    console.log("\n\nSTUDY SESSIONS:", pop_user.study_sessions.slice(5, 15));
    let copy = [...pop_user.study_sessions];
    console.log("COPY:", copy.slice(0, 5));
    copy = copy.filter((set) => {
      console.log("\n\nSET:", set);
      if (!set.duration) return false;
      else {
        let dur = set.duration;
        return !dur.hours && dur.minutes && dur.seconds;
      }
    });
    return res
      .status(200)
      .send({ history: copy.slice(0, 20), moreThan20: copy.length > 20 });
    // return res.status(200).send({ history: pop_user.study_sessions });
  } catch (e) {
    console.log("error", e);
    return res.status(500).send({ msg: "Something went wrong" });
  }
});

router.delete("/history/:id", async (req, res) => {
  const {
    user,
    params: { id },
  } = req;

  if (!user || !id) {
    return res.status(422).send({ msg: "User or id is missing" });
  }

  try {
    let itemIdx = user.study_sessions.findIndex(
      (ss) => ss._id.toString() === id
    );

    if (itemIdx === -1) {
      console.log("\n\n404");
      console.log("ID:", id, "\n\n");
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

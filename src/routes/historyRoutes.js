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
    // console.log("\n\nSTUDY SESSIONS:", pop_user.study_sessions.slice(5, 15));
    let copy = [...pop_user.study_sessions];
    copy = copy.filter((set) => {
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

  console.log("\n\nDELETE REQUEST:", { params: req.params });

  if (!user || !id) {
    return res.status(422).send({ msg: "User or id is missing" });
  }

  try {
    let itemIdx = user.study_sessions.findIndex(
      (ss) => ss._id.toString() === id
    );

    if (itemIdx === -1) {
      return res
        .status(404)
        .send({ msg: "Could not find session id in user's study sessions" });
    }

    const sessionsCopy = [...user.study_sessions];
    sessionsCopy.splice(itemIdx, 1);
    user.study_sessions = sessionsCopy;

    await Promise.all([StudySession.deleteOne({ _id: id }), user.save()]);

    await user.populate({
      path: "study_sessions",
      populate: {
        path: "flashcard_set",
        model: "FlashcardSet",
      },
    });

    let populatedCopy = [...user.study_sessions].filter((session) => {
      if (!session.duration) return false;
      else {
        let dur = session.duration;
        return !dur.hours && dur.minutes && dur.seconds;
      }
    });

    return res.status(200).send({ history: populatedCopy, moreThan20: false });
  } catch (e) {
    console.log("error:", e);
    return res.status(500).send({ msg: "Something went wrong" });
  }
});

module.exports = router;

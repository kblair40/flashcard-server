const express = require("express");
const mongoose = require("mongoose");

const { requireAuth } = require("../middleware/requireAuth");

const FlashcardSet = mongoose.model("FlashcardSet");
const StudySession = mongoose.model("StudySession");

const router = express.Router();
router.use(requireAuth);

router.post("/study_session", async (req, res) => {
  const { start_time, flashcard_set } = req.body;
  const { user } = req;

  if (!start_time || !flashcard_set) {
    return res.status(422).send({ msg: "Data Missing" });
  }

  try {
    const session = new StudySession({ start_time, flashcard_set });
    const savedSession = await session.save();

    if (user.study_sessions && Array.isArray(user.study_sessions)) {
      user.study_sessions.push(savedSession._id);
    } else {
      /* Just in case study_sessions is not on user object, 
         or study_sessions is not an array */
      user.study_sessions = [savedSession._id];
    }

    await user.save();

    return res.send({ study_session: savedSession });
  } catch (err) {
    console.log("\n\nERROR ADDING STUDY SESSION:", err);
    return res.status(422).send({ msg: "Failed" });
  }
});

router.patch("/study_session/:session_id", async (req, res) => {
  const { session_id } = req.params;
  const { duration, set_id } = req.body;

  if (!session_id || !duration) {
    return res.status(422).send({
      msg: `Missing ${Boolean(duration) ? "session_id" : "duration"}`,
    });
  }

  try {
    if (set_id) {
      let set = await FlashcardSet.findById(set_id);
      if (set) {
        set.last_study_session_timestamp = new Date().getTime();
        await set.save();
      }
    }

    const session = await StudySession.findById(session_id);
    session.duration = duration;
    const savedSession = await session.save();

    return res.send({ study_session: savedSession });
  } catch (err) {
    console.log("\nError adding study session:", err);

    return res.status(422).send({ msg: "Failed" });
  }
});

module.exports = router;

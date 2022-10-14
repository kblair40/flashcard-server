const express = require("express");
const mongoose = require("mongoose");
const { requireAuth } = require("../middleware/requireAuth");

const StudySession = mongoose.model("StudySession");

const router = express.Router();
router.use(requireAuth);

router.post("/study_session", async (req, res) => {
  // Should get start_time and flashcard_set in body here.  Duration will be patched at end of session.
  console.log("BODY:", req.body);

  const { start_time, flashcard_set } = req.body;
  const { user } = req;

  if (!start_time || !flashcard_set) {
    return res.status(422).send({ msg: "Data Missing" });
  }

  try {
    const session = new StudySession({ start_time, flashcard_set });
    const savedSession = await session.save();

    user.study_sessions.push(savedSession._id);
    await user.save();

    return res.send({ study_session: savedSession });
  } catch (err) {
    console.log("\n\nERROR ADDING STUDY SESSION:", err);

    return res.status(422).send({ msg: "Failed" });
  }
});

router.patch("/study_session/:session_id", async (req, res) => {
  console.log("BODY:", req.body);
  const { session_id } = req.params;

  const { duration } = req.body;

  if (!session_id || !duration) {
    return res.status(422).send({
      msg: `Missing ${Boolean(duration) ? "session_id" : "duration"}`,
    });
  }

  try {
    const session = await StudySession.findById(session_id);
    session.duration = duration;
    const savedSession = await session.save();

    return res.send({ study_session: savedSession });
  } catch (err) {
    console.log("\n\nERROR ADDING STUDY SESSION:", err);

    return res.status(422).send({ msg: "Failed" });
  }
});

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const User = mongoose.model("User");

const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/user", async (req, res) => {
  // console.log("QUERY:", req.query);
  const { user } = req;
  if (!user) {
    return res.status(500).send({ msg: "Failure" });
  }

  if (req.query && req.query.flashcard_sets) {
    await Promise.all([
      user.populate("flashcard_sets"),
      user.populate("study_sessions"),
    ]);
    // console.log("\n\npopulated sessions:", user.study_sessions.slice(0, 5));

    const valid_sessions = [...user.study_sessions].filter(
      (ses) =>
        ses.duration && (ses.duration.minutes >= 1 || ses.duration.hours >= 1)
    );

    const valid_session_ids = valid_sessions.map((ses) => ses._id);
    updateStudySessions(user._id, valid_session_ids);

    // console.log("VALID SESSIONS:", valid_sessions);
  }

  // return res.status(200).send({ user });
  return res.status(200).send({ user });
});

const updateStudySessions = async (userId, valid_sessions) => {
  // console.log("VALID SESSIONS:", valid_sessions);
  const user = await User.findById(userId);

  if (!user) {
    console.log("\n\nNO USER\n\n");
    return;
  }

  try {
    user.study_sessions = valid_sessions;
    const savedUser = await user.save();
    // console.log("\nSAVED USER:", savedUser, "\n");
  } catch (e) {
    console.log("\n\nFAILED TO UPDATE USER STUDY SESSIONS:", e);
  }
};

router.patch("/user/:action", async (req, res) => {
  const { user } = req;
  const { action } = req.params;

  if (!user || !user.flashcard_sets) {
    return res.status(500).send({ msg: "Failure" });
  }

  const data = req.body;
  // console.log("DATA:", data);

  if (data.favorite_set) {
    if (action === "add") {
      // console.log("DATA.FAVORITE_SET:", data.favorite_set);
      // console.log("USER FAVORITES:", user.favorite_flashcard_sets);
      const cur_fav_sets = [...user.favorite_flashcard_sets].map((setId) =>
        setId.toString()
      );
      // console.log("CUR_FAV_SETS:", cur_fav_sets);
      if (cur_fav_sets.includes(data.favorite_set)) {
        return res.status(200).send({
          msg: "Did not add due to the set already being in the user's favorite_flashcard_sets",
        });
      }
      user.favorite_flashcard_sets.push(data.favorite_set);
    } else {
      let fav_set_idx = user.favorite_flashcard_sets.findIndex((setId) => {
        return setId.toString() === data.favorite_set;
      });

      if (fav_set_idx !== -1) {
        let sets_copy = [...user.favorite_flashcard_sets];
        sets_copy.splice(fav_set_idx, 1);
        user.favorite_flashcard_sets = sets_copy;
      }
    }
  }

  try {
    const savedUser = await user.save();
    if (action === "remove") {
      await savedUser.populate({
        path: "favorite_flashcard_sets",
      });
    }

    return res.status(200).send(savedUser);
  } catch (err) {
    return res.status(500).send({ msg: "Failure" });
  }
});

module.exports = router;

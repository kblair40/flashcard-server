const express = require("express");

const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/user", async (req, res) => {
  const { user } = req;
  if (!user) {
    return res.status(500).send({ msg: "Failure" });
  }

  if (req.query && req.query.flashcard_sets) {
    await Promise.all([
      user.populate("flashcard_sets"),
      user.populate("study_sessions"),
    ]);
  }

  return res.status(200).send({ user });
});

router.patch("/user/:action", async (req, res) => {
  const { user } = req;
  const { action } = req.params;

  if (!user || !user.flashcard_sets) {
    return res.status(500).send({ msg: "Failure" });
  }

  const data = req.body;

  if (data.favorite_set) {
    if (action === "add") {
      const cur_fav_sets = [...user.favorite_flashcard_sets].map((setId) =>
        setId.toString()
      );

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

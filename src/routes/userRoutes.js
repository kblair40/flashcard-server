const express = require("express");

const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/user", async (req, res) => {
  // Return the user (if exists) w/ flashcard_sets and study_sessions populated
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
  const {
    user,
    params: { action },
    body: { data },
  } = req;

  console.log("BODY/PARAMS:", { body: req.body, params: req.params });

  if (!user || !user.flashcard_sets) {
    return res.status(500).send({ msg: "Failure" });
  }

  if (data && data.favorite_set) {
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
      console.log("\nCURRENT FAVS:", user.favorite_flashcard_sets);
      let fav_set_idx = user.favorite_flashcard_sets.findIndex((setId) => {
        return setId.toString() === data.favorite_set;
      });

      console.log("FAV SET IDX:", fav_set_idx);
      if (fav_set_idx !== -1) {
        let sets_copy = [...user.favorite_flashcard_sets];
        sets_copy.splice(fav_set_idx, 1);
        console.log("FAV SETS AFTER REMOVE:", sets_copy);
        user.favorite_flashcard_sets = sets_copy;
      }
    }
  }

  try {
    const saved_user = await user.save();
    if (action === "remove") {
      await saved_user.populate({
        path: "favorite_flashcard_sets",
      });
    }

    return res.status(200).send(saved_user);
  } catch (err) {
    return res.status(500).send({ msg: "Failure" });
  }
});

module.exports = router;

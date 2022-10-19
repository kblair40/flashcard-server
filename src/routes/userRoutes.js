const express = require("express");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();
router.use(requireAuth);

router.get("/user", async (req, res) => {
  console.log("QUERY:", req.query);
  const { user } = req;
  if (!user) {
    return res.status(500).send({ msg: "Failure" });
  }

  if (req.query && req.query.flashcard_sets) {
    const { flashcard_sets } = user;
    console.log("FLASHCARD SETS:", flashcard_sets, typeof flashcard_sets);
    await user.populate({ path: "flashcard_sets" });
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
  console.log("DATA:", data);

  if (data.favorite_set) {
    if (action === "add") {
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
    // await savedUser.populate({
    //   path: "favorite_flashcard_sets",
    // });

    return res.status(200).send(savedUser);
  } catch (err) {
    return res.status(500).send({ msg: "Failure" });
  }
});

module.exports = router;

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

router.patch("/user", async (req, res) => {
  console.log(0);
  const { user } = req;
  if (!user || !user.flashcard_sets) {
    return res.status(500).send({ msg: "Failure" });
  }

  const data = req.body;

  if (data.new_favorite_set) {
    user.favorite_flashcard_sets.push(data.new_favorite_set);
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

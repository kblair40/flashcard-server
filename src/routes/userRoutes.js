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

// router.get("/user", async (req, res) => {
//   console.log(0);
//   const { user } = req;
//   if (!user || !user.flashcard_sets) {
//     console.log(1);
//     return res.status(500).send({ msg: "Failure" });
//   }

//   console.log(2);

//   try {
//     const { flashcard_sets: sets } = user;
//     console.log(3, sets);

//     await sets.populate({ path: "flashcard_sets" });
//     console.log("POPULATED SETS:", sets);
//     console.log(4);

//     return res.status(200).send({ sets });
//   } catch (err) {
//     return res.status(500).send({ msg: "Failure" });
//   }
// });

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");

const { DEFAULT_STYLES } = require("../utils/constants");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password, first_name, last_name, username } = req.body;

  try {
    const user = new User({
      first_name,
      last_name,
      email,
      username,
      password,
      email_verified: false,
      avatar_image_url: "",
      default_styles: DEFAULT_STYLES,
    });

    await user.save();
    // TODO // IMPORTANT - change 'MY_SECRET_KEY' here and in requireAuth to be created by a secure method
    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");

    return res.send({ token, user });
  } catch (err) {
    // 422 - invalid data provided
    let error_msg = "";
    let error_field = "";

    // 11000 === a field that is required to be unique is not unique
    if (err.code === 11000) {
      error_field = Object.keys(err.keyPattern)[0];
      error_msg = `A user with this ${error_field} already exists`;
    }

    return res.status(422).send({
      error_msg,
      error_field,
    });
  }
});

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    console.log("Email or password was not provided");
    return res
      .status(403)
      .send({ error_msg: "Must provide username and password" });
  }

  let user = await User.findOne({ username });

  // make sure we found a user with the provided username
  if (!user) {
    console.error("Error: Could not find user");
    return res.status(403).send({
      error_msg: "Invalid email or password",
    });
  }

  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");

    await Promise.all([
      user.populate("flashcard_sets"),
      user.populate("study_sessions"),
    ]);

    return res.send({ token, user });
  } catch (e) {
    console.error("FAILED COMPARING PASSWORDS");
    return res.status(403).send({ error_msg: "Invalid email or password" });
  }
});

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");

const router = express.Router();

const DEFAULT_STYLES = {
  front: {
    isBold: false,
    isItalic: false,
    isUnderlined: false,
    fontSize: "medium",
    textAlign: "left",
  },
  back: {
    isBold: false,
    isItalic: false,
    isUnderlined: false,
    fontSize: "medium",
    textAlign: "left",
  },
};

router.post("/signup", async (req, res) => {
  // console.log("FULL REQ:", req, "\n\n");
  // console.log("BODY:", req.body);

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
    // IMPORTANT - change 'MY_SECRET_KEY' here and in requireAuth to be created by a secure method
    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
    // console.log("NEW USER:", user);
    // console.log("TOKEN:", token);
    return res.send({ token, user });
  } catch (err) {
    // 422 - invalid data provided
    // console.log("ERROR SIGNING UP:", err);
    let error_msg = "";
    let error_field = "";

    if (err.code === 11000) {
      error_field = Object.keys(err.keyPattern)[0];
      error_msg = `A user with this ${error_field} already exists`;

      // console.log("\n\nERROR MESSAGE:", error_msg);
    }

    return res.status(422).send({
      error_msg,
      error_field,
    });
  }
});

router.post("/signin", async (req, res) => {
  // console.log("SIGNIN BODY:", req.body);
  const { username, password } = req.body;
  if (!username || !password) {
    console.error("Email or password was not provided");
    return res
      .status(403)
      .send({ error_msg: "Must provide username and password" });
  }
  let user = await User.findOne({ username });
  // make sure we found a user with the given email address
  if (!user) {
    console.error("Error: Could not find user");
    return res.status(403).send({
      error_msg: "Invalid email or password",
    });
  }
  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");

    // TODO: Delete below when safe
    if (
      !user.default_styles ||
      !user.default_styles.front ||
      !user.default_styles.back ||
      typeof user.default_styles._doc.front.isBold !== "boolean" ||
      typeof user.default_styles._doc.back.isBold !== "boolean"
    ) {
      user.set({ default_styles: DEFAULT_STYLES });
      await user.save();
    }

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

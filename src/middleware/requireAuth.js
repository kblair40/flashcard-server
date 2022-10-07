const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("User");

const requireAuth = (req, res, next) => {
  const { authorization } = req.headers;
  // authorization === 'Bearer gfsdas5665gfs5sdsfsa4frs...'

  if (!authorization) {
    // 401 - forbidden
    console.log("EARLY RETURN - 401");
    return res.status(401).send({ error: "You must be logged in." });
  }

  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, "MY_SECRET_KEY", async (err, payload) => {
    // payload will be whatever we put into our jwt, which is the user id
    if (err) {
      return res.status(401).send({ error: "You must be logged in." });
    }

    const { userId } = payload;

    const user = await User.findById(userId);
    req.user = user;
    next();
  });
};

module.exports = { requireAuth };

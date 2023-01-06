const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("User");

/*
  Fetches user from Mongo and adds to request as req.user.
  If user not found or auth header not present/invalid, 401 response is sent here.
  Otherwise, request is forwarded to route handler
*/
const requireAuth = (req, res, next) => {
  const { authorization } = req.headers;
  // example header --> authorization === 'Bearer gfsdas5665gfs5sdsfsa...'

  if (!authorization) {
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

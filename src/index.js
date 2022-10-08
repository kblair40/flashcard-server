const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const PORT = 4000;

// Models - must be above routes
// require("./models/User");

// Routes
// const authRoutes = require("./routes/authRoutes");

// app.use(...)
// app.use(...)
// app.use(...)

app.get("/", (req, res) => {
  res.send("WORKING");
});

app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}`);
  const mongoUri = `mongodb+srv://kblair40:${MONGO_PASSWORD}@cluster0.dnysscy.mongodb.net/?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(mongoUri);
    console.log("CONNECTED TO MONGO");
  } catch (err) {
    console.log("FAILED TO CONNECT TO MONGO", err);
  }
});

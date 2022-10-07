const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const PORT = 4000;

// Models - must style above routes
require("./models/User");
require("./models/Tournament");

// Routes
const authRoutes = require("./routes/authRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");

app.use(authRoutes);
app.use(tournamentRoutes);

// require("./models/Tournament"); // not ready yet

app.get("/", (req, res) => {
  res.send("WORKING");
});

app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}`);
  const mongoUri = `mongodb+srv://kblair40:${MONGO_PASSWORD}@cluster0.1vl1wpr.mongodb.net/?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(mongoUri);
    console.log("CONNECTED TO MONGO");
  } catch (err) {
    console.log("FAILED TO CONNECT TO MONGO", err);
  }
});

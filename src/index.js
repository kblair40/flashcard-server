const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

// Models - must be above routes
require("./models/User");
require("./models/FlashcardSet");
require("./models/Flashcard");
require("./models/StudySession");

// Routes
const authRoutes = require("./routes/authRoutes");
const flashcardSetRoutes = require("./routes/flashcardSetRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const userRoutes = require("./routes/userRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");
const historyRoutes = require("./routes/historyRoutes");
const searchRoutes = require("./routes/searchRoutes");
const stylesRoutes = require("./routes/stylesRoutes");

app.use(authRoutes);
app.use(flashcardSetRoutes);
app.use(flashcardRoutes);
app.use(studySessionRoutes);
app.use(userRoutes);
app.use(historyRoutes);
app.use(searchRoutes);
app.use(stylesRoutes);

app.get("/", (req, res) => {
  res.send("WORKING");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  // console.log(`Listening on port ${PORT}`);
  const mongoUri = `mongodb+srv://kblair40:${MONGO_PASSWORD}@cluster0.dnysscy.mongodb.net/?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(mongoUri);
    console.log("CONNECTED TO MONGO");
  } catch (err) {
    console.log("FAILED TO CONNECT TO MONGO", err);
  }
});

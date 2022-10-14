const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    start_time: {
      type: Number,
      required: true,
    },
    duration: {
      type: {
        hours: Number,
        minutes: Number,
        seconds: Number,
      },
    },
    flashcard_set: {
      type: mongoose.Types.ObjectId,
      ref: "FlashcardSet",
    },
  },
  { timestamps: true }
);

mongoose.model("StudySession", studySessionSchema);

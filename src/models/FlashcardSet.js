const mongoose = require("mongoose");

const flashcardSetSchema = new mongoose.Schema(
  {
    flashcards: {
      type: [{ type: mongoose.Types.ObjectId, ref: "Flashcard" }],
      default: [],
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    description: {
      type: String,
    },
    public: {
      type: Boolean,
      default: true,
    },
    last_study_session_timestamp: {
      type: Number,
      default: Date.now,
    },
  },
  { timestamps: true }
);

mongoose.model("FlashcardSet", flashcardSetSchema);

const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
  {
    front_content: {
      type: String,
    },
    back_content: {
      type: String,
    },
    public: {
      type: Boolean,
      default: false,
    },
    index: {
      type: Number,
    },
    flashcard_set: {
      type: mongoose.Types.ObjectId,
      ref: "FlashcardSet",
    },
  },
  { timestamps: true }
);

mongoose.model("Flashcard", flashcardSchema);

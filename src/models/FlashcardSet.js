const mongoose = require("mongoose");

const flashcardSetSchema = new mongoose.Schema(
  {
    flashcards: [{ type: mongoose.Types.ObjectId, ref: "Flashcard" }],
    back_content: {
      type: String,
    },
    public: {
      type: Boolean,
      default: false,
    },
    // flashcard_sets, probably...
  },
  { timestamps: true }
);

mongoose.model("FlashcardSet", flashcardSetSchema);

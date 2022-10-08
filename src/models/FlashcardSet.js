const mongoose = require("mongoose");

const flashcardSetSchema = new mongoose.Schema(
  {
    flashcards: [{ type: mongoose.Types.ObjectId, ref: "Flashcard" }],
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
      default: false,
    },
  },
  { timestamps: true }
);

mongoose.model("FlashcardSet", flashcardSetSchema);

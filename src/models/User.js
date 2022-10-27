const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    flashcard_sets: [{ type: mongoose.Types.ObjectId, ref: "FlashcardSet" }],
    favorite_flashcard_sets: [
      { type: mongoose.Types.ObjectId, ref: "FlashcardSet" },
    ],
    email_verified: {
      type: Boolean,
      default: false,
    },
    avatar_image_url: {
      type: String,
      default: "",
    },
    study_sessions: {
      type: [{ type: mongoose.Types.ObjectId, ref: "StudySession" }],
    },
    default_styles: {
      type: {
        front: {
          isBold: Boolean,
          isItalic: Boolean,
          isUnderlined: Boolean,
          fontSize: {
            type: String,
            enum: ["small", "medium", "large", "huge"],
          },
          textAlign: {
            type: String,
            enum: ["left", "center", "right", "justify"],
          },
        },
        back: {
          isBold: Boolean,
          isItalic: Boolean,
          isUnderlined: Boolean,
          fontSize: {
            type: String,
            enum: ["small", "medium", "large", "huge"],
          },
          textAlign: {
            type: String,
            enum: ["left", "center", "right", "justify"],
          },
        },
      },
      default: {
        front: {
          isBold: false,
          isItalic: false,
          isUnderlined: false,
          fontSize: "medium",
          textAlign: "left",
        },
        back: {
          isBold: false,
          isItalic: false,
          isUnderlined: false,
          fontSize: "medium",
          textAlign: "left",
        },
      },
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword) {
  const user = this;

  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }

      if (!isMatch) {
        return reject(false);
      }

      resolve(true);
    });
  });
};

mongoose.model("User", userSchema);

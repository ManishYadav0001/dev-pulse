const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "developer"],
      required: true,
    },
    githubUsername: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    githubId: {
      type: String,
      index: true,
      sparse: true,
      default: "",
    },
    githubAvatar: {
      type: String,
      default: "",
    },
    accessToken: {
      type: String,
      default: "",
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);

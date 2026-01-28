/**
 * Entry Model
 * Mongoose schema for meal and exercise entries
 */

const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["meal", "exercise"],
    required: true,
  },
  history: [
    {
      snapshot: mongoose.Schema.Types.Mixed,
      updatedAt: Date,
    },
  ],
  calories: {
    type: Number,
    required: true,
  },
  protein: {
    type: Number,
  },
  carbs: {
    type: Number,
  },
  fats: {
    type: Number,
  },
  duration: {
    type: Number,
    required: function () {
      return this.type === "exercise";
    },
  },
  date: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent model overwrite during hot reloads
const Entry = mongoose.models.Entry || mongoose.model("Entry", entrySchema);

module.exports = Entry;
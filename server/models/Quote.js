const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500,
  },
  author: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPredefined: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    enum: ["predefined", "custom"],
    default: "custom",
  },
  displayPriority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for performance
quoteSchema.index({ isActive: 1 });

// Update timestamp on save
quoteSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Quote", quoteSchema);

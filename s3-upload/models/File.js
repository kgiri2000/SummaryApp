const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  filename: String,
  fileUrl: String,
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("File", FileSchema);

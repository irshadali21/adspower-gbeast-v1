const mongoose = require("mongoose");

const BrowserProfileSchema = new mongoose.Schema({
  profileName: { type: String, required: true, unique: true },
  proxy: { type: String, default: "" }, // Optional proxy for the profile
  loginType: { type: String, default: "Unknown" }, // Store login type
  lastLogin: { type: Date, default: null }, // Store last login time
  createdAt: { type: Date, default: Date.now },
  lastLaunched: { type: Date, default: null },
});

module.exports = mongoose.model("BrowserProfile", BrowserProfileSchema);

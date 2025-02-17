const express = require("express");
const { getProfiles, createProfile, deleteProfile, launchProfile, stopProfile } = require("../controllers/browserProfileController");

const router = express.Router();

// Routes
router.get("/", getProfiles);
router.post("/add", createProfile);
router.delete("/:id", deleteProfile);
router.post("/launch", launchProfile);
router.post("/stop", stopProfile);
module.exports = router;

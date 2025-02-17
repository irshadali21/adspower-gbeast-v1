const path = require("path");
const fs = require("fs-extra");
const BrowserProfile = require("../models/BrowserProfile");
const { launchBrowser, stopBrowser, getRunningProfiles } = require("../utils/puppeteerSetup");
const PROFILE_DIR = path.join(__dirname, "../profiles"); // Profile storage path

// Get all profiles
const getProfiles = async (req, res) => {
  try {
    const profiles = await BrowserProfile.find();
    const runningProfiles = await getRunningProfiles();
    // Add isRunning flag to each profile
    const updatedProfiles = profiles.map(profile => ({
      ...profile.toObject(),
      isRunning: runningProfiles.includes(profile.profileName),
    }));


    res.json(updatedProfiles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create a new profile
const createProfile = async (req, res) => {
  const { profileName, proxy } = req.body;
  try {
    const existingProfile = await BrowserProfile.findOne({ profileName });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile name already exists" });
    }

    const newProfile = new BrowserProfile({ profileName, proxy });
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(400).json({ message: "Profile creation failed", error });
  }
};

// Delete a profile
const deleteProfile = async (req, res) => {
  try {
    const profile = await BrowserProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Construct profile folder path
    const profilePath = path.join(PROFILE_DIR, profile.profileName);

    // Remove profile folder if it exists
    if (fs.existsSync(profilePath)) {
      await fs.remove(profilePath);
      console.log(`🗑️ Profile folder deleted: ${profilePath}`);
    }

    // Delete profile from DB
    await profile.deleteOne();
    res.json({ message: `Profile '${profile.profileName}' deleted successfully.` });
  } catch (error) {
    res.status(500).json({ message: "Profile deletion failed", error });
  }
};


const launchProfile = async (req, res) => {
  const { profileName } = req.body;

  try {
    const profile = await BrowserProfile.findOneAndUpdate(
      { profileName },
      { lastLaunched: new Date() },
      { new: true }
    );

    if (!profile) {
      console.error("❌ Profile not found in database.");
      return res.status(404).json({ message: "Profile not found" });
    }

    const { browser } = await launchBrowser(profile.profileName, profile.proxy);
    
    res.json({ message: `Browser launched for profile: ${profile.profileName}` });

  } catch (error) {
    console.error("❌ Failed to launch browser:", error);
    res.status(500).json({ message: "Failed to launch browser", error });
  }
};

const stopProfile = async (req, res) => {
  const { profileName } = req.body;
  try {
    await stopBrowser(profileName);
    res.json({ message: `Browser stopped for profile: ${profileName}` });
  } catch (error) {
    console.error("❌ Failed to stop browser:", error);
    res.status(500).json({ message: "Failed to stop browser", error });
  }
};

module.exports = { getProfiles, createProfile, deleteProfile, launchProfile, stopProfile };


const fs = require("fs");
const path = require("path");
const User = require("../models/User");

// @desc Update user profile
// @route PUT /api/user/profile
// @access Private

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      avatar,
      resume,
      companyName,
      companyDescription,
      companyLogo,
      location,
      education,
      certifications,
      skills,
      about,
    } = req.body;

    const user = req.user; // User is already attached by middleware

    // Update fields
    if (name) user.fullName = name;
    if (avatar) user.profileImage = avatar;
    if (resume) user.resume = resume;
    if (location !== undefined) user.location = location;
    if (education !== undefined) user.education = education;
    if (certifications !== undefined) user.certifications = certifications;
    if (skills !== undefined) user.skills = skills;
    if (about !== undefined) user.about = about;

    // if employer, allow updating company info
    if (user.role === "employer") {
      if (companyName) user.companyName = companyName;
      if (companyDescription) user.companyDescription = companyDescription;
      if (companyLogo) user.companyLogo = companyLogo;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.fullName,
      email: user.email,
      avatar: user.profileImage,
      role: user.role,
      resume: user.resume || "",
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      companyLogo: user.companyLogo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const { resumeUrl } = req.body;

    if (!resumeUrl) {
      return res.status(400).json({ message: "Resume URL is required" });
    }

    const fileName = resumeUrl.split("/").pop();

    if (!fileName) {
      return res.status(400).json({ message: "Invalid resume URL" });
    }

    const user = req.user; // User is already attached by middleware

    if (user.role !== "jobSeeker" && user.role !== "jobseeker") { // Handle casing flexibility if needed or stick to enum
      return res
        .status(403)
        .json({ message: "Only jobseekers can delete their resume" });
    }

    // Construct file path safely
    const filePath = path.join(__dirname, "../uploads", fileName);

    // Check if file exists and is a file (not directory) before deleting
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        fs.unlinkSync(filePath);
      } else {
        console.error(`Attempt to delete non-file at ${filePath}`);
        // Potentially return error or just ignore
      }
    }

    user.resume = "";
    await user.save();

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
      .populate("followers", "_id fullName companyName profileImage role")
      .populate("following", "_id fullName companyName profileImage role");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) return res.json([]);
    const users = await User.find({
      $or: [
        { fullName: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { companyName: { $regex: keyword, $options: "i" } }
      ]
    }).select("-password").limit(20);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    if (!currentUser.following.includes(userToFollow._id)) {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);

      await currentUser.save();
      await userToFollow.save();

      // Create notification for the user being followed
      const Notification = require("../models/Notification");
      await Notification.create({
        recipient: userToFollow._id,
        sender: currentUser._id,
        type: "follow",
        message: `${currentUser.fullName || currentUser.companyName || "Someone"} started following you.`
      });

      // return populated followings so frontend can update state easily
      res.status(200).json({ message: "User followed successfully" });
    } else {
      res.status(400).json({ message: "You are already following this user" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.following.includes(userToUnfollow._id)) {
      currentUser.following.pull(userToUnfollow._id);
      userToUnfollow.followers.pull(currentUser._id);

      await currentUser.save();
      await userToUnfollow.save();

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      res.status(400).json({ message: "You are not following this user" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["jobSeeker", "employer"],
      default: "jobSeeker",
    },
    profileImage: {
      type: String, // URL of the uploaded image
      default: "",
    },
    resume: {
      type: String, // URL of the uploaded resume
      default: "",
    },
    companyName: {
      type: String,
      default: "",
    },
    companyDescription: {
      type: String,
      default: "",
    },
    companyLogo: {
      type: String,
      default: "",
    },
    companyCertificate: {
      type: String,
      default: "",
    },
    employeeCount: {
      type: String,
      default: "0",
    },
    hiredCount: {
      type: String,
      default: "0",
    },
    location: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    certifications: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    about: {
      type: String,
      default: "",
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  { timestamps: true }
);

// Encrypt password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

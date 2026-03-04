const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "60d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, avatar, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      fullName: name,
      email,
      password,
      profileImage: avatar,
      role,
    });
    res.status(201).json({
      _id: user._id,
      name: user.fullName,
      email: user.email,
      avatar: user.profileImage,
      role: user.role,
      token: generateToken(user._id),
      companyName: user.companyName || '',
      companyDescription: user.companyDescription || '',
      companyLogo: user.companyLogo || '',
      resume: user.resume || '',
    });
  } catch (err) {
    console.error("Registration Logic Error:", err);
    res.status(500).json({ message: "Registration failed: " + err.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" })
    }
    res.json({
      _id: user._id,
      name: user.fullName,
      email: user.email,
      avatar: user.profileImage,
      role: user.role,
      token: generateToken(user._id),
      companyName: user.companyName || '',
      companyDescription: user.companyDescription || '',
      companyLogo: user.companyLogo || '',
      resume: user.resume || '',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  const user = req.user;
  res.json({
    _id: user._id,
    name: user.fullName,
    email: user.email,
    avatar: user.profileImage,
    role: user.role,
    companyName: user.companyName || '',
    companyDescription: user.companyDescription || '',
    companyLogo: user.companyLogo || '',
    resume: user.resume || '',
  });
};

exports.googleAuth = async (req, res) => {
  try {
    const { token, role } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      if (!role) {
        return res.status(202).json({ needRole: true, message: "Please select a role to finish creating your account." });
      }

      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      user = await User.create({
        fullName: name,
        email,
        password: randomPassword,
        profileImage: picture,
        role: role,
      });
    }

    res.json({
      _id: user._id,
      name: user.fullName,
      email: user.email,
      avatar: user.profileImage,
      role: user.role,
      token: generateToken(user._id),
      companyName: user.companyName || '',
      companyDescription: user.companyDescription || '',
      companyLogo: user.companyLogo || '',
      resume: user.resume || '',
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ message: "Google authentication failed" });
  }
};
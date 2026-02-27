const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requirements: {
    type: [String],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  type: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Internship"],
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },//Employer ID
  salaryMin: { type: Number },
  salaryMax: { type: Number },
  isClosed: { type: Boolean, default: false },
  deadline: { type: Date },
  capacity: { type: Number, default: 0 },
},
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
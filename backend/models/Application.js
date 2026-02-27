const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      // can store uploaded version or link
      type: String,
    },
    status: {
      type: String,
      enum: ["Applied", "Interview", "Offered", "Accepted", "Rejected"],
      default: "Applied",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // The user who triggered the notification
    },
    type: {
      type: String,
      enum: ["follow", "application", "other"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String, // Optional URL to redirect to when clicked
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    organizer: { type: String, required: true },
    imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60' },
    price: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);

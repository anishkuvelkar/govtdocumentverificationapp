const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  comment: String,
  documentUrl: String,
  status: {
    type: String,
    enum: [
      "Payment Received",
      "Admin1 Approved",
      "Admin2 Approved",
      "Rejected"
    ],
    default: "Payment Received"
  },
  admin1Response: String,  // admin1's rejection message
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Request", requestSchema);

const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    ids: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Bank", bankSchema);

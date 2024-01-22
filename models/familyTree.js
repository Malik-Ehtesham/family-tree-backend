const mongoose = require("mongoose");

const familyTreeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    // privacy: {
    //   type: String,
    //   enum: ["private", "shared", "public"],
    //   default: "private",
    // },
    // Other fields as needed
  },
  { timestamps: true }
);

const FamilyTree = mongoose.model("FamilyTree", familyTreeSchema);

module.exports = FamilyTree;

const mongoose = require("mongoose");
const crypto = require("crypto");

// Define the schema for the Member model
const memberSchema = new mongoose.Schema(
  {
    id: { type: String, default: generateHexId },
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    img: {
      type: String,
      default:
        "https://res.cloudinary.com/dcbjngmhn/image/upload/v1705896821/khetjahfr6je689ok4m9.jpg",
    },
    familyName: {
      type: String,
    },
    pids: {
      type: [String],
    },
    mid: {
      type: String,
      ref: "Member",
    },
    fid: {
      type: String,
      ref: "Member",
    },
    familyTreeId: {
      type: String,
      required: true,
      ref: "FamilyTree",
    },
    dob: {
      type: Date,
      default: null,
    },
    dod: {
      type: Date,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    inviteCode: {
      type: String,
      unique: true,
      default: generateInviteCode,
    },
    rootMember: { type: Boolean },
  },
  { timestamps: true }
);

// Create the Member model based on the schema
const Member = mongoose.model("Member", memberSchema);

// Function to generate a hexadecimal ID
function generateHexId() {
  return crypto.randomBytes(12).toString("hex"); // Adjust the length as needed
}

function generateInviteCode() {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}

// Pre-delete hook to prevent deletion of admin member
memberSchema.pre("deleteOne", function (next) {
  // Check if the member being deleted is an admin
  if (this.isAdmin) {
    const err = new Error("Admin member cannot be deleted");
    // Prevent deletion by calling next with an error
    return next(err);
  }
  // If not admin, proceed with deletion
  return next();
});

// Export the Member model to be used in other parts of your application
module.exports = Member;

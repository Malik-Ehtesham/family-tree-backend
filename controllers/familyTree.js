const FamilyTree = require("../models/familyTree");
const Member = require("../models/member");
const catchAsync = require("../utils/catchAsync");

exports.createFamilyTree = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { name, description, privacy } = req.body;

  const newFamilyTree = new FamilyTree({
    userId,
    name,
    description,
    privacy,
    // Add other fields as needed
  });

  const savedTree = await newFamilyTree.save();
  res.status(201).json(savedTree);
});

exports.getAllFamilyTrees = catchAsync(async (req, res, next) => {
  const userId = req.user._id; // Assuming user ID is available in request after authentication

  const familyTrees = await FamilyTree.find({ userId });
  res.json(familyTrees);
});

exports.getFamilyTreeById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const familyTree = await FamilyTree.findById(id);
  if (!familyTree) {
    return res.status(404).json({ message: "Family tree not found" });
  }
  res.json(familyTree);
});

exports.updateFamilyTree = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateFields = { ...req.body }; // Assuming all fields can be updated

  const updatedTree = await FamilyTree.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true }
  );
  if (!updatedTree) {
    return res.status(404).json({ message: "Family tree not found" });
  }
  res.json(updatedTree);
});

exports.deleteFamilyTree = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find and delete the family tree
  const deletedTree = await FamilyTree.findByIdAndDelete(id);
  if (!deletedTree) {
    return res.status(404).json({ message: "Family tree not found" });
  }

  // Delete all members with the familyTreeId of the deleted family tree
  await Member.deleteMany({ familyTreeId: id });

  res.json({
    message: "Family tree and associated members deleted successfully",
  });
});

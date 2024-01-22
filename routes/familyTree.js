const express = require("express");
const router = express.Router();

const familyTreeController = require("../controllers/familyTree");
const authController = require("../controllers/auth");

// Create a new family tree
router.post("/", authController.protect, familyTreeController.createFamilyTree);

// Get all family trees of a user
router.get("/", authController.protect, familyTreeController.getAllFamilyTrees);

// Get a specific family tree by ID
router.get(
  "/:id",
  authController.protect,
  familyTreeController.getFamilyTreeById
);

// Update a family tree by ID
router.put(
  "/:id",
  authController.protect,
  familyTreeController.updateFamilyTree
);

// Delete a family tree by ID
router.delete(
  "/:id",
  authController.protect,
  familyTreeController.deleteFamilyTree
);

module.exports = router;

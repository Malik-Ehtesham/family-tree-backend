const express = require("express");
const router = express.Router();

const memberController = require("../controllers/member");
const authController = require("../controllers/auth");

// Get all members By Tree
router.get("/:id", authController.protect, memberController.getAllMembers);

// Get member by ID
router.get(
  "/member/:id",
  authController.protect,
  memberController.getMemberById
);

// Create a new member
router.post("/", authController.protect, memberController.createMember);

// Create a new spouse
router.post("/spouse", authController.protect, memberController.createSpouse);

// Get Spouses
router.post("/spouses", authController.protect, memberController.getSpouses);

// Create a new child
router.post("/child", authController.protect, memberController.createChild);

// Create new parents
router.post("/parents", authController.protect, memberController.createParents);

// Update member by ID
router.put("/:id", authController.protect, memberController.updateMember);

// Delete member by ID
router.delete(
  "/:id",
  authController.protect,
  memberController.deleteMemberAndRelatedMembers
);

// Route to get a member by invite code
router.get(
  "/by-invite-code/:inviteCode",
  memberController.getMemberByInviteCode
);

module.exports = router;

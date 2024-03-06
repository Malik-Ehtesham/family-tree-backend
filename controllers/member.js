const Member = require("../models/member");
const catchAsync = require("../utils/catchAsync");
const cloudinary = require("cloudinary").v2;
const AppError = require("../utils/appError");

cloudinary.config({
  cloud_name: "dcbjngmhn",
  api_key: "665934251338653",
  api_secret: "oIwQNFFVAD1zJI6OAIskq2ie8uk",
});

exports.getAllMembers = catchAsync(async (req, res, next) => {
  // GET MEMBERS BY TREE

  const familyTreeId = req.params.id; // Assuming req.params.id represents familyTreeId
  const allMembers = await Member.find({ familyTreeId: familyTreeId });
  console.log(allMembers);

  // const orgChart = transformDataToHierarchy(allMembers);
  // console.log(orgChart);

  res.json(allMembers);
});

exports.getMemberById = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const member = await Member.find({ id: id });

  if (!member) {
    return res.status(404).json({ message: "Member not found" });
  }

  res.json(member);
});

exports.createMember = catchAsync(async (req, res, next) => {
  const {
    name,
    gender,
    rootMember,
    img,
    mid,
    fid,
    pids,
    familyTreeId,
    isAdmin,
  } = req.body;

  // CREATING A SPOUSE

  // If no existing member found, create a new member
  const member = new Member({
    name,
    gender,
    rootMember,
    img,
    mid,
    fid,
    pids,
    familyTreeId,
    isAdmin,
  });

  const newMember = await member.save();
  console.log(newMember);

  res.status(201).json({ newMember });
});

// // CREATING A SPOUSE
// exports.createSpouse = catchAsync(async (req, res, next) => {
//   const { name, gender, img, familyTreeId } = req.body;

//   // Assuming req.body.pids contains the partner id
//   const partnerId = req.body.pids;
//   console.log("PARTNER", partnerId);
//   // Create the new spouse
//   const newSpouse = new Member({
//     name,
//     gender,
//     img,
//     pids: [partnerId], // Add the partner id to the new spouse's pids
//     familyTreeId,
//   });

//   const newSpouseDocument = await newSpouse.save();

//   // Fetch the existing spouse
//   const existingSpouse = await Member.find({ id: partnerId });
//   console.log("EXISTING", existingSpouse);
//   // Update the existing spouse's pids to include the new spouse
//   if (existingSpouse) {
//     existingSpouse[0].pids.push(newSpouseDocument.id);
//     await existingSpouse[0].save();
//   }
//   res.status(201).json({ newSpouseDocument });
// });

exports.createSpouse = catchAsync(async (req, res, next) => {
  const { name, gender, familyTreeId } = req.body;

  // Assuming req.body.pids contains the partner id
  const partnerId = req.body.pids;
  console.log("PARTNER", partnerId);

  let imageUrl;

  // Check if an image file is included in the request
  if (req.files && req.files.img) {
    try {
      // Upload the image to Cloudinary
      const file = req.files.img;
      imageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
          if (err) {
            console.error(err);
            reject("Error uploading image to Cloudinary");
          } else {
            console.log(result);
            resolve(result.url);
          }
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error });
    }
  }

  // Create the new spouse
  const newSpouse = new Member({
    name,
    gender,
    img: imageUrl, // Assign the Cloudinary image URL to the spouse's img field
    pids: [partnerId], // Add the partner id to the new spouse's pids
    familyTreeId,
  });

  const newSpouseDocument = await newSpouse.save();

  // Fetch the existing spouse
  const existingSpouse = await Member.find({ id: partnerId });
  console.log("EXISTING", existingSpouse);

  // Update the existing spouse's pids to include the new spouse
  if (existingSpouse) {
    existingSpouse[0].pids.push(newSpouseDocument.id);
    await existingSpouse[0].save();
  }

  res.status(201).json({ newSpouseDocument });
});

// GETTING SPOUSE NAMES

exports.getSpouses = catchAsync(async (req, res, next) => {
  const pidsArray = req.body.pidsArray;

  const users = await Member.find({ id: { $in: pidsArray } });
  const userNamesAndIds = users.map((user) => {
    return { name: user.name, id: user.id };
  });

  res.json(userNamesAndIds);
});

// CREATING PARENTS

// CREATING PARENTS
exports.createParents = catchAsync(async (req, res, next) => {
  const { motherName, fatherName, familyTreeId } = req.body;

  // Assuming req.body.childId contains the child's id
  const childId = req.body.childId;

  // Create the mother and father objects
  const mother = new Member({
    name: motherName,
    gender: "female", // Assuming female for the mother
    pids: [], // Initialize the pids array for now
    familyTreeId,
  });

  const father = new Member({
    name: fatherName,
    gender: "male", // Assuming male for the father
    pids: [], // Initialize the pids array for now
    familyTreeId,
  });

  // Save the mother and father documents
  const motherDocument = await mother.save();
  const fatherDocument = await father.save();

  // Fetch the child
  const child = await Member.find({ id: childId });

  // Update the child's mid (motherId) and fid (fatherId) fields
  if (child.length > 0) {
    child[0].mid = motherDocument.id;
    child[0].fid = fatherDocument.id;
    await child[0].save();
  }

  // Fetch the mother and father
  const motherUpdate = await Member.find({ id: motherDocument.id });
  const fatherUpdate = await Member.find({ id: fatherDocument.id });

  // Update the pids array for both mother and father
  if (motherUpdate.length > 0 && fatherUpdate.length > 0) {
    motherUpdate[0].pids.push(fatherDocument.id);
    fatherUpdate[0].pids.push(motherDocument.id);
    await motherUpdate[0].save();
    await fatherUpdate[0].save();
  }
  res
    .status(201)
    .json({ mother: motherDocument, father: fatherDocument, child });
});

// CREATING CHILDS

// CREATING A CHILD

// TODO:

// 1. Refactor this function to handle the case when there is also img, dob and dod

exports.createChild = catchAsync(async (req, res, next) => {
  const { name, gender, img, dob, dod, motherId, fatherId, familyTreeId } =
    req.body;
  // Assuming req.body.pids contains the partner id
  const partnerId = req.body?.pids; // This should be parent id tthen we will wind the parent thriugh id then we will check its pidsSArray if array is empty create new spouse if array  is not empty then move to else block

  console.log(motherId, fatherId, partnerId);
  let parent = [];

  if (partnerId) {
    parent = await Member.find({ id: partnerId });
  }

  // console.log(parent[0].pids);s
  if (parent[0]?.pids.length === 0) {
    // Create the new spouse
    let newSpouseDocument;
    if (parent[0].gender === "male") {
      const newSpouse = new Member({
        name: "Spouse",
        gender: "female",
        pids: [partnerId], // Add the partner id to the new spouse's pids
        familyTreeId,
      });
      newSpouseDocument = await newSpouse.save();
    } else if (parent[0].gender === "female") {
      const newSpouse = new Member({
        name: "Spouse",
        gender: "male",
        pids: [partnerId], // Add the partner id to the new spouse's pids
        familyTreeId,
      });
      newSpouseDocument = await newSpouse.save();
    }

    // Fetch the existing spouse
    const existingSpouse = await Member.find({ id: partnerId });

    // Update the existing spouse's pids to include the new spouse
    if (existingSpouse) {
      existingSpouse[0].pids.push(newSpouseDocument.id);
      await existingSpouse[0].save();
    }

    let childDocument;

    if (fatherId) {
      const child = new Member({
        name: name,
        gender: gender,
        mid: newSpouseDocument.id,
        fid: fatherId,
        familyTreeId,
      });
      childDocument = await child.save();
    } else if (motherId) {
      const child = new Member({
        name: name,
        gender: gender,
        mid: motherId,
        fid: newSpouseDocument.id,
        familyTreeId,
      });
      childDocument = await child.save();
    }
    res.json({ data: childDocument });
  } else {
    let imageUrl;
    if (req.files && req.files.img) {
      try {
        // Upload the image to Cloudinary
        const file = req.files.img;
        imageUrl = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
            if (err) {
              console.error(err);
              reject("Error uploading image to Cloudinary");
            } else {
              console.log(result);
              resolve(result.url);
            }
          });
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error });
      }
    }
    const child = new Member({
      name: name,
      gender: gender,
      img: imageUrl, // Assign the Cloudinary image URL to the child's img field
      dob,
      dod,
      mid: motherId,
      fid: fatherId,
      familyTreeId,
    });

    const childDocument = await child.save({ validateBeforeSave: false });
    console.log("BUDDY", childDocument);
    res.json({ data: childDocument });
  }
});

// exports.createChild = catchAsync(async (req, res, next) => {
//   const { name, gender, familyTreeId, motherId, fatherId } = req.body;

//   // Check if the member already has a spouse
//   const existingSpouse = await Member.findOne({
//     pids: { $in: [motherId, fatherId] },
//   });

//   if (!existingSpouse) {
//     // If the member doesn't have a spouse, create a spouse first
//     const spouse = new Member({
//       name: "Spouse", // You can customize the spouse details
//       gender: "Unknown", // You can customize the spouse details
//       pids: [motherId, fatherId],
//       familyTreeId,
//     });

//     const spouseDocument = await spouse.save();

//     // Update the pids array for both member and spouse
//     await Member.findByIdAndUpdate(motherId, {
//       $push: { pids: spouseDocument.id },
//     });

//     await Member.findByIdAndUpdate(fatherId, {
//       $push: { pids: spouseDocument.id },
//     });

//     // Now, continue with creating the child
//     const child = new Member({
//       name: name,
//       gender: gender,
//       mid: motherId,
//       fid: fatherId,
//       familyTreeId,
//     });

//     const childDocument = await child.save();

//     res.status(201).json({ childDocument, spouseDocument });
//   } else {
//     // If the member already has a spouse, create the child and update mid and fid
//     const child = new Member({
//       name: name,
//       gender: gender,
//       mid: motherId,
//       fid: fatherId,
//       familyTreeId,
//     });

//     const childDocument = await child.save();

//     // Update mid and fid for the child
//     await Member.findByIdAndUpdate(
//       childDocument._id,
//       { $set: { mid: motherId, fid: fatherId } },
//       { new: true }
//     );

//     res.status(201).json({ childDocument });
//   }
// });

// exports.updateMember = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const updateFields = {};
//   for (const field in req.body) {
//     updateFields[field] = req.body[field];
//   }

//   const member = await Member.findByIdAndUpdate(
//     id,
//     { $set: updateFields },
//     { new: true }
//   );

//   if (!member) {
//     return res.status(404).json({ message: "Member not found" });
//   }

//   res.json(member);
// });

// --------------------------------------------------------------------------------- //

// Assuming you have already configured Cloudinary as mentioned earlier

// exports.deleteMemberAndRelatedMembers = catchAsync(async (req, res, next) => {
//   const memberId = req.params.id;

//   // Find and delete the member
//   const deletedMember = await Member.findOneAndDelete({ id: memberId });

//   if (!deletedMember) {
//     return res.status(404).json({ message: "Member not found" });
//   }

//   // Delete all other members with the member's id in their mid or fid field
//   await Member.deleteMany({ $or: [{ mid: memberId }, { fid: memberId }] });

//   res.json({ message: "Member and related members deleted successfully" });
// });

exports.updateMember = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, gender, dob, dod } = req.body;
  console.log("YO", req.body);

  let imageUrl;

  // Check if an image file is included in the request
  if (req.files && req.files.img) {
    try {
      // Upload the new image to Cloudinary
      const file = req.files.img;
      imageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
          if (err) {
            console.error(err);
            reject("Error uploading image to Cloudinary");
          } else {
            console.log(result);
            resolve(result.url);
          }
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error });
    }
  }

  // Find the member to update
  const memberToUpdate = await Member.findOne({ id: id });

  if (!memberToUpdate) {
    return res.status(404).json({ message: "Member not found" });
  }

  // Update the member with the new fields, handling null values for dod
  if (name !== undefined) {
    memberToUpdate.name = name;
  }

  if (gender !== undefined) {
    memberToUpdate.gender = gender;
  }

  if (imageUrl !== undefined) {
    memberToUpdate.img = imageUrl;
  }

  if (dob !== undefined) {
    const convertedValue = dob === "null" ? null : dob;
    memberToUpdate.dob = convertedValue;
  }

  // Handle null value for dod separately
  if (dod !== undefined) {
    const convertedValue = dod === "null" ? null : dod;
    memberToUpdate.dod = convertedValue;
  }

  const updatedMember = await memberToUpdate.save();
  console.log(updatedMember);
  res.json(updatedMember);
});

// exports.deleteMemberAndRelatedMembers = catchAsync(async (req, res, next) => {
//   const memberId = req.params.id;

//   try {
//     // Step 1: Find and delete the member
//     const deletedMember = await Member.findOneAndDelete({ id: memberId });

//     if (!deletedMember) {
//       return res.status(404).json({ message: "Member not found" });
//     }

//     // Step 2: Delete all other members with the member's id in their mid or fid field
//     await Member.deleteMany({ $or: [{ mid: memberId }, { fid: memberId }] });

//     // Step 3: Get the IDs from the pidsArray of the member being deleted
//     const deletedMemberPids = deletedMember.pids;
//     console.log("Deleted Member Pids:", deletedMemberPids);

//     // Step 4: Find all members whose pidsArray contains any of these IDs
//     const membersToUpdate = await Member.find({
//       pids: { $elemMatch: { $in: deletedMemberPids } },
//     });

//     console.log("Members to Update:", membersToUpdate);

//     // Step 5: Remove the ID of the member being deleted from the pidsArray of other members
//     for (const memberToUpdate of membersToUpdate) {
//       console.log("Updating Member:", memberToUpdate);
//       memberToUpdate.pids = memberToUpdate.pids.filter(
//         (pid) => pid !== memberId
//       );
//       await memberToUpdate.save();
//     }

//     res.json({ message: "Member and related members deleted successfully" });
//   } catch (error) {
//     // Check if the error is due to attempting to delete an admin member
//     if (error.message === "Admin member cannot be deleted") {
//       return res
//         .status(403)
//         .json({ message: "Admin member cannot be deleted" });
//     }
//     // If it's another type of error, pass it to the error handling middleware
//     next(error);
//   }
// });

// exports.deleteMemberAndRelatedMembers = catchAsync(async (req, res, next) => {
//   const memberId = req.params.id;

//   try {
//     // Step 1: Find the member
//     const member = await Member.findOne({ id: memberId });

//     // if (!member) {
//     //   return res.status(404).json({ message: "Member not found" });
//     // }

//     // // Check if the member is an admin
//     // if (member.isAdmin) {
//     //   return res
//     //     .status(403)
//     //     .json({ message: "Admin member cannot be deleted" });
//     // }

//     // Step 2: Delete the member
//     const deletedMember = await Member.findOneAndDelete({ id: memberId });

//     // Step 3: Delete all other members with the member's id in their mid or fid field
//     // await Member.deleteMany({ $or: [{ mid: memberId }, { fid: memberId }] });

//     // Step 4: Get the IDs from the pidsArray of the member being deleted
//     // const deletedMemberPids = deletedMember.pids;
//     // console.log("Deleted Member Pids:", deletedMemberPids);

//     // Step 5: Find all members whose pidsArray contains any of these IDs
//     // const membersToUpdate = await Member.find({
//     // pids: { $elemMatch: { $in: deletedMemberPids } },
//     // });

//     // console.log("Members to Update:", membersToUpdate);

//     // Step 6: Remove the ID of the member being deleted from the pidsArray of other members
//     // for (const memberToUpdate of membersToUpdate) {
//     // console.log("Updating Member:", memberToUpdate);
//     // memberToUpdate.pids = memberToUpdate.pids.filter(
//     // (pid) => pid !== memberId
//     // );
//     // await memberToUpdate.save();
//     // }

//     res.json({ message: "Member  deleted successfully" });
//   } catch (error) {
//     // Check if the error is due to attempting to delete an admin member
//     if (error.message === "Admin member cannot be deleted") {
//       return res
//         .status(403)
//         .json({ message: "Admin member cannot be deleted" });
//     }
//     // If it's another type of error, pass it to the error handling middleware
//     next(error);
//   }
// });

exports.deleteMemberAndRelatedMembers = catchAsync(async (req, res, next) => {
  const memberId = req.params.id;

  try {
    // Step 1: Find the member
    const member = await Member.findOne({ id: memberId });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Check if the member is an admin
    if (member.isAdmin) {
      return res
        .status(403)
        .json({ message: "Admin member cannot be deleted" });
    }

    // Step 2: Remove the member's id from the fids of all members
    await Member.updateMany({ fid: memberId }, { fid: null });

    // Step 3: Remove the member's id from the mids of all members
    await Member.updateMany({ mid: memberId }, { mid: null });

    // Step 4: Remove the member's id from the pids of all members
    await Member.updateMany({ pids: memberId }, { $pull: { pids: memberId } });

    // Step 5: Delete the member
    await Member.findOneAndDelete({ id: memberId });

    res.json({ message: "Member and related references deleted successfully" });
  } catch (error) {
    // Check if the error is due to attempting to delete an admin member
    if (error.message === "Admin member cannot be deleted") {
      return res
        .status(403)
        .json({ message: "Admin member cannot be deleted" });
    }
    // If it's another type of error, pass it to the error handling middleware
    next(error);
  }
});

// Controller to get a member by matching invite code
exports.getMemberByInviteCode = catchAsync(async (req, res, next) => {
  const inviteCode = req.params.inviteCode; // Assuming invite code is passed as a route parameter

  // Query the Member collection to find the member with the matching invite code
  const member = await Member.findOne({ id: inviteCode });

  if (!member) {
    return next(new AppError("Member not found with the provided invite code"));
  }

  // If a member is found, retrieve the familyTreeId associated with that member
  // const familyTreeId = member.familyTreeId;

  // Return the familyTreeId as a response
  res.json({ member });
});

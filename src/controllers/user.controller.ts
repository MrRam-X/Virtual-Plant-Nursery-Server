import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { User } from "../models/user.model";
import mongoose from "mongoose";

// @desc    Update user profile (Name and Address)
// @route   PUT /api/account/profile
// @access  Private (Requires Token)
export const updateUserProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Safety check for TypeScript
    if (!req.user) {
      res.status(401).json({ message: "User not found in request" });
      return;
    }

    // req.user._id is safely typed thanks to AuthRequest
    const user = await User.findById(req.user._id);

    if (user) {
      // Update Name
      user.name = req.body.name || user.name;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        address: updatedUser.address,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add a new labeled address to user profile
// @route   POST /api/account/address
// @access  Private
export const addUserAddress = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not found in request" });
      return;
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const {
      label,
      addressLine1,
      addressLine2,
      city,
      district,
      state,
      zipCode,
      country,
    } = req.body;

    if (!label) {
      res
        .status(400)
        .json({ message: "Address label is required (e.g., Home, Office)" });
      return;
    }

    // UNIQUE LABEL CHECK:
    // We convert both to lowercase so "Home" and "home" are treated as the same label
    const labelExists = user.address.some(
      (addr) => addr.label.toLowerCase() === label.toLowerCase(),
    );

    if (labelExists) {
      res.status(400).json({
        message: `An address with the label '${label}' already exists.`,
      });
      return;
    }

    // Push the new address into the array
    user.address.push({
      label,
      addressLine1: addressLine1 || "",
      addressLine2: addressLine2 || "",
      city: city || "",
      district: district || "",
      state: state || "",
      zipCode: zipCode || "",
      country: country || "",
    });

    const updatedUser = await user.save();

    // Return the newly updated address array
    res.status(201).json({
      message: "Address added successfully",
      addresses: updatedUser.address,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a specific address by its label (Trims spaces & prevents identical updates)
// @route   PUT /api/account/address/:label
// @access  Private
export const updateUserAddress = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not found in request" });
      return;
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Decode and trim the target label from the URL just in case
    const targetLabel = decodeURIComponent(req.params.label).trim();

    // 1. Destructure the updated fields
    let {
      label: newLabel,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
    } = req.body;

    // 2. TRIM WHITESPACES:
    // The optional chaining (?.) ensures we don't crash if a field was not sent in the request.
    // E.g., "   Home  " becomes "Home"
    newLabel = newLabel?.trim();
    addressLine1 = addressLine1?.trim();
    addressLine2 = addressLine2?.trim();
    city = city?.trim();
    state = state?.trim();
    zipCode = zipCode?.trim();
    country = country?.trim();

    // 3. Find the address by the target label
    const addressIndex = user.address.findIndex(
      (addr) => addr.label.toLowerCase() === targetLabel.toLowerCase(),
    );

    if (addressIndex === -1) {
      res.status(404).json({
        message: `Address with the label '${targetLabel}' not found.`,
      });
      return;
    }

    const existingAddress = user.address[addressIndex];
    let hasChanges = false;

    // 4. Check for Label change
    if (newLabel !== undefined && newLabel !== existingAddress.label) {
      // If the label is actually changing its spelling (not just case), check for duplicates
      if (newLabel.toLowerCase() !== existingAddress.label.toLowerCase()) {
        const labelExists = user.address.some(
          (addr) => addr.label.toLowerCase() === newLabel.toLowerCase(),
        );

        if (labelExists) {
          res.status(400).json({
            message: `You already have an address labeled '${newLabel}'.`,
          });
          return;
        }
      }
      existingAddress.label = newLabel;
      hasChanges = true;
    }

    // 5. Compare and update only the fields that are different (using the trimmed values)
    if (
      addressLine1 !== undefined &&
      existingAddress.addressLine1 !== addressLine1
    ) {
      existingAddress.addressLine1 = addressLine1;
      hasChanges = true;
    }
    if (
      addressLine2 !== undefined &&
      existingAddress.addressLine2 !== addressLine2
    ) {
      existingAddress.addressLine2 = addressLine2;
      hasChanges = true;
    }
    if (city !== undefined && existingAddress.city !== city) {
      existingAddress.city = city;
      hasChanges = true;
    }
    if (state !== undefined && existingAddress.state !== state) {
      existingAddress.state = state;
      hasChanges = true;
    }
    if (zipCode !== undefined && existingAddress.zipCode !== zipCode) {
      existingAddress.zipCode = zipCode;
      hasChanges = true;
    }
    if (country !== undefined && existingAddress.country !== country) {
      existingAddress.country = country;
      hasChanges = true;
    }

    // 6. BACKEND VALIDATION: Block the update if there are no real changes
    if (!hasChanges) {
      res.status(400).json({
        message:
          "No changes detected. The provided address details are identical to the existing ones.",
      });
      return;
    }

    // 7. Save the document
    const updatedUser = await user.save();

    res.json({
      message: "Address updated successfully",
      addresses: updatedUser.address,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// @desc    Delete a specific address by its id
// @route   DELETE /api/account/address/:id
// @access  Private
export const deleteUserAddress = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not found in request" });
      return;
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const targetId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      res.status(400).json({ message: "Invalid address ID" });
      return;
    }

    // Check if address exists
    const addressExists = user.address.some(
      (addr) => addr?._id?.toString() === targetId
    );

    if (!addressExists) {
      res.status(404).json({
        message: `Address with id '${targetId}' not found.`,
      });
      return;
    }

    // Remove the address
    user.address = user.address.filter(
      (addr) => addr?._id?.toString() !== targetId
    );

    const updatedUser = await user.save();

    res.json({
      message: "Address removed successfully",
      addresses: updatedUser.address,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

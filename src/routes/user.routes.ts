import express from "express";
import {
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// The protect middleware runs first, attaching req.user
router.put("/profile", protect, updateUserProfile);
router.post("/address", protect, addUserAddress);
router.patch("/address/:id", protect, updateUserAddress);
router.delete("/address/:id", protect, deleteUserAddress);

export default router;

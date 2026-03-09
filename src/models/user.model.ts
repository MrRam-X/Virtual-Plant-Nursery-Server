import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // NOT required because Google/GitHub users won't have a password
  },
  googleId: {
    type: String,
    default: null,
  },
  githubId: {
    type: String,
    default: null,
  },
  avatar: {
    type: String,
    default: '',
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'github'],
    required: true,
  }
}, { timestamps: true });

// Pre-save hook: Hash password before saving to the database
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new) AND it exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = model('User', userSchema);
import { Schema, model, Document, Types } from "mongoose";
import bcrypt from 'bcrypt'

// 1. Define the Address Interface
export interface IAddress {
  _id?: Types.ObjectId
  label: string; // e.g., "Home", "Office"
  addressLine1: string;
  addressLine2: string;
  city?: string;
  district?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// 2. Define the main User Interface
export interface IUser extends Document {
  _id: Types.ObjectId
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  githubId?: string;
  avatar?: string;
  authProvider: 'local' | 'google' | 'github';
  address: IAddress[];
}

const addressSchema = new Schema<IAddress>({
  label: { type: String, required: true, trim: true },
  addressLine1: { type: String, default: '' },
  addressLine2: { type: String, default: '' },
  city: { type: String, default: '' },
  district: { type: String, default: '' },
  state: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  country: { type: String, default: '' }
}, { _id: true });

const userSchema = new Schema<IUser>({
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
  },
  address:[addressSchema]
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

export const User = model<IUser>('User', userSchema);
import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  category: string;
  discount: string;
  discountedPrice: number;
  currency: string;
  rating: number;
  careGuide: Record<string, string>;
  shippingDetails: string;
  imageUrl: string[];
  reviews: number;
  inStock: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    discount: { type: String, default: "0%" },
    discountedPrice: { type: Number, required: true },
    currency: { type: String, default: "₹" },
    rating: { type: Number, default: 0 },
    careGuide: {
      type: Map,
      of: String,
      default: {},
    },
    shippingDetails: { type: String, required: true },
    imageUrl: { type: [String], default: [] },
    reviews: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export const Product = model<IProduct>("Product", ProductSchema);

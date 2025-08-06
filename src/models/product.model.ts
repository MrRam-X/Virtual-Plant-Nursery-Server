import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  discount: string;
  discountedPrice: number;
  currency: string;
  rating: number;
  careGuide: string;
  shippingDetails: string;
  imageUrl: string[];
  reviews: number;
  inStock: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
    },

    discount: {
      type: String,
      default: '0%',
    },

    discountedPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: '₹',
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    careGuide: {
      type: String,
      default: '',
    },

    shippingDetails: {
      type: String,
      default: '',
    },

    imageUrl: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'At least one image URL is required.',
      },
    },

    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Optional: recompute discountedPrice on save based on price & discount
// productSchema.pre('save', function (next) {
//   const raw = parseFloat(this.discount.replace('%', ''));
//   this.discountedPrice = this.price * (1 - raw / 100);
//   next();
// });

export const Product = model<IProduct>('Product', productSchema);
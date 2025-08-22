import { Request, Response } from "express";
import { Product, IProduct } from "../models/product.model";
import mongoose from "mongoose";

// FIND ALL PRODUCTS
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 9, 1);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().skip(skip).limit(limit).lean(),
      Product.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      limit,
      total,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      data: products,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// FIND A PARTICULAR PRODUCT
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
};

// ADD A NEW PRODUCT
export const createProduct = async (req: Request, res: Response) => {
  const data: Partial<IProduct> = req.body;
  const newProduct = await Product.create(data);
  res.status(201).json(newProduct);
};

// UPDATE A PARTICULAR PRODUCT
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: Partial<IProduct> = req.body;
  const updated = await Product.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
};

// DELETE A PARTICULAR PRODUCT
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
};

// FIND TOP 4 NEWLY ADDED PRODUCTS AS FEATURED PRODUCTS
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 4;

    const featured = await Product.find().sort({ createdAt: -1 }).limit(limit);

    res.json(featured);
  } catch (err) {
    console.error("Error fetching featured products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// FIND TOP 4 NEWLY ADDED SIMILAR CATEGORY PRODUCTS
export const getSimilarProducts = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const limit = parseInt(req.query.limit as string) || 4;

    if (!category) {
      return res
        .status(400)
        .json({ error: "Category query param is required" });
    }

    const similar = await Product.find({ category })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(similar);
  } catch (err) {
    console.error("Error fetching similar products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

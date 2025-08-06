import { Request, Response } from 'express';
import { Product, IProduct } from '../models/product.model';
import mongoose from 'mongoose';

// FIND ALL PRODUCTS
export const getAllProducts = async (_req: Request, res: Response) => {
  const products = await Product.find();
  res.json(products);
};

// FIND A PARTICULAR PRODUCT
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ error: 'Not found' });
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

  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
};

// DELETE A PARTICULAR PRODUCT
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
};
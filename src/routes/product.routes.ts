import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getSimilarProducts,
} from '../controllers/product.controller';

const router = Router();

router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/similar', getSimilarProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
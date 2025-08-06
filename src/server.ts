import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import productRoutes from "./routes/product.routes";
import { BASE_URL, ROUTES } from "./appConstant";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use(`${BASE_URL}/${ROUTES.PRODUCTS}`, productRoutes);

// Server start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

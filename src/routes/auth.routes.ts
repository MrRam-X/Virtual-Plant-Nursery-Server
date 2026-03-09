import { Router } from "express";
import {
  registerLocal,
  loginLocal,
  loginGoogle,
  loginGithub,
} from "../controllers/auth.controller";

const router = Router();

// Local Auth Routes
router.post('/register', registerLocal);
router.post('/login', loginLocal);

// Social Auth Routes
router.post('/login-google', loginGoogle);
router.post('/login-github', loginGithub);

export default router
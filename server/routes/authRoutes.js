import express from 'express';
import {
  registerUser,
  loginUser,
  getMyProfile,
  getAdminSummary,
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMyProfile);
router.get('/admin-access', protect, adminOnly, getAdminSummary);

export default router;

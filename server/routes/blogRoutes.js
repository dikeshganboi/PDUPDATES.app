import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getBlogSuggestions,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleLikeBlog,
  getRelatedBlogs,
} from '../controllers/blogController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllBlogs);
router.get('/suggestions', getBlogSuggestions);
router.get('/id/:id', protect, adminOnly, getBlogById);
router.get('/:slug/related', getRelatedBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/', protect, adminOnly, createBlog);
router.post('/:id/like', protect, toggleLikeBlog);
router.put('/:id', protect, adminOnly, updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

export default router;

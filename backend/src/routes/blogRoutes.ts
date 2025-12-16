import express from 'express';
import {
  getBlogs,
  getRecentBlogs,
  searchBlogs,
  getMyBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  getAllBlogsAdmin,
} from '../controllers/blogController';
import { protect, optionalAuth } from '../middleware/auth';

const router = express.Router();

router.get('/', optionalAuth, getBlogs);
router.get('/recent', optionalAuth, getRecentBlogs);
router.get('/search', optionalAuth, searchBlogs);
router.get('/my-blogs', protect, getMyBlogs);
router.get('/admin/all-blogs', protect, getAllBlogsAdmin);
router.get('/:id', optionalAuth, getBlog);
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);
router.post('/:id/like', protect, toggleLike);

export default router;

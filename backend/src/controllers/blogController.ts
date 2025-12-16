import { Response } from 'express';
import Blog from '../models/Blog';
import Comment from '../models/Comment';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public/Private
export const getBlogs = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    let query: any = { status: 'published', isPublic: true };
    
    // If user is logged in, also show private published blogs (members only)
    if (req.user) {
      query = { status: 'published' }; // Show all published blogs (both public and private)
    }

    const blogs = await Blog.find(query)
      .populate('createdBy', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get recent blogs for homepage
// @route   GET /api/blogs/recent
// @access  Public/Private
export const getRecentBlogs = async (req: AuthRequest, res: Response) => {
  try {
    let query: any = { status: 'published', isPublic: true };
    
    // If user is logged in, also show private published blogs (members only)
    if (req.user) {
      query = { status: 'published' }; // Show all published blogs (both public and private)
    }

    const blogs = await Blog.find(query)
      .populate('createdBy', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Search blogs
// @route   GET /api/blogs/search
// @access  Public/Private
export const searchBlogs = async (req: AuthRequest, res: Response) => {
  try {
    const searchTerm = req.query.q as string;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required',
      });
    }

    let query: any = {
      status: 'published',
      isPublic: true,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { excerpt: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    // If user is logged in, also show private published blogs
    if (req.user) {
      query = {
        status: 'published',
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { excerpt: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } },
        ],
      };
    }

    const blogs = await Blog.find(query)
      .populate('createdBy', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get my blogs
// @route   GET /api/blogs/my-blogs
// @access  Private
export const getMyBlogs = async (req: AuthRequest, res: Response) => {
  try {
    const blogs = await Blog.find({ createdBy: req.user!._id })
      .populate('createdBy', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public/Private
export const getBlog = async (req: AuthRequest, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email profileImage')
      .populate('likes', 'firstName lastName')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'firstName lastName profileImage',
        },
      });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Draft blogs should only be visible to the owner or admin
    if (blog.status === 'draft') {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to view this blog',
        });
      }
      if (blog.createdBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this draft blog',
        });
      }
    }

    // Private published blogs can be seen by any logged-in user
    if (blog.status === 'published' && !blog.isPublic && !req.user) {
      return res.status(403).json({
        success: false,
        message: 'This blog is only visible to logged-in members',
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
export const createBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, excerpt, coverImage, isPublic, status } = req.body;

    const blog = await Blog.create({
      title,
      content,
      excerpt,
      coverImage,
      isPublic,
      status: status || 'draft',
      createdBy: req.user!._id,
    });

    // Create notification for all users
    const allUsers = await require('../models/User').default.find({ _id: { $ne: req.user!._id } });
    
    const notifications = allUsers.map((user: any) => ({
      user: user._id,
      type: 'blog',
      title: 'New Blog Posted',
      message: `${req.user!.firstName} published a new blog: ${title}`,
      link: `/blogs/${blog._id}`,
      isRead: false,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
export const updateBlog = async (req: AuthRequest, res: Response) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Allow admin or blog owner to update
    if (blog.createdBy.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog',
      });
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
export const deleteBlog = async (req: AuthRequest, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // Allow admin or blog owner to delete
    if (blog.createdBy.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog',
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Like/Unlike blog
// @route   POST /api/blogs/:id/like
// @access  Private
export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    const userIndex = blog.likes.findIndex(
      (id) => id.toString() === req.user!._id.toString()
    );

    if (userIndex > -1) {
      blog.likes.splice(userIndex, 1);
    } else {
      blog.likes.push(req.user!._id);
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message: userIndex > -1 ? 'Blog unliked' : 'Blog liked',
      likes: blog.likes.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all blogs for admin dashboard (all users' blogs)
// @route   GET /api/blogs/admin/all-blogs
// @access  Private (Admin only)
export const getAllBlogsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access admin dashboard',
      });
    }

    const blogs = await Blog.find({})
      .populate('createdBy', 'firstName lastName email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

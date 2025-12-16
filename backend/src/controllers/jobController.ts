import { Response } from 'express';
import Job from '../models/Job';
import JobApplication from '../models/JobApplication';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public/Private
export const getJobs = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    let query: any = {};

    // Show only public (published) jobs, not drafts
    query.isPublic = true;

    const jobs = await Job.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: jobs,
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

// @desc    Get recent jobs for homepage
// @route   GET /api/jobs/recent
// @access  Public
export const getRecentJobs = async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {
      isPublic: true // Show only published jobs, not drafts
    };

    const jobs = await Job.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Search jobs
// @route   GET /api/jobs/search
// @access  Public
export const searchJobs = async (req: AuthRequest, res: Response) => {
  try {
    const searchTerm = req.query.q as string;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required',
      });
    }

    const query: any = {
      isPublic: true,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { company: { $regex: searchTerm, $options: 'i' } },
        { location: { $regex: searchTerm, $options: 'i' } },
        { jobType: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    const jobs = await Job.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public/Private
export const getJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', 'firstName lastName email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (!req.user && !job.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'This job posting is private',
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, company, location, jobType, salary, applicationDeadline, coverImage, isPublic } = req.body;

    const job = await Job.create({
      title,
      description,
      company,
      location,
      jobType,
      salary,
      applicationDeadline,
      coverImage,
      isPublic,
      createdBy: req.user!._id,
    });

    // Create notification for all users only if job is published (not draft)
    if (isPublic) {
      const allUsers = await require('../models/User').default.find({ _id: { $ne: req.user!._id } });
      
      const notifications = allUsers.map((user: any) => ({
        user: user._id,
        type: 'job',
        title: 'New Job Posted',
        message: `${req.user!.firstName} posted a new job: ${title}`,
        link: `/jobs/${job._id}`,
        isRead: false,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check ownership or admin role
    const isOwner = job.createdBy.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job',
      });
    }

    // Check if the job is being published (draft -> published)
    const wasPrivate = !job.isPublic;
    const isNowPublic = req.body.isPublic === true;
    const isBeingPublished = wasPrivate && isNowPublic;

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // If job is being published, create notifications for all users
    if (isBeingPublished && job) {
      const allUsers = await require('../models/User').default.find({ _id: { $ne: req.user!._id } });
      
      const notifications = allUsers.map((user: any) => ({
        user: user._id,
        type: 'job',
        title: 'New Job Published',
        message: `${req.user!.firstName} published a new job: ${job!.title}`,
        link: `/jobs/${job!._id}`,
        isRead: false,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(200).json({
      success: true,
      message: isBeingPublished ? 'Job published successfully!' : 'Job updated successfully',
      data: job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check ownership or admin role
    const isOwner = job.createdBy.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job',
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get user's created jobs
// @route   GET /api/jobs/my-jobs
// @access  Private
export const getMyJobs = async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await Job.find({ createdBy: req.user!._id })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get user's applied jobs
// @route   GET /api/jobs/my-applied-jobs
// @access  Private
export const getMyAppliedJobs = async (req: AuthRequest, res: Response) => {
  try {
    // Find all applications for this user
    const applications = await JobApplication.find({
      $or: [
        { user: req.user!._id },
        { email: req.user!.email },
      ],
    })
      .populate({
        path: 'job',
        populate: {
          path: 'createdBy',
          select: 'firstName lastName',
        },
      })
      .sort({ createdAt: -1 });

    // Filter out applications where job was deleted
    const validApplications = applications.filter(app => app.job !== null);

    res.status(200).json({
      success: true,
      data: validApplications,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get applicants for a job
// @route   GET /api/jobs/:id/applicants
// @access  Private
export const getJobApplicants = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.createdBy.toString() !== req.user!._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applicants',
      });
    }

    const applicants = await JobApplication.find({ job: job._id })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applicants,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Apply for job
// @route   POST /api/jobs/:id/apply
// @access  Public
export const applyForJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    const { firstName, lastName, email, phone, coverLetter, resumeUrl } = req.body;

    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      job: job._id,
      email: email,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Already applied for this job',
      });
    }

    const application = await JobApplication.create({
      job: job._id,
      user: req.user?._id,
      firstName,
      lastName,
      email,
      phone,
      coverLetter,
      resumeUrl,
    });

    job.applications.push(application._id);
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all jobs for admin dashboard (all users' jobs)
// @route   GET /api/jobs/admin/all-jobs
// @access  Private (Admin only)
export const getAllJobsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access admin dashboard',
      });
    }

    const jobs = await Job.find({})
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { sendEmail } from '../utils/email';

// Generate JWT Token
const generateToken = (id: string): string => {
  // @ts-ignore - jwt.sign type overload issue
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'secret', 
    { expiresIn: '7d' }
  );
};

// Name validation helper (only English letters, apostrophe, and period)
const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (!name || !name.trim()) {
    return { isValid: false, message: 'Name is required' };
  }
  if (!/^[a-zA-Z'.\s]+$/.test(name.trim())) {
    return { isValid: false, message: 'Name must contain only English letters, apostrophes, and periods' };
  }
  return { isValid: true };
};

// Phone validation helper (only +, (, ), -, and numbers)
const validatePhone = (phone: string): { isValid: boolean; message?: string } => {
  if (phone && !/^[0-9+()\-\s]*$/.test(phone.trim())) {
    return { isValid: false, message: 'Phone must contain only numbers, +, (, ), and -' };
  }
  return { isValid: true };
};

// Email validation helper
const validateEmailFormat = (email: string): { isValid: boolean; message?: string } => {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { isValid: false, message: 'Please provide a valid email address' };
  }
  return { isValid: true };
};

// Password validation helper function
const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, message: 'Password must include letters' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must include numbers' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Password must include special characters' };
  }
  return { isValid: true };
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    let { firstName, lastName, email, password, organization, profession, phone } = req.body;

    // Trim all string fields
    firstName = firstName?.trim();
    lastName = lastName?.trim();
    email = email?.trim();
    organization = organization?.trim();
    profession = profession?.trim();
    phone = phone?.trim();

    // Validate first name
    const firstNameValidation = validateName(firstName);
    if (!firstNameValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: firstNameValidation.message,
      });
    }

    // Validate last name
    const lastNameValidation = validateName(lastName);
    if (!lastNameValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: lastNameValidation.message,
      });
    }

    // Validate email format
    const emailValidation = validateEmailFormat(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
      });
    }

    // Validate organization if provided
    if (organization) {
      const orgValidation = validateName(organization);
      if (!orgValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Organization ' + orgValidation.message?.toLowerCase(),
        });
      }
    }

    // Validate profession if provided
    if (profession) {
      const profValidation = validateName(profession);
      if (!profValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Profession ' + profValidation.message?.toLowerCase(),
        });
      }
    }

    // Validate phone if provided
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: phoneValidation.message,
      });
    }

    // Validate password format
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      organization,
      profession,
      phone,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: user.organization,
        profession: user.profession,
        phone: user.phone,
        profileImage: user.profileImage,
        isActive: user.isActive,
        subscriptionTier: user.subscriptionTier,
        subscriptionExpiry: user.subscriptionExpiry,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;

    // Trim fields
    email = email?.trim();
    password = password?.trim();

    // Validate input - Test 5: Empty fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Validate email format
    const emailValidation = validateEmailFormat(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
      });
    }

    // Validate password format
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // Check for user with password field - Test 6, 7: Invalid user/email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password - Test 8: Invalid password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active - Test 4: Inactive user
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
        accountStatus: 'inactive',
      });
    }

    // Check subscription status
    let subscriptionStatus = 'active';
    const now = new Date();
    
    // Test 3: Expired subscription
    if (user.subscriptionTier === 'paid' && user.subscriptionExpiry && user.subscriptionExpiry < now) {
      subscriptionStatus = 'expired';
    }

    const token = generateToken(user._id.toString());

    // Test 1, 2, 3: Valid login with different subscription statuses
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: user.organization,
        profession: user.profession,
        phone: user.phone,
        profileImage: user.profileImage,
        isActive: user.isActive,
        subscriptionTier: user.subscriptionTier,
        subscriptionExpiry: user.subscriptionExpiry,
        subscriptionStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    let { email } = req.body;

    // Trim email
    email = email?.trim();

    // Test 6: Validate email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    // Test 5: Validate email format
    const emailValidation = validateEmailFormat(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
      });
    }

    // Test 4: Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
      });
    }

    // Generate reset token (works for both active and inactive users - Tests 2, 3)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Test 3: Include account status info in email for inactive users
    const accountStatusMessage = !user.isActive 
      ? '<p><strong>Note:</strong> Your account is currently inactive. If you believe this is an error, please contact support.</p>'
      : '';

    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 30 minutes.</p>
      ${accountStatusMessage}
      <p>If you didn't request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: message,
      });

      // Test 2, 3: Success response for both active and inactive users
      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully. Please check your inbox.',
        accountStatus: user.isActive ? 'active' : 'inactive',
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token from URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const authToken = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token: authToken,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organization: user.organization,
        profession: user.profession,
        phone: user.phone,
        profileImage: user.profileImage,
        isActive: user.isActive,
        subscriptionTier: user.subscriptionTier,
        subscriptionExpiry: user.subscriptionExpiry,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, organization, profession } = req.body;
    const userId = (req as any).user._id;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another account',
        });
      }
    }

    // Prepare update data
    const updateData: any = {
      firstName,
      lastName,
      email,
      phone,
      organization,
      profession,
    };

    // Handle profile image upload
    if (req.file) {
      // Generate URL for the uploaded image
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organization: user.organization,
        profession: user.profession,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

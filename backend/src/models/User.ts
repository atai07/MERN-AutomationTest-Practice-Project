import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  organization?: string;
  profession?: string;
  phone?: string;
  socialMediaLink?: string;
  profileImage?: string;
  isActive: boolean;
  subscriptionTier: 'free' | 'paid';
  subscriptionExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    organization: {
      type: String,
      trim: true,
    },
    profession: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    socialMediaLink: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscriptionTier: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free',
    },
    subscriptionExpiry: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', userSchema);

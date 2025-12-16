import mongoose, { Document, Schema } from 'mongoose';

export interface IJobApplication extends Document {
  job: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  coverLetter?: string;
  resumeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
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
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema);

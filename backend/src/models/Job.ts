import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  company: string;
  location: string;
  jobType: string;
  salary?: string;
  applicationDeadline?: Date;
  coverImage: string;
  isPublic: boolean;
  createdBy: mongoose.Types.ObjectId;
  applications: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
    },
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
    },
    salary: {
      type: String,
      trim: true,
    },
    applicationDeadline: {
      type: Date,
    },
    coverImage: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'JobApplication',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IJob>('Job', jobSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IEventRegistration extends Document {
  event: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  organization: string;
  profession: string;
  email: string;
  phone: string;
  socialMediaLink?: string;
  question?: string;
  paymentStatus: 'pending' | 'completed' | 'free';
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventRegistrationSchema = new Schema<IEventRegistration>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
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
    organization: {
      type: String,
      required: false,
      trim: true,
    },
    profession: {
      type: String,
      required: false,
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
    socialMediaLink: {
      type: String,
      trim: true,
    },
    question: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'free'],
      default: 'pending',
    },
    paymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEventRegistration>('EventRegistration', eventRegistrationSchema);

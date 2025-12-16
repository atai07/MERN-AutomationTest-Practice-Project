import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  duration: string;
  location: string;
  price: number;
  coverImage: string;
  isPublic: boolean;
  createdBy: mongoose.Types.ObjectId;
  registrations: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    duration: {
      type: String,
      required: [true, 'Event duration is required'],
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
    },
    price: {
      type: Number,
      required: [true, 'Event price is required'],
      default: 0,
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
    registrations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'EventRegistration',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEvent>('Event', eventSchema);

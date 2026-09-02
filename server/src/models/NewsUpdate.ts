import mongoose, { Schema, Document } from 'mongoose';

export interface NewsUpdateDocument extends Document {
  title: string;
  description: string;
  province: string;
  category: 'news' | 'scheme';
  imageUrl?: string;
  createdAt: Date;
}

const newsUpdateSchema = new Schema<NewsUpdateDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    province: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['news', 'scheme'],
    },
    imageUrl: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const NewsUpdate = mongoose.model<NewsUpdateDocument>(
  'NewsUpdate',
  newsUpdateSchema
);

import mongoose, { Schema, Document } from 'mongoose';

export interface FarmerRateDocument extends Document {
  phone: string;
  province: string;
  crop: string;
  rate: number;
  createdAt: Date;
}

const farmerRateSchema = new Schema<FarmerRateDocument>(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    province: {
      type: String,
      required: true,
      trim: true,
    },
    crop: {
      type: String,
      required: true,
      trim: true,
    },
    rate: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const FarmerRate = mongoose.model<FarmerRateDocument>(
  'FarmerRate',
  farmerRateSchema
);

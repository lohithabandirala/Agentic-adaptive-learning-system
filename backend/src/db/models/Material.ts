import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterial extends Document {
  id: string;
  fileName: string;
  filePath: string;
  uploadedBy: string;
  classId?: string;
  uploadedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>({
  id: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedBy: { type: String, required: true },
  classId: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

export const Material = mongoose.model<IMaterial>('Material', MaterialSchema);

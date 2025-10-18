import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  description: string;
  classCode: string;
  teacherId: string;
  students: string[];
  tests: string[];
  createdAt: Date;
}

const ClassSchema = new Schema<IClass>({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  classCode: { type: String, required: true, unique: true },
  teacherId: { type: String, required: true },
  students: [{ type: String }],
  tests: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export const Class = mongoose.model<IClass>('Class', ClassSchema);

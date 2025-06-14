import mongoose, { models, model, Schema } from 'mongoose';

const ColorSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, { timestamps: true });

export const Color = models.Color || model('Color', ColorSchema);

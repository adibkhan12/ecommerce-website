import mongoose, { Schema, model, models } from 'mongoose';

const adBannerSchema = new Schema({
  title: { type: String, required: true },
  desc: { type: String },
  image: { type: String, required: true },
  button: { type: String },
  link: { type: String },
  bg: { type: String },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export const AdBanner = models?.AdBanner || model('AdBanner', adBannerSchema);

import mongoose, { model, models, Schema } from "mongoose";

const QuickLinksSchema = new Schema({
  about: {
    description: { type: String, default: "" }
  },
  terms: {
    description: { type: String, default: "" }
  },
  shop: {
    description: { type: String, default: "" }
  },
  support: {
    description: { type: String, default: "" }
  }
});

export const QuickLinks = models?.QuickLinks || model("QuickLinks", QuickLinksSchema);

import { Schema, model, models } from "mongoose";

const InquirySchema = new Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  phone:       { type: String },
  businessType:{ type: String },
  message:     { type: String },
  source:      { type: String, default: "website" }
}, { timestamps: true });

export const Inquiry = models.Inquiry || model("Inquiry", InquirySchema);

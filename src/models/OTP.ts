import mongoose from "mongoose";

interface IEvent extends DocumentResult<IEvent> {
  _id: mongoose.Types.ObjectId,
  action: "change_password" | "validate_user",
  request_user: mongoose.Types.ObjectId | string,
  payload: string,
  createAt: Date
};

const otpSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  request_user: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  payload: {
    type: String,
    required: true
  },
  createAt: {
    type: Date,
    default: Date.now(),
    expires: '1m',
    index: true
  }
});

export const otpModel = mongoose.model<IEvent>("OTP", otpSchema);
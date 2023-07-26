import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  receiver: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  icon: {
    type: String,
    default: "icon-Notification-important"
  }
});

export const NotificationModel = mongoose.model<UserNotification>("Notification", NotificationSchema);

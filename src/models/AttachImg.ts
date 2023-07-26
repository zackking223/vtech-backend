import mongoose from "mongoose";

const attachImgSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Blog"
  },
  fileName: {
    type: String,
    required: true
  },
  uploader: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User"
  },
  imageUrl: {
    type: String,
    required: true
  }
});

export const AttachImgModel = mongoose.model("AttachImages", attachImgSchema);    
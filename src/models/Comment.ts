import mongoose from "mongoose";

interface IEvent extends DocumentResult<IEvent> {
  _id: mongoose.Types.ObjectId,
  content: string,
  author: mongoose.Types.ObjectId,
  createAt: string,
  likesCount: number,
  dislikesCount: number,
  likedBy: mongoose.Types.ObjectId[],
  dislikedBy: mongoose.Types.ObjectId[]
}

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createAt: {
    type: String,
    required: true
  },
  likesCount: {
    type: Number,
    default: 0
  },
  dislikesCount: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  dislikedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
});

export const CommentModel = mongoose.model<IEvent>("Comment", commentSchema);    
import mongoose from "mongoose";

interface IEvent extends DocumentResult<IEvent> {
  _id: mongoose.Types.ObjectId,
  title: string,
  coverImage: string,
  content: string,
  description: string,
  author: mongoose.Types.ObjectId,
  time: string,
  likedBy: mongoose.Types.ObjectId[],
  dislikedBy: mongoose.Types.ObjectId[],
  likesCount: number,
  dislikesCount: number,
  commentsCount: number,
  viewsCount: number,
  categories: string[],
  tags: string[],
  comments: mongoose.Types.ObjectId[]
}

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true
  },
  coverImage: {
    type: String,
    default: ""
  },
  content: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  time: {
    type: String,
    default: Date.now.toString()
  },
  likedBy: [{
    type: mongoose.Types.ObjectId,
    ref: "User"
  }],
  dislikedBy: [{
    type: mongoose.Types.ObjectId,
    ref: "User"
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  dislikesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  categories: [{
    type: String,
    ref: "Category"
  }],
  tags: [{
    type: String,
    required: false
  }],
  comments: [{
    type: mongoose.Types.ObjectId,
    ref: "Comment"
  }]
});

const BlogModel = mongoose.model<IEvent>("Blog", blogSchema);
export { BlogModel };     
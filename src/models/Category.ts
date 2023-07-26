import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
});

export const CategoryModel = mongoose.model("Category", categorySchema);    
import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  icon: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    required: true
  },
  regex: {
    type: String,
    required: true
  }
});

const contactSchema = new mongoose.Schema({
  media: {
    type: mongoose.Types.ObjectId,
    ref: "Media" 
  },
  url: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

const MediaModel = mongoose.model("Media", MediaSchema);
const ContactModel = mongoose.model("Contact", contactSchema);    

export {MediaModel, ContactModel};
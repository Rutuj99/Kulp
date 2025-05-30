import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  post: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Post = mongoose.model("post", PostSchema);
export default Post;
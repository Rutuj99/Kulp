import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  location: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  profilePicture: {
    type: String,
    default: ""
  },
  posts: {
    type: Array,
    default: []
  }
}, {
  timestamps: true
});

const User = mongoose.model("user", UserSchema);
export default User;
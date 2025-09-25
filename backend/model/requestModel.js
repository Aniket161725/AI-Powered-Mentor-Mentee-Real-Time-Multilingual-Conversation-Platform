import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderlanguage: {
      type: String, // Single language only
      trim: true,
      // default: "English", // optional: set a default
  },
  receiverlanguage: {
      type: String, // Single language only
      trim: true,
      // default: "English", // optional: set a default
  },
  skill: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Request = mongoose.model('Request', requestSchema);
export default Request;

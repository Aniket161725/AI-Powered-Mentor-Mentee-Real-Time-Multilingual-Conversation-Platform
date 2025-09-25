import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // message type: 'text' | 'voice'
  messageType: {
    type: String,
    enum: ['text', 'voice'],
    required: true
  },

  // For text messages (typed)
  text: {
    type: String,
    default: null
  },

  // For voice messages: original spoken text (from Whisper)
  originalText: {
    type: String,
    default: null
  },

  // Translated version of the message (if needed)
  translatedText: {
    type: String,
    default: null
  },

  // Audio file URLs
  originalAudioUrl: {
    type: String,
    default: null
  },
  translatedAudioUrl: {
    type: String,
    default: null
  },

  // Language tracking
  senderLang: {
    type: String,
    required: true
  },
  receiverLang: {
    type: String,
    required: true
  },
}, {
    timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
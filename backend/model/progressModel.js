import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    messagesSent: {
        type: Number,
        default: 0,
    },
    messagesReceived: {
        type: Number,
        default: 0,
    },
    mentorsInteracted: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
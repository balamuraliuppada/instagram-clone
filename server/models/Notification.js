const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    recipientUsername: {
        type: String,
        required: true,
        trim: true
    },
    actorUsername: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["like"],
        default: "like"
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Notification", NotificationSchema);

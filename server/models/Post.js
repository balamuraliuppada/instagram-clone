const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

const PostSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    caption: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        default: "",
        trim: true
    },
    likes: {
        type: [String],
        default: []
    },
    comments: {
        type: [CommentSchema],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Post", PostSchema);
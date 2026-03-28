const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    username: String,
    caption: String,
    likes: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Post", PostSchema);
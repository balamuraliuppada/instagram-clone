const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const Post = require("./models/post");

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


app.get("/", (req, res) => {
    res.send("API Running");
});
app.post("/api/posts", async (req, res) => {
    try {
        const { username, caption, imageUrl } = req.body;

        if (!username || !caption) {
            return res.status(400).json({ message: "username and caption are required" });
        }

        const newPost = new Post({
            username,
            caption,
            imageUrl: imageUrl || ""
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ message: "Failed to create post", error: error.message });
    }
});

app.put("/api/posts/:id/like", async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: "username is required" });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const alreadyLiked = post.likes.includes(username);
        if (alreadyLiked) {
            post.likes = post.likes.filter((user) => user !== username);
        } else {
            post.likes.push(username);
        }

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: "Failed to toggle like", error: error.message });
    }
});

app.post("/api/posts/:id/comment", async (req, res) => {
    try {
        const { username, text } = req.body;

        if (!username || !text) {
            return res.status(400).json({ message: "username and text are required" });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.comments.push({ username, text });
        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: "Failed to add comment", error: error.message });
    }
});

app.delete("/api/posts/:id", async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: "username is required" });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.username !== username) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted", id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete post", error: error.message });
    }
});

app.get("/api/posts", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch posts", error: error.message });
    }
});
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
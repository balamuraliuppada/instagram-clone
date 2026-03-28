const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const Post = require("./models/Post");
const User = require("./models/User");
const Notification = require("./models/Notification");

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const normalizeUsername = (value) => (value || "").trim();

const getOrCreateUser = async (username) => {
    const normalized = normalizeUsername(username);
    if (!normalized) return null;

    let user = await User.findOne({ username: normalized });
    if (!user) {
        user = await User.create({ username: normalized });
    }

    return user;
};


app.get("/", (req, res) => {
    res.send("API Running");
});
app.post("/api/posts", async (req, res) => {
    try {
        const { username, caption, imageUrl } = req.body;
        const normalizedUsername = normalizeUsername(username);

        if (!normalizedUsername || !caption) {
            return res.status(400).json({ message: "username and caption are required" });
        }

        await getOrCreateUser(normalizedUsername);

        const newPost = new Post({
            username: normalizedUsername,
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
        const normalizedUsername = normalizeUsername(username);

        if (!normalizedUsername) {
            return res.status(400).json({ message: "username is required" });
        }

        await getOrCreateUser(normalizedUsername);

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const alreadyLiked = post.likes.includes(normalizedUsername);
        if (alreadyLiked) {
            post.likes = post.likes.filter((user) => user !== normalizedUsername);
        } else {
            post.likes.push(normalizedUsername);

            if (post.username !== normalizedUsername) {
                await Notification.create({
                    recipientUsername: post.username,
                    actorUsername: normalizedUsername,
                    type: "like",
                    postId: post._id
                });
            }
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
        const normalizedUsername = normalizeUsername(username);

        if (!normalizedUsername || !text) {
            return res.status(400).json({ message: "username and text are required" });
        }

        await getOrCreateUser(normalizedUsername);

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.comments.push({ username: normalizedUsername, text });
        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: "Failed to add comment", error: error.message });
    }
});

app.delete("/api/posts/:postId/comment/:commentId", async (req, res) => {
    try {
        const { username } = req.body;
        const normalizedUsername = normalizeUsername(username);

        if (!normalizedUsername) {
            return res.status(400).json({ message: "username is required" });
        }

        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.username !== normalizedUsername) {
            return res.status(403).json({ message: "You can only delete your own comments" });
        }

        post.comments.pull({ _id: req.params.commentId });
        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: "Failed to delete comment", error: error.message });
    }
});

app.delete("/api/posts/:id", async (req, res) => {
    try {
        const { username } = req.body;
        const normalizedUsername = normalizeUsername(username);

        if (!normalizedUsername) {
            return res.status(400).json({ message: "username is required" });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.username !== normalizedUsername) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted", id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete post", error: error.message });
    }
});

app.post("/api/users/follow", async (req, res) => {
    try {
        const actorUsername = normalizeUsername(req.body.username);
        const targetUsername = normalizeUsername(req.body.targetUsername);

        if (!actorUsername || !targetUsername) {
            return res.status(400).json({ message: "username and targetUsername are required" });
        }

        if (actorUsername === targetUsername) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const actor = await getOrCreateUser(actorUsername);
        const target = await getOrCreateUser(targetUsername);

        const isFollowing = actor.following.includes(targetUsername);

        if (isFollowing) {
            actor.following = actor.following.filter((u) => u !== targetUsername);
            target.followers = target.followers.filter((u) => u !== actorUsername);
        } else {
            actor.following.push(targetUsername);
            target.followers.push(actorUsername);
        }

        await actor.save();
        await target.save();

        res.json({
            username: actor.username,
            targetUsername: target.username,
            isFollowing: !isFollowing,
            following: actor.following,
            followersCount: target.followers.length
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update follow status", error: error.message });
    }
});

app.get("/api/users/:username", async (req, res) => {
    try {
        const profileUser = await getOrCreateUser(req.params.username);
        if (!profileUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const viewerUsername = normalizeUsername(req.query.viewer);
        const isFollowing = viewerUsername ? profileUser.followers.includes(viewerUsername) : false;

        res.json({
            username: profileUser.username,
            followers: profileUser.followers,
            following: profileUser.following,
            followersCount: profileUser.followers.length,
            followingCount: profileUser.following.length,
            isFollowing
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user", error: error.message });
    }
});

app.get("/api/notifications/:username", async (req, res) => {
    try {
        const username = normalizeUsername(req.params.username);
        const limit = Number.parseInt(req.query.limit, 10) || 10;
        const skip = Number.parseInt(req.query.skip, 10) || 0;

        const notifications = await Notification.find({ recipientUsername: username })
            .sort({ createdAt: -1 })
            .skip(Math.max(0, skip))
            .limit(Math.max(1, limit));

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
    }
});

app.get("/api/profile/:username", async (req, res) => {
    try {
        const username = normalizeUsername(req.params.username);
        const viewerUsername = normalizeUsername(req.query.viewer);
        const profileUser = await getOrCreateUser(username);

        const posts = await Post.find({ username }).sort({ createdAt: -1 });

        res.json({
            user: {
                username: profileUser.username,
                followersCount: profileUser.followers.length,
                followingCount: profileUser.following.length,
                isFollowing: viewerUsername ? profileUser.followers.includes(viewerUsername) : false
            },
            posts
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profile", error: error.message });
    }
});

app.get("/api/posts", async (req, res) => {
    try {
        const limit = Number.parseInt(req.query.limit, 10) || 10;
        const skip = Number.parseInt(req.query.skip, 10) || 0;
        const viewerUsername = normalizeUsername(req.query.username);

        const query = {};
        if (viewerUsername) {
            const viewer = await getOrCreateUser(viewerUsername);
            const feedUsers = [...new Set([viewerUsername, ...viewer.following])];
            query.username = { $in: feedUsers };
        }

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(Math.max(0, skip))
            .limit(Math.max(1, limit));

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch posts", error: error.message });
    }
});
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
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
app.post("/api/posts", async(req, res) =>{
    try{
        const newPost = new Post({
            username : req.body.username,
            caption : req.body.caption
        })
        const savedPost = await newPost.save();
        res.json(savedPost);
    }
    catch (error) {
        res.status(500).json(error);
    }
})
app.put("/api/posts/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        post.likes += 1;
        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json(error);
    }
});
app.get("/api/posts", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json(error);
    }
});
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
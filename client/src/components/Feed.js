import { useEffect, useState } from "react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import Stories from "./Stories";

const API_BASE = "http://localhost:5000";

const Feed = ({ username }) => {
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(API_BASE + "/api/posts");
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError("Could not load posts.");
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!username || !caption.trim()) return;

    try {
      const res = await fetch(API_BASE + "/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          caption: caption.trim(),
          imageUrl: imageUrl.trim()
        })
      });

      if (!res.ok) throw new Error("Failed to create post");
      const createdPost = await res.json();
      setPosts((prev) => [createdPost, ...prev]);
      setCaption("");
      setImageUrl("");
      setError("");
    } catch (err) {
      setError("Could not create post.");
    }
  };

  const toggleLike = async (postId) => {
    if (!username) return;

    try {
      const res = await fetch(API_BASE + "/api/posts/" + postId + "/like", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });

      if (!res.ok) throw new Error("Failed to like post");
      const updatedPost = await res.json();
      setPosts((prev) => prev.map((post) => (post._id === postId ? updatedPost : post)));
      setError("");
    } catch (err) {
      setError("Could not update like.");
    }
  };

  const handleAddComment = async (postId, text) => {
    if (!username || !text.trim()) return;

    try {
      const res = await fetch(API_BASE + "/api/posts/" + postId + "/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, text: text.trim() })
      });

      if (!res.ok) throw new Error("Failed to add comment");
      const updatedPost = await res.json();
      setPosts((prev) => prev.map((post) => (post._id === postId ? updatedPost : post)));
      setError("");
    } catch (err) {
      setError("Could not add comment.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!username) return;

    try {
      const res = await fetch(API_BASE + "/api/posts/" + postId, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });

      if (!res.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      setError("");
    } catch (err) {
      setError("Could not delete post.");
    }
  };

  return (
    <main className="feed">
      <Stories />

      <CreatePost
        onCreatePost={handleCreatePost}
        caption={caption}
        imageUrl={imageUrl}
        setCaption={setCaption}
        setImageUrl={setImageUrl}
      />

      {error && <p className="error-text">{error}</p>}

      <div className="posts-list">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            username={username}
            toggleLike={toggleLike}
            handleDeletePost={handleDeletePost}
            handleAddComment={handleAddComment}
          />
        ))}
      </div>
    </main>
  );
};

export default Feed;

import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000";

const formatTimeAgo = (dateValue) => {
  const date = new Date(dateValue);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 10) return "Just now";

  const ranges = [
    { label: "year", value: 31536000 },
    { label: "month", value: 2592000 },
    { label: "day", value: 86400 },
    { label: "hour", value: 3600 },
    { label: "min", value: 60 }
  ];

  for (const range of ranges) {
    const count = Math.floor(seconds / range.value);
    if (count >= 1) {
      return `${count} ${range.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return `${seconds} sec${seconds > 1 ? "s" : ""} ago`;
};

function App() {
  const [username, setUsername] = useState(() => localStorage.getItem("insta_username") || "");
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [commentInputs, setCommentInputs] = useState({});

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/posts`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setPosts(data);
      setError("");
    } catch (err) {
      setError("Could not load posts. Make sure the server is running on port 5000.");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const ensureUsername = () => {
    if (username.trim()) return username.trim();

    const asked = window.prompt("Choose a username");
    const clean = (asked || "").trim();
    if (!clean) return "";

    localStorage.setItem("insta_username", clean);
    setUsername(clean);
    return clean;
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const currentUser = ensureUsername();
    if (!currentUser) {
      setError("Username is required to post.");
      return;
    }
    if (!caption.trim()) {
      setError("Caption is required.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser,
          caption: caption.trim(),
          imageUrl: imageUrl.trim()
        })
      });

      if (!res.ok) throw new Error("Failed to create post");
      const savedPost = await res.json();
      setPosts((prev) => [savedPost, ...prev]);
      setCaption("");
      setImageUrl("");
      setError("");
    } catch (err) {
      setError("Could not create post.");
    }
  };

  const toggleLike = async (postId) => {
    const currentUser = ensureUsername();
    if (!currentUser) {
      setError("Username is required to like posts.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser })
      });

      if (!res.ok) throw new Error("Failed to toggle like");
      const updatedPost = await res.json();
      setPosts((prev) => prev.map((post) => (post._id === postId ? updatedPost : post)));
      setError("");
    } catch (err) {
      setError("Could not update like.");
    }
  };

  const handleDeletePost = async (postId) => {
    const currentUser = ensureUsername();
    if (!currentUser) {
      setError("Username is required to delete posts.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete post");
      }

      setPosts((prev) => prev.filter((post) => post._id !== postId));
      setError("");
    } catch (err) {
      setError(err.message || "Could not delete post.");
    }
  };

  const submitComment = async (postId) => {
    const currentUser = ensureUsername();
    if (!currentUser) {
      setError("Username is required to comment.");
      return;
    }

    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser, text })
      });

      if (!res.ok) throw new Error("Failed to add comment");
      const updatedPost = await res.json();
      setPosts((prev) => prev.map((post) => (post._id === postId ? updatedPost : post)));
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      setError("");
    } catch (err) {
      setError("Could not add comment.");
    }
  };

  const onCommentKeyDown = (e, postId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitComment(postId);
    }
  };

  return (
    <div className="page">
      <div className="feed">
        <h2 className="title">Instagram Clone</h2>
        <p className="session">Signed in as: <strong>{username || "Guest"}</strong></p>

        <form className="create-post" onSubmit={handleCreatePost}>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption"
            required
          />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste image URL (optional)"
          />
          <button type="submit">Post</button>
        </form>

        {error && <p className="error">{error}</p>}

        {posts.map((post) => {
          const likedByMe = post.likes?.includes(username);

          return (
            <div key={post._id} className="post-card">
              <div className="post-header">
                <strong>{post.username}</strong>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>

              {post.imageUrl && <img src={post.imageUrl} alt="Post" className="post-image" />}

              <p className="caption">{post.caption}</p>

              <div className="actions">
                <button onClick={() => toggleLike(post._id)}>
                  {likedByMe ? "Unlike" : "Like"} ({post.likes?.length || 0})
                </button>
                {username === post.username && (
                  <button className="delete" onClick={() => handleDeletePost(post._id)}>
                    Delete
                  </button>
                )}
              </div>

              <div className="comments">
                {post.comments?.map((comment) => (
                  <p key={comment._id}>
                    <strong>{comment.username}</strong>: {comment.text}
                  </p>
                ))}
                <input
                  value={commentInputs[post._id] || ""}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [post._id]: e.target.value
                    }))
                  }
                  onKeyDown={(e) => onCommentKeyDown(e, post._id)}
                  placeholder="Write a comment and press Enter"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
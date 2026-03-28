import { useCallback, useRef, useState } from "react";

const API_BASE = "http://localhost:5000";

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const isFetchingRef = useRef(false);

  const fetchPosts = useCallback(async (username) => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    try {
      const query = username
        ? "?username=" + encodeURIComponent(username) + "&limit=50&skip=0"
        : "";
      const res = await fetch(API_BASE + "/api/posts" + query);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data);
      setError("");
    } catch (err) {
      setError("Could not load posts.");
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  const createPost = useCallback(async ({ username, caption, imageUrl }) => {
    const res = await fetch(API_BASE + "/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, caption, imageUrl })
    });

    if (!res.ok) throw new Error("Failed to create post");

    const created = await res.json();
    setPosts((prev) => [created, ...prev]);
    return created;
  }, []);

  const toggleLike = useCallback(async (postId, username) => {
    const res = await fetch(API_BASE + "/api/posts/" + postId + "/like", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });

    if (!res.ok) throw new Error("Failed to toggle like");

    const updated = await res.json();
    setPosts((prev) => prev.map((post) => (post._id === postId ? updated : post)));
    return updated;
  }, []);

  const deletePost = useCallback(async (postId, username) => {
    const res = await fetch(API_BASE + "/api/posts/" + postId, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });

    if (!res.ok) throw new Error("Failed to delete post");

    setPosts((prev) => prev.filter((post) => post._id !== postId));
  }, []);

  const addComment = useCallback(async (postId, username, text) => {
    const res = await fetch(API_BASE + "/api/posts/" + postId + "/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, text })
    });

    if (!res.ok) throw new Error("Failed to add comment");

    const updated = await res.json();
    setPosts((prev) => prev.map((post) => (post._id === postId ? updated : post)));
    return updated;
  }, []);

  return {
    posts,
    error,
    fetchPosts,
    createPost,
    toggleLike,
    deletePost,
    addComment
  };
};

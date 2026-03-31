import { useEffect, useMemo, useState } from "react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import Stories from "./Stories";
import { usePosts } from "../hooks/usePosts";

const Feed = ({ username }) => {
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [searchText, setSearchText] = useState("");
  const [viewFilter, setViewFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [localError, setLocalError] = useState("");

  const { posts, error, fetchPosts, createPost, toggleLike, deletePost, addComment } = usePosts();

  useEffect(() => {
    if (!username) return;
    fetchPosts();
  }, [fetchPosts, username]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!username || !caption.trim()) return;

    try {
      await createPost({
        username,
        caption: caption.trim(),
        imageUrl: imageUrl.trim()
      });
      setCaption("");
      setImageUrl("");
      setLocalError("");
    } catch (err) {
      setLocalError("Could not create post.");
    }
  };

  const handleToggleLike = async (postId) => {
    if (!username) return;
    try {
      await toggleLike(postId, username);
      setLocalError("");
    } catch (err) {
      setLocalError("Could not update like.");
    }
  };

  const handleAddComment = async (postId, text) => {
    if (!username || !text.trim()) return;

    try {
      await addComment(postId, username, text.trim());
      setLocalError("");
    } catch (err) {
      setLocalError("Could not add comment.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!username) return;

    try {
      await deletePost(postId, username);
      setLocalError("");
    } catch (err) {
      setLocalError("Could not delete post.");
    }
  };

  const filteredPosts = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    const byView = posts.filter((post) => {
      if (viewFilter === "media") return Boolean(post.imageUrl);
      if (viewFilter === "text") return !post.imageUrl;
      return true;
    });

    const bySearch = byView.filter((post) => {
      if (!query) return true;
      const source = [post.username, post.caption, ...(post.comments || []).map((comment) => comment.text)]
        .join(" ")
        .toLowerCase();
      return source.includes(query);
    });

    const sorted = [...bySearch];
    if (sortBy === "popular") {
      sorted.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    } else if (sortBy === "discussed") {
      sorted.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return sorted;
  }, [posts, searchText, sortBy, viewFilter]);

  const feedStats = useMemo(() => {
    return {
      posts: posts.length,
      likes: posts.reduce((total, post) => total + (post.likes?.length || 0), 0),
      comments: posts.reduce((total, post) => total + (post.comments?.length || 0), 0)
    };
  }, [posts]);

  const handleRefreshFeed = async () => {
    try {
      await fetchPosts();
      setLocalError("");
    } catch (err) {
      setLocalError("Could not refresh feed.");
    }
  };

  const viewTabs = [
    { id: "all", label: "All posts" },
    { id: "media", label: "Media" },
    { id: "text", label: "Text" }
  ];

  return (
    <main className="feed">
      <section className="feed-toolbar card-surface">
        <div className="stats-grid">
          <article className="stat-card">
            <p className="stat-label">Posts in feed</p>
            <p className="stat-value">{feedStats.posts}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Total likes</p>
            <p className="stat-value">{feedStats.likes}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Total comments</p>
            <p className="stat-value">{feedStats.comments}</p>
          </article>
        </div>

        <div className="feed-controls">
          <input
            className="feed-search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search captions, users, and comments"
          />

          <select className="sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="recent">Most recent</option>
            <option value="popular">Most liked</option>
            <option value="discussed">Most discussed</option>
          </select>

          <button className="action-btn secondary-btn" type="button" onClick={handleRefreshFeed}>
            Refresh
          </button>
        </div>

        <div className="feed-tabs" role="tablist" aria-label="Feed view filters">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              className={"feed-tab" + (viewFilter === tab.id ? " active" : "")}
              onClick={() => setViewFilter(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <Stories />

      <CreatePost
        onCreatePost={handleCreatePost}
        caption={caption}
        imageUrl={imageUrl}
        setCaption={setCaption}
        setImageUrl={setImageUrl}
      />

      {(error || localError) && <p className="error-text">{localError || error}</p>}

      <div className="posts-list">
        {filteredPosts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            username={username}
            toggleLike={handleToggleLike}
            handleDeletePost={handleDeletePost}
            handleAddComment={handleAddComment}
          />
        ))}

        {!filteredPosts.length && (
          <article className="empty-state">
            <h3>No posts match your current filters</h3>
            <p>Try another search, tab, or sort option to discover content.</p>
          </article>
        )}
      </div>
    </main>
  );
};

export default Feed;

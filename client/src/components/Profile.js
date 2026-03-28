import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = "http://localhost:5000";

const Profile = () => {
  const { username } = useParams();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(API_BASE + "/api/posts");
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data);
        setError("");
      } catch (err) {
        setError("Could not load profile posts.");
      }
    };

    fetchPosts();
  }, []);

  const profilePosts = useMemo(() => {
    return posts.filter((post) => post.username === username);
  }, [posts, username]);

  return (
    <main className="profile-page">
      <section className="profile-header-card">
        <h2 className="profile-title">{username}</h2>
        <p className="profile-count">{profilePosts.length} posts</p>
      </section>

      {error && <p className="error-text">{error}</p>}

      <section className="profile-grid">
        {profilePosts.map((post) => (
          <div key={post._id} className="profile-grid-item">
            {post.imageUrl ? (
              <img src={post.imageUrl} alt={post.caption || "Post"} className="profile-grid-image" />
            ) : (
              <div className="profile-grid-fallback">No image</div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
};

export default Profile;

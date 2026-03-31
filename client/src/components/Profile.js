import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = "http://localhost:5000";

const Profile = ({ currentUsername }) => {
  const { username } = useParams();
  const [posts, setPosts] = useState([]);
  const [profileUser, setProfileUser] = useState(null);
  const [error, setError] = useState("");
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const viewer = currentUsername ? "?viewer=" + encodeURIComponent(currentUsername) : "";
        const res = await fetch(API_BASE + "/api/profile/" + encodeURIComponent(username) + viewer);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setPosts(data.posts || []);
        setProfileUser(data.user || null);
        setError("");
      } catch (err) {
        setError("Could not load profile.");
      }
    };

    if (!username) return;
    fetchProfile();
  }, [currentUsername, username]);

  const profilePosts = useMemo(() => posts, [posts]);

  const handleFollowToggle = async () => {
    if (!currentUsername || !username || currentUsername === username) return;

    setIsUpdatingFollow(true);
    try {
      const res = await fetch(API_BASE + "/api/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUsername, targetUsername: username })
      });

      if (!res.ok) throw new Error("Failed to update follow");
      const data = await res.json();
      setProfileUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          isFollowing: data.isFollowing,
          followersCount: data.followersCount
        };
      });
    } catch (err) {
      setError("Could not update follow status.");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const isOwnProfile = currentUsername === username;

  return (
    <main className="profile-page">
      <section className="profile-header-card">
        <div className="profile-header-top">
          <h2 className="profile-title">{username}</h2>
          {!isOwnProfile && (
            <button
              className="action-btn"
              type="button"
              disabled={isUpdatingFollow}
              onClick={handleFollowToggle}
            >
              {profileUser?.isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>

        <div className="profile-metrics">
          <p className="profile-count">{profilePosts.length} posts</p>
          <p className="profile-count">{profileUser?.followersCount || 0} followers</p>
          <p className="profile-count">{profileUser?.followingCount || 0} following</p>
        </div>
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

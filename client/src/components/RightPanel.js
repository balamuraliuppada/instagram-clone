import { useEffect, useMemo, useState } from "react";
import { formatTimeAgo } from "../utils/time";

const API_BASE = "http://localhost:5000";

const RightPanel = ({ username }) => {
  const [profile, setProfile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!username) return;

    const fetchPanelData = async () => {
      try {
        const [profileRes, postsRes, notificationsRes] = await Promise.all([
          fetch(API_BASE + "/api/users/" + encodeURIComponent(username)),
          fetch(API_BASE + "/api/posts?limit=50&skip=0"),
          fetch(API_BASE + "/api/notifications/" + encodeURIComponent(username) + "?limit=5&skip=0")
        ]);

        if (!profileRes.ok || !postsRes.ok || !notificationsRes.ok) {
          throw new Error("Failed to fetch panel data");
        }

        const profileData = await profileRes.json();
        const postsData = await postsRes.json();
        const notificationsData = await notificationsRes.json();

        const candidateUsers = [...new Set(postsData.map((post) => post.username))]
          .filter((name) => name && name !== username)
          .filter((name) => !profileData.following.includes(name))
          .slice(0, 5);

        setProfile(profileData);
        setSuggestions(candidateUsers);
        setNotifications(notificationsData);
      } catch (error) {
        setSuggestions([]);
        setNotifications([]);
      }
    };

    fetchPanelData();
  }, [username]);

  const handleFollow = async (targetUsername) => {
    try {
      const res = await fetch(API_BASE + "/api/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, targetUsername })
      });

      if (!res.ok) throw new Error("Failed to follow user");

      setSuggestions((prev) => prev.filter((name) => name !== targetUsername));
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          following: [...prev.following, targetUsername],
          followingCount: prev.followingCount + 1
        };
      });
    } catch (error) {
      // Silent failure keeps panel usable without interrupting feed actions.
    }
  };

  const notificationTitle = useMemo(() => {
    if (!notifications.length) return "No new activity";
    return "Recent activity";
  }, [notifications]);

  return (
    <aside className="right-panel">
      <section className="profile-card">
        <div className="profile-avatar">{username.slice(0, 1).toUpperCase()}</div>
        <div>
          <p className="profile-name">{username}</p>
          <p className="profile-sub">
            {profile?.followersCount || 0} followers · {profile?.followingCount || 0} following
          </p>
        </div>
      </section>

      <section className="suggestions-card">
        <div className="suggestions-head">
          <span>Suggested for you</span>
        </div>

        {suggestions.map((name) => (
          <div key={name} className="suggestion-row">
            <div className="suggestion-avatar">{name.slice(0, 1).toUpperCase()}</div>
            <div className="suggestion-meta">
              <p className="suggestion-name">{name}</p>
              <p className="suggestion-bio">Trending creator</p>
            </div>
            <button type="button" className="follow-btn" onClick={() => handleFollow(name)}>
              Follow
            </button>
          </div>
        ))}

        {!suggestions.length && <p className="panel-empty">You are up to date with your network.</p>}
      </section>

      <section className="suggestions-card">
        <div className="suggestions-head">
          <span>{notificationTitle}</span>
        </div>

        {notifications.map((notification) => (
          <div key={notification._id} className="notification-row">
            <div className="suggestion-avatar">{notification.actorUsername.slice(0, 1).toUpperCase()}</div>
            <div className="suggestion-meta">
              <p className="suggestion-name">
                {notification.actorUsername} liked your post
              </p>
              <p className="suggestion-bio">{formatTimeAgo(notification.createdAt)}</p>
            </div>
          </div>
        ))}

        {!notifications.length && <p className="panel-empty">No notifications right now.</p>}
      </section>
    </aside>
  );
};

export default RightPanel;

const suggestions = [
  { id: 1, username: "mila.sun", bio: "Suggested for you" },
  { id: 2, username: "arthur.fit", bio: "Followed by alex" },
  { id: 3, username: "cora.design", bio: "New to Instagram" },
  { id: 4, username: "jack.travels", bio: "Popular" }
];

const RightPanel = () => {
  return (
    <aside className="right-panel">
      <section className="profile-card">
        <div className="profile-avatar">Y</div>
        <div>
          <p className="profile-name">your_username</p>
          <p className="profile-sub">Your profile</p>
        </div>
      </section>

      <section className="suggestions-card">
        <div className="suggestions-head">
          <span>Suggested for you</span>
        </div>

        {suggestions.map((user) => (
          <div key={user.id} className="suggestion-row">
            <div className="suggestion-avatar">{user.username.slice(0, 1).toUpperCase()}</div>
            <div className="suggestion-meta">
              <p className="suggestion-name">{user.username}</p>
              <p className="suggestion-bio">{user.bio}</p>
            </div>
            <button type="button" className="follow-btn">
              Follow
            </button>
          </div>
        ))}
      </section>
    </aside>
  );
};

export default RightPanel;

const Header = ({ username, setUsername }) => {
  const handleSignOut = () => {
    localStorage.removeItem("insta_username");
    setUsername("");
  };

  return (
    <header className="top-header">
      <div>
        <p className="title-kicker">Social Dashboard</p>
        <h2 className="title">InstaClone Pro</h2>
      </div>

      <div className="session-wrap">
        <p className="session">
          Signed in as: <strong>{username || "Guest"}</strong>
        </p>
        <button type="button" className="session-btn" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
};

export default Header;

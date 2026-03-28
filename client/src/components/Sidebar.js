import { Link } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Search" },
  { label: "Explore" },
  { label: "Reels" },
  { label: "Messages" },
  { label: "Notifications" },
  { label: "Create" }
];

const Sidebar = ({ username }) => {
  const profilePath = username ? "/profile/" + encodeURIComponent(username) : "/";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Instagram</div>

      <nav className="sidebar-nav">
        {navItems.map((item) =>
          item.to ? (
            <Link key={item.label} className="sidebar-item sidebar-link" to={item.to}>
              {item.label}
            </Link>
          ) : (
            <button key={item.label} className="sidebar-item" type="button">
              {item.label}
            </button>
          )
        )}

        <Link className="sidebar-item sidebar-link" to={profilePath}>
          Profile
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;

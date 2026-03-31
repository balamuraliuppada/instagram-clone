import { Link } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Discover" },
  { label: "Activity" },
  { label: "Create" }
];

const Sidebar = ({ username }) => {
  const profilePath = username ? "/profile/" + encodeURIComponent(username) : "/";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">InstaClone Pro</div>
      <p className="sidebar-subtitle">Creator workspace</p>

      <nav className="sidebar-nav">
        {navItems.map((item) =>
          item.to ? (
            <Link key={item.label} className="sidebar-item sidebar-link" to={item.to}>
              {item.label}
            </Link>
          ) : (
            <button key={item.label} className="sidebar-item sidebar-item-muted" type="button">
              {item.label} <span className="badge-soon">Soon</span>
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

const Header = ({ username }) => {
  return (
    <>
      <h2 className="title">Instagram Clone</h2>
      <p className="session">
        Signed in as: <strong>{username || "Guest"}</strong>
      </p>
    </>
  );
};

export default Header;

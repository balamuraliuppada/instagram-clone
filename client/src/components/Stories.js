const stories = [
  "alex",
  "sophia",
  "mike",
  "nora",
  "liam",
  "emma",
  "olivia",
  "noah",
  "ava",
  "lucas"
];

const Stories = () => {
  return (
    <section className="stories-card">
      <div className="stories-scroll">
        {stories.map((name) => (
          <div key={name} className="story-item">
            <div className="story-avatar">{name.slice(0, 1).toUpperCase()}</div>
            <span>{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stories;

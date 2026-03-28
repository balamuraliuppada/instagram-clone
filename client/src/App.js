import { useEffect, useState } from "react";

function App() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/posts");
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError("Could not load posts. Make sure the server is running on port 5000.");
      }
    };

    loadPosts();
  }, []);
  const likePost = async (id) => {
  const res = await fetch(`http://localhost:5000/api/posts/${id}/like`, {
    method: "PUT"
  });

  const updatedPost = await res.json();

  setPosts(posts.map(post =>
    post._id === id ? updatedPost : post
  ));
};
  return (
    <div style={{width:"500px", margin:"auto"}}>
      <h2>Instagram Clone</h2>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {posts.map(post => (
        <div key={post._id} style={{
          border:"1px solid #ccc",
          padding:"10px",
          marginBottom:"10px"
        }}>
          <h4>{post.username}</h4>
          <p>{post.caption}</p>
          <button onClick={() => likePost(post._id)}>
      ❤️ {post.likes || 0}
    </button>

        </div>
      ))}

    </div>
  );
}

export default App;
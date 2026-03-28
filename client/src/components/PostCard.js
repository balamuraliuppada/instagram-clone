import { useState } from "react";
import { formatTimeAgo } from "../utils/time";

const PostCard = ({
  post,
  username,
  toggleLike,
  handleDeletePost,
  handleAddComment
}) => {
  const [commentText, setCommentText] = useState("");

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    handleAddComment(post._id, text);
    setCommentText("");
  };

  return (
    <article className="post-card">
      <header className="post-header">
        <div className="post-user">
          <div className="post-avatar">{post.username.slice(0, 1).toUpperCase()}</div>
          <div>
            <p className="post-username">{post.username}</p>
            <p className="post-location">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>
      </header>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          className="post-image"
          onDoubleClick={() => toggleLike(post._id)}
        />
      )}

      <div className="post-body">
        <div className="post-actions">
          <button className="action-btn" type="button" onClick={() => toggleLike(post._id)}>
            {post.likes?.includes(username) ? "Unlike" : "Like"}
          </button>

          {username === post.username && (
            <button className="action-btn delete-btn" type="button" onClick={() => handleDeletePost(post._id)}>
              Delete
            </button>
          )}
        </div>

        <p className="post-likes">{post.likes?.length || 0} likes</p>
        <p>
          <span className="post-username">{post.username}</span> {post.caption}
        </p>

        <div className="comments-list">
          {(post.comments || []).map((comment) => (
            <p key={comment._id}>
              <span className="post-username">{comment.username}</span> {comment.text}
            </p>
          ))}
        </div>

        <input
          className="comment-input"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitComment();
            }
          }}
          placeholder="Add a comment..."
        />
      </div>
    </article>
  );
};

export default PostCard;

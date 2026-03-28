import { useState } from "react";

const CommentSection = ({ comments = [], onAddComment }) => {
  const [commentText, setCommentText] = useState("");

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    onAddComment(text);
    setCommentText("");
  };

  return (
    <div className="comments">
      {comments.map((comment) => (
        <p key={comment._id}>
          <strong>{comment.username}</strong>: {comment.text}
        </p>
      ))}

      <input
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submitComment();
          }
        }}
        placeholder="Write a comment and press Enter"
      />
    </div>
  );
};

export default CommentSection;

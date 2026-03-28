const CreatePost = ({
  onCreatePost,
  caption,
  imageUrl,
  setCaption,
  setImageUrl
}) => {
  return (
    <form className="create-post" onSubmit={onCreatePost}>
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Write a caption"
        required
      />
      <input
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Paste image URL (optional)"
      />
      <button type="submit">Post</button>
    </form>
  );
};

export default CreatePost;

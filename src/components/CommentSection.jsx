import { useEffect, useState } from "react";
import { fetchComments, addComment, getGuestId } from "../api.js";

export default function CommentSection({ videoId, onCommentPosted }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetchComments(videoId)
      .then((data) => {
        if (!cancelled) setComments(data.comments || []);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load comments.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || posting) return;

    setPosting(true);
    setError("");
    try {
      const res = await addComment(videoId, getGuestId(), text);
      setComments((prev) => [...prev, res.comment]);
      setDraft("");
      onCommentPosted?.(res.commentCount);
    } catch {
      setError("Couldn't post your comment, try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="sa-comments">
      <div className="sa-comments__list">
        {loading && <p className="sa-comments__hint">Loading comments…</p>}
        {!loading && comments.length === 0 && (
          <p className="sa-comments__hint">Be the first to comment.</p>
        )}
        {!loading &&
          comments.map((c) => (
            <div className="sa-comment" key={c._id || `${c.user}-${c.createdAt}`}>
              <span className="sa-comment__user">{c.user}</span>
              <span className="sa-comment__text">{c.text}</span>
            </div>
          ))}
      </div>

      {error && <p className="sa-error sa-error--inline">{error}</p>}

      <form className="sa-comments__form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          maxLength={500}
          aria-label="Add a comment"
        />
        <button type="submit" disabled={posting || !draft.trim()}>
          {posting ? "Posting…" : "Post"}
        </button>
      </form>
    </div>
  );
}

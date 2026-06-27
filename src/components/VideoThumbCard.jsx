import useIntersectionObserver from "../hooks/useIntersectionObserver.js";

export default function VideoThumbCard({ video, onOpen }) {
  const { ref, hasIntersected } = useIntersectionObserver({
    rootMargin: "300px",
    threshold: 0.01,
    once: true,
  });

  return (
    <button
      ref={ref}
      type="button"
      className="sa-thumb"
      onClick={() => onOpen(video.id)}
      aria-label={`Play ${video.title}`}
    >
      <span className="sa-thumb__badge">
        <CheckIcon /> Verified
      </span>

      <span className="sa-thumb__media">
        {hasIntersected ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            loading="lazy"
            className="sa-thumb__img"
          />
        ) : (
          <span className="sa-thumb__placeholder" />
        )}
        <span className="sa-thumb__play">
          <PlayIcon />
        </span>
      </span>

      <span className="sa-thumb__meta">
        <span className="sa-thumb__name">{video.author}</span>
        <span className="sa-thumb__likes">
          <HeartIcon /> {formatCount(video.likeCount)}
        </span>
      </span>
    </button>
  );
}

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-10-9.3C0.5 8.1 2.1 5 5.3 5c2 0 3.4 1.1 4.2 2.3l.5.8.5-.8C11.3 6.1 12.7 5 14.7 5c3.2 0 4.8 3.1 3.3 6.7C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

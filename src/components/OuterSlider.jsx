import { useRef } from "react";
import VideoThumbCard from "./VideoThumbCard.jsx";
import Spinner from "./Spinner.jsx";

export default function OuterSlider({ videos, loading, error, onOpen }) {
  const trackRef = useRef(null);

  function scrollByCards(direction) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".sa-thumb");
    const step = card ? card.getBoundingClientRect().width + 14 : 220;
    track.scrollBy({ left: direction * step * 3, behavior: "smooth" });
  }

  return (
    <section className="sa-section" aria-label="Socially approved customer videos">
      <header className="sa-section__header">
        <div>
          <p className="sa-eyebrow">
            <BadgeIcon /> Socially Approved
          </p>
          <h1 className="sa-title">Real customers. Real reviews.</h1>
        </div>
        <div className="sa-nav">
          <button
            type="button"
            className="sa-nav__btn"
            onClick={() => scrollByCards(-1)}
            aria-label="Scroll left"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            className="sa-nav__btn"
            onClick={() => scrollByCards(1)}
            aria-label="Scroll right"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </header>

      {error && <p className="sa-error">{error}</p>}

      {loading ? (
        <div className="sa-loading-row">
          <Spinner />
          <span>Loading videos…</span>
        </div>
      ) : (
        <div className="sa-track" ref={trackRef}>
          {videos.map((video) => (
            <VideoThumbCard key={video.id} video={video} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}

function BadgeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l2.6 1.9 3.2-.3 1 3 2.9 1.4-1 3.1 1 3.1-2.9 1.4-1 3-3.2-.3L12 22l-2.6-1.9-3.2.3-1-3-2.9-1.4 1-3.1-1-3.1L5.2 8l1-3 3.2.3L12 2z"
        fill="currentColor"
      />
      <path
        d="M9 12.5l2 2 4-4.5"
        stroke="#0B0C10"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ direction }) {
  const d = direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

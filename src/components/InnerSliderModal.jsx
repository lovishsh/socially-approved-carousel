import { useCallback, useEffect, useRef, useState } from "react";
import VideoSlide from "./VideoSlide.jsx";

export default function InnerSliderModal({ videos, startIndex, onClose }) {
  const trackRef = useRef(null);
  const [scrollRoot, setScrollRoot] = useState(null);

  const setTrackRef = useCallback((node) => {
    trackRef.current = node;
    setScrollRoot(node);
  }, []);

  // Jump to the clicked video without animating the whole way there.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.children[startIndex];
    if (target) {
      target.scrollIntoView({ block: "nearest", inline: "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRoot]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") scrollByOne(1);
      if (e.key === "ArrowLeft") scrollByOne(-1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Lock background scroll while the modal is open.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  function scrollByOne(direction) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".sa-slide");
    const step = card ? card.getBoundingClientRect().width + 16 : 320;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <div className="sa-modal" role="dialog" aria-modal="true" aria-label="Customer video carousel">
      <div className="sa-modal__backdrop" onClick={onClose} />

      <div className="sa-modal__panel">
        <header className="sa-modal__header">
          <span className="sa-modal__badge">✓ Socially Approved</span>
          <button type="button" className="sa-modal__close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        <div className="sa-modal__body">
          <button
            type="button"
            className="sa-modal__nav sa-modal__nav--left"
            onClick={() => scrollByOne(-1)}
            aria-label="Previous videos"
          >
            <ChevronIcon direction="left" />
          </button>

          <div className="sa-modal__track" ref={setTrackRef}>
            {videos.map((video) => (
              <VideoSlide key={video.id} video={video} scrollRoot={scrollRoot} />
            ))}
          </div>

          <button
            type="button"
            className="sa-modal__nav sa-modal__nav--right"
            onClick={() => scrollByOne(1)}
            aria-label="Next videos"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ direction }) {
  const d = direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

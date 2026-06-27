import { useEffect, useRef, useState } from "react";
import useIntersectionObserver from "../hooks/useIntersectionObserver.js";
import { likeVideo, shareVideo, getGuestId } from "../api.js";
import CommentSection from "./CommentSection.jsx";
import Spinner from "./Spinner.jsx";

const SHARE_TARGETS = [
  { id: "copy", label: "Copy link" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "twitter", label: "X / Twitter" },
  { id: "facebook", label: "Facebook" },
];

export default function VideoSlide({ video, scrollRoot }) {
  const videoRef = useRef(null);
  const progressTrackRef = useRef(null);

  const { ref: slideRef, isIntersecting, hasIntersected } = useIntersectionObserver({
    root: scrollRoot,
    rootMargin: "0px",
    threshold: 0.6,
  });

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [progress, setProgress] = useState(0);

  const [liked, setLiked] = useState(Boolean(video.liked));
  const [likeCount, setLikeCount] = useState(video.likeCount || 0);
  const [likeBusy, setLikeBusy] = useState(false);

  const [shareCount, setShareCount] = useState(video.shareCount || 0);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");

  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(video.commentCount || 0);

  // Pause as soon as the slide leaves the viewport of the inner carousel.
  useEffect(() => {
    if (!isIntersecting && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setPlaying(false);
    }
  }, [isIntersecting]);

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;

    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      setBuffering(true);
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setBuffering(false));
    }
  }

  function toggleMute() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }

  function handleTimeUpdate() {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    setProgress((el.currentTime / el.duration) * 100);
  }

  function seekTo(clientX) {
    const el = videoRef.current;
    const track = progressTrackRef.current;
    if (!el || !track || !el.duration) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    el.currentTime = ratio * el.duration;
    setProgress(ratio * 100);
  }

  async function handleLike() {
    if (likeBusy) return;
    setLikeBusy(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));

    try {
      const res = await likeVideo(video.id, getGuestId());
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch {
      setLiked(!nextLiked);
      setLikeCount((c) => c + (nextLiked ? -1 : 1));
    } finally {
      setLikeBusy(false);
    }
  }

  async function handleShare(target) {
    setShareMenuOpen(false);
    const url = `${window.location.origin}${window.location.pathname}#video-${video.id}`;

    try {
      if (target === "copy") {
        await navigator.clipboard.writeText(url);
        setShareFeedback("Link copied");
      } else {
        const intents = {
          whatsapp: `https://wa.me/?text=${encodeURIComponent(url)}`,
          twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        };
        window.open(intents[target], "_blank", "noopener,noreferrer");
      }

      const res = await shareVideo(video.id, target, getGuestId());
      setShareCount(res.shareCount);
    } catch {
      setShareFeedback("Couldn't share, try again");
    } finally {
      setTimeout(() => setShareFeedback(""), 2000);
    }
  }

  return (
    <div className="sa-slide" ref={slideRef} id={`video-${video.id}`}>
      <div className="sa-slide__media">
        {hasIntersected ? (
          <video
            ref={videoRef}
            className="sa-slide__video"
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            muted={muted}
            playsInline
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onWaiting={() => setBuffering(true)}
            onPlaying={() => setBuffering(false)}
            onCanPlay={() => setBuffering(false)}
            onEnded={() => setPlaying(false)}
            onClick={togglePlay}
          />
        ) : (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            loading="lazy"
            className="sa-slide__video sa-slide__video--placeholder"
          />
        )}

        {buffering && hasIntersected && (
          <div className="sa-slide__spinner">
            <Spinner size={36} />
          </div>
        )}

        {!playing && !buffering && (
          <button
            type="button"
            className="sa-slide__playOverlay"
            onClick={togglePlay}
            aria-label={playing ? "Pause video" : "Play video"}
          >
            <PlayIcon />
          </button>
        )}

        <div className="sa-slide__caption">
          <p className="sa-slide__author">{video.author}</p>
          <p className="sa-slide__title">{video.title}</p>
        </div>
      </div>

      <div
        className="sa-slide__progress"
        ref={progressTrackRef}
        onClick={(e) => seekTo(e.clientX)}
        role="slider"
        aria-label="Video progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className="sa-slide__progressFill" style={{ width: `${progress}%` }} />
      </div>

      <div className="sa-slide__controls">
        <button type="button" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <PauseIcon /> : <PlayIconSmall />}
        </button>
        <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <MuteIcon /> : <VolumeIcon />}
        </button>

        <span className="sa-slide__spacer" />

        <button
          type="button"
          className={`sa-slide__action ${liked ? "is-active" : ""}`}
          onClick={handleLike}
          aria-pressed={liked}
        >
          <HeartIcon filled={liked} /> {likeCount}
        </button>

        <button
          type="button"
          className="sa-slide__action"
          onClick={() => setShowComments((v) => !v)}
          aria-pressed={showComments}
        >
          <CommentIcon /> {commentCount}
        </button>

        <div className="sa-slide__shareWrap">
          <button
            type="button"
            className="sa-slide__action"
            onClick={() => setShareMenuOpen((v) => !v)}
            aria-pressed={shareMenuOpen}
          >
            <ShareIcon /> {shareCount}
          </button>

          {shareMenuOpen && (
            <div className="sa-shareMenu">
              {SHARE_TARGETS.map((t) => (
                <button key={t.id} type="button" onClick={() => handleShare(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
          )}
          {shareFeedback && <span className="sa-shareFeedback">{shareFeedback}</span>}
        </div>
      </div>

      {showComments && (
        <CommentSection videoId={video.id} onCommentPosted={setCommentCount} />
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PlayIconSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
function VolumeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 9v6h4l5 5V4L8 9H4z" />
    </svg>
  );
}
function MuteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 9v6h4l5 5V4L8 9H4z" />
      <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
function HeartIcon({ filled }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 21s-7.5-4.6-10-9.3C0.5 8.1 2.1 5 5.3 5c2 0 3.4 1.1 4.2 2.3l.5.8.5-.8C11.3 6.1 12.7 5 14.7 5c3.2 0 4.8 3.1 3.3 6.7C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}
function CommentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 11.5a8.5 8.5 0 01-12.4 7.5L3 20l1.1-5.2A8.5 8.5 0 1121 11.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

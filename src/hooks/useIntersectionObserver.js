import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether `ref` is intersecting its scroll container / viewport.
 * Used to lazy-load thumbnails and video sources, and to pause videos
 * once they leave view.
 */
export default function useIntersectionObserver({
  root = null,
  rootMargin = "150px",
  threshold = 0.4,
  once = false,
} = {}) {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      // Fallback: treat as visible if the browser can't observe.
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) setHasIntersected(true);
      },
      { root, rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold]);

  return {
    ref,
    isIntersecting: once ? hasIntersected || isIntersecting : isIntersecting,
    hasIntersected,
  };
}

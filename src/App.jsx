import { useEffect, useState } from "react";
import OuterSlider from "./components/OuterSlider.jsx";
import InnerSliderModal from "./components/InnerSliderModal.jsx";
import { fetchVideos } from "./api.js";

export default function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchVideos()
      .then((data) => {
        if (!cancelled) setVideos(data.videos || []);
      })
      .catch(() => {
        if (!cancelled)
          setError("Couldn't reach the video service. Is the backend running?");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleOpen(videoId) {
    const index = videos.findIndex((v) => v.id === videoId);
    if (index !== -1) setOpenIndex(index);
  }

  return (
    <main className="sa-app">
      <OuterSlider videos={videos} loading={loading} error={error} onOpen={handleOpen} />

      {openIndex !== null && (
        <InnerSliderModal
          videos={videos}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </main>
  );
}

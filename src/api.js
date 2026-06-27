const API_URL =   import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // response had no JSON body, keep the default message
    }
    throw new Error(message);
  }

  return res.json();
}

export function fetchVideos() {
  return request(`/videos?guest=${encodeURIComponent(getGuestId())}`);
}

export function fetchComments(videoId) {
  return request(`/videos/${videoId}/comments`);
}

export function likeVideo(videoId, user) {
  return request("/like", {
    method: "POST",
    body: JSON.stringify({ videoId, user }),
  });
}

export function shareVideo(videoId, platform, user) {
  return request("/share", {
    method: "POST",
    body: JSON.stringify({ videoId, platform, user }),
  });
}

export function addComment(videoId, user, text) {
  return request("/comment", {
    method: "POST",
    body: JSON.stringify({ videoId, user, text }),
  });
}

export function getGuestId() {
  const key = "sa_guest_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `guest_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

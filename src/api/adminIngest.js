// Fire-and-forget event sender for the separate admin ingest system.
// Intentionally isolated from the chatbot's own BE client: this must never
// affect the chatbot's own BE calls, and must never block or throw into caller code.
export function sendIngestEvent(event, payload) {
  try {
    const baseUrl = import.meta.env.VITE_ADMIN_INGEST_URL;
    if (!baseUrl) return Promise.resolve();

    return fetch(`${baseUrl}/api/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ADMIN_INGEST_API_KEY,
      },
      body: JSON.stringify({ event, ...payload }),
      keepalive: true,
    }).catch((err) => {
      console.warn("sendIngestEvent failed:", err);
    });
  } catch (err) {
    console.warn("sendIngestEvent failed:", err);
    return Promise.resolve();
  }
}

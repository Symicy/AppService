const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/scan";

export async function fetchOrderByToken(token) {
  const endpoints = [
    `${API_BASE}/qr/scan/${encodeURIComponent(token)}`,
    `${API_BASE}/qr/scan?token=${encodeURIComponent(token)}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { credentials: "omit" });
      if (res.ok) return await res.json();
    } catch {
      // try next
    }
  }
  throw new Error("Unable to fetch order for this QR token.");
}
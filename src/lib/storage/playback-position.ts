const KEY = "soundwave-position";

export interface SavedPosition {
  trackId: string;
  time: number;
}

function isSavedPosition(v: unknown): v is SavedPosition {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.trackId === "string" &&
    typeof r.time === "number" &&
    Number.isFinite(r.time)
  );
}

export function savePosition(trackId: string, time: number): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ trackId, time }));
  } catch {
    // storage may be full or blocked; position restore is best-effort
  }
}

export function loadPosition(): SavedPosition | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSavedPosition(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

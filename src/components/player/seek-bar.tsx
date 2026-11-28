"use client";

import { useRef, useState, type CSSProperties } from "react";
import { formatTime } from "@/lib/utils/format";
import { usePlayerStore } from "@/store/player-store";

export function SeekBar() {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const seek = usePlayerStore((s) => s.seek);

  const [drag, setDrag] = useState<number | null>(null);
  const pointerDown = useRef(false);

  const shown = drag ?? currentTime;
  const max = duration > 0 ? duration : 0;
  const pct = max > 0 ? Math.min(100, (shown / max) * 100) : 0;

  const commit = (): void => {
    pointerDown.current = false;
    if (drag !== null) {
      seek(drag);
      setDrag(null);
    }
  };

  return (
    <div className="flex w-full items-center gap-2 text-xs tabular-nums text-muted">
      <span className="w-10 text-right">{formatTime(shown)}</span>
      <input
        type="range"
        className="range min-w-0 flex-1"
        min={0}
        max={max || 1}
        step={0.1}
        value={Math.min(shown, max || 1)}
        disabled={max === 0}
        aria-label="Seek"
        aria-valuetext={`${formatTime(shown)} of ${formatTime(max)}`}
        style={{ "--fill": `${pct}%` } as CSSProperties}
        onPointerDown={() => {
          pointerDown.current = true;
        }}
        onChange={(e) => {
          const v = Number(e.target.value);
          // Dragging only updates the thumb; the seek happens on release
          if (pointerDown.current) setDrag(v);
          else seek(v); // keyboard
        }}
        onPointerUp={commit}
        onPointerCancel={commit}
        onBlur={commit}
      />
      <span className="w-10">{formatTime(max)}</span>
    </div>
  );
}

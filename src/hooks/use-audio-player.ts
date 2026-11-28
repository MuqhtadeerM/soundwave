"use client";

import { useEffect, useRef } from "react";
import { getAudio, tryPlay } from "@/lib/audio/audio-engine";
import { loadPosition, savePosition } from "@/lib/storage/playback-position";
import { selectCurrentTrack, usePlayerStore } from "@/store/player-store";

function describeError(error: MediaError | null): string {
  switch (error?.code) {
    case 2:
      return "Network problem while loading this track.";
    case 3:
      return "This audio file couldn't be played.";
    case 4:
      return "This track isn't available right now.";
    default:
      return "Playback was interrupted.";
  }
}

async function startPlayback(audio: HTMLAudioElement): Promise<void> {
  const result = await tryPlay(audio);
  const { setPlaying, setStatus } = usePlayerStore.getState();
  if (result === "blocked") {
    setPlaying(false);
  } else if (result === "failed") {
    setPlaying(false);
    setStatus("error", "Couldn't start playback.");
  }
}

/** Mount exactly once. Syncs the shared audio element with the player store. */
export function useAudioPlayer(): void {
  const trackId = usePlayerStore((s) => selectCurrentTrack(s)?.id ?? null);
  const loadToken = usePlayerStore((s) => s.loadToken);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);

  const pendingSeek = useRef(0);
  const restoredRef = useRef(false);

  // 1. Element events -> store
  useEffect(() => {
    const audio = getAudio();
    let lastSave = 0;

    const persistPosition = (): void => {
      const s = usePlayerStore.getState();
      const track = selectCurrentTrack(s);
      if (track && s.status === "ready")
        savePosition(track.id, audio.currentTime);
    };

    const onTimeUpdate = (): void => {
      usePlayerStore.getState().setCurrentTime(audio.currentTime);
      const now = Date.now();
      if (now - lastSave > 2000) {
        lastSave = now;
        persistPosition();
      }
    };
    const onDuration = (): void => {
      if (Number.isFinite(audio.duration))
        usePlayerStore.getState().setDuration(audio.duration);
    };
    const onLoadedMetadata = (): void => {
      onDuration();
      if (pendingSeek.current > 0) {
        audio.currentTime = pendingSeek.current;
        pendingSeek.current = 0;
      }
    };
    const onLoading = (): void =>
      usePlayerStore.getState().setStatus("loading");
    const onReady = (): void => usePlayerStore.getState().setStatus("ready");
    const onEnded = (): void => usePlayerStore.getState().handleEnded();
    const onError = (): void => {
      const { setStatus, setPlaying } = usePlayerStore.getState();
      setStatus("error", describeError(audio.error));
      setPlaying(false);
    };

    const handlers: Array<[keyof HTMLMediaElementEventMap, () => void]> = [
      ["timeupdate", onTimeUpdate],
      ["durationchange", onDuration],
      ["loadedmetadata", onLoadedMetadata],
      ["loadstart", onLoading],
      ["waiting", onLoading],
      ["canplay", onReady],
      ["playing", onReady],
      ["ended", onEnded],
      ["error", onError],
    ];
    for (const [name, fn] of handlers) audio.addEventListener(name, fn);
    window.addEventListener("pagehide", persistPosition);

    return () => {
      for (const [name, fn] of handlers) audio.removeEventListener(name, fn);
      window.removeEventListener("pagehide", persistPosition);
    };
  }, []);

  // 2. Current track changed (or reload requested) -> load it
  useEffect(() => {
    const audio = getAudio();
    const state = usePlayerStore.getState();
    const track = selectCurrentTrack(state);

    if (!track) {
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    // First load after a page refresh: resume position, but only if not already playing
    let seekTo = 0;
    if (!restoredRef.current) {
      restoredRef.current = true;
      if (!state.isPlaying) {
        const saved = loadPosition();
        if (saved && saved.trackId === track.id) seekTo = saved.time;
      }
    }
    pendingSeek.current = seekTo;
    if (seekTo > 0) state.setCurrentTime(seekTo);

    audio.src = track.src;
    audio.load();
    state.setStatus("loading");
    if (state.isPlaying) void startPlayback(audio);
  }, [trackId, loadToken]);

  // 3. Play / pause intent
  useEffect(() => {
    const audio = getAudio();
    if (!audio.hasAttribute("src")) return;
    if (isPlaying) void startPlayback(audio);
    else audio.pause();
  }, [isPlaying]);

  // 4. Volume / mute
  useEffect(() => {
    const audio = getAudio();
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);
}

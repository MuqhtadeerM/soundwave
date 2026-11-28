declare global {
  // eslint-disable-next-line no-var
  var __soundwaveAudio: HTMLAudioElement | undefined;
}

/** The one shared audio element. Stored on globalThis so dev hot-reload can't create a second one. */
export function getAudio(): HTMLAudioElement {
  if (typeof window === "undefined") {
    throw new Error("getAudio() can only be called in the browser");
  }
  let audio = globalThis.__soundwaveAudio;
  if (!audio) {
    audio = new Audio();
    audio.preload = "metadata";
    globalThis.__soundwaveAudio = audio;
  }
  return audio;
}

export type PlayResult = "playing" | "blocked" | "aborted" | "failed";

export async function tryPlay(audio: HTMLAudioElement): Promise<PlayResult> {
  try {
    await audio.play();
    return "playing";
  } catch (err) {
    if (err instanceof DOMException) {
      if (err.name === "AbortError") return "aborted"; // src changed mid-request, normal
      if (err.name === "NotAllowedError") return "blocked"; // autoplay policy
    }
    return "failed";
  }
}

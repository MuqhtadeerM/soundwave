export const artworkUrl = (seed: string, size = 600): string =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;

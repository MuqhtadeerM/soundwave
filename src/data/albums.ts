import type { Album } from "@/types/music";
import { artworkUrl } from "@/lib/utils/artwork";

export const ALBUMS: readonly Album[] = [
  {
    id: "alb-neon-tides",
    title: "Neon Tides",
    artistId: "art-nova-lane",
    releaseYear: 2025,
    coverUrl: artworkUrl("neon-tides"),
  },
  {
    id: "alb-paper-skies",
    title: "Paper Skies",
    artistId: "art-kairo-vale",
    releaseYear: 2024,
    coverUrl: artworkUrl("paper-skies"),
  },
  {
    id: "alb-quiet-machines",
    title: "Quiet Machines",
    artistId: "art-luma-grey",
    releaseYear: 2026,
    coverUrl: artworkUrl("quiet-machines"),
  },
];

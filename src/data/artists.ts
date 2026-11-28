import type { Artist } from "@/types/music";
import { artworkUrl } from "@/lib/utils/artwork";

export const ARTISTS: readonly Artist[] = [
  {
    id: "art-nova-lane",
    name: "Nova Lane",
    genre: "Electronic",
    imageUrl: artworkUrl("nova-lane"),
  },
  {
    id: "art-kairo-vale",
    name: "Kairo Vale",
    genre: "Chillhop",
    imageUrl: artworkUrl("kairo-vale"),
  },
  {
    id: "art-luma-grey",
    name: "Luma Grey",
    genre: "Ambient",
    imageUrl: artworkUrl("luma-grey"),
  },
];

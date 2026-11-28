import type { Track } from "@/types/music";
import { soundHelix } from "@/lib/audio/sources";
import { ALBUMS } from "./albums";
import { ARTISTS } from "./artists";

interface TrackSeed {
  title: string;
  albumId: string;
  song: number; // which SoundHelix file
  duration: number;
}

const SEEDS: readonly TrackSeed[] = [
  { title: "Afterglow", albumId: "alb-neon-tides", song: 1, duration: 360 },
  { title: "Neon Tides", albumId: "alb-neon-tides", song: 2, duration: 340 },
  { title: "Slow Orbit", albumId: "alb-neon-tides", song: 3, duration: 330 },
  { title: "Paper Skies", albumId: "alb-paper-skies", song: 4, duration: 300 },
  {
    title: "Low Tide Radio",
    albumId: "alb-paper-skies",
    song: 5,
    duration: 320,
  },
  { title: "Window Seat", albumId: "alb-paper-skies", song: 6, duration: 310 },
  {
    title: "Quiet Machines",
    albumId: "alb-quiet-machines",
    song: 7,
    duration: 350,
  },
  {
    title: "Static Bloom",
    albumId: "alb-quiet-machines",
    song: 8,
    duration: 340,
  },
  {
    title: "Night Shift",
    albumId: "alb-quiet-machines",
    song: 9,
    duration: 330,
  },
];

export const TRACKS: readonly Track[] = SEEDS.map((seed, i) => {
  const album = ALBUMS.find((a) => a.id === seed.albumId);
  const artist = album
    ? ARTISTS.find((a) => a.id === album.artistId)
    : undefined;
  if (!album || !artist) throw new Error(`Bad seed data for "${seed.title}"`);
  return {
    id: `trk-${i + 1}`,
    title: seed.title,
    artistId: artist.id,
    artistName: artist.name,
    albumId: album.id,
    albumTitle: album.title,
    coverUrl: album.coverUrl,
    src: soundHelix(seed.song),
    duration: seed.duration,
    genre: artist.genre,
  };
});

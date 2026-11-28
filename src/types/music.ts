export interface Artist {
  id: string;
  name: string;
  genre: string;
  imageUrl: string;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  releaseYear: number;
  coverUrl: string;
}

export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumTitle: string;
  coverUrl: string;
  src: string;
  duration: number; // seconds, approximate; the player shows audio.duration once loaded
  genre: string;
}

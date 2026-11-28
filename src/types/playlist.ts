export interface Playlist {
  id: string;
  name: string;
  coverUrl: string | null; // data URL from an uploaded image; null = auto cover
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
}

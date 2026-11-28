import { ListMusic } from "lucide-react";
import { Artwork } from "@/components/ui/artwork";
import { getTrackById } from "@/data/tracks";
import { cn } from "@/lib/utils/cn";
import type { Playlist } from "@/types/playlist";

export function PlaylistCover({
  playlist,
  className,
}: {
  playlist: Playlist;
  className?: string;
}) {
  const firstId = playlist.trackIds[0];
  const firstTrack = firstId ? getTrackById(firstId) : undefined;
  const src = playlist.coverUrl ?? firstTrack?.coverUrl ?? null;

  if (!src) {
    return (
      <div
        aria-hidden
        className={cn(
          "grid place-items-center bg-gradient-to-br from-accent/70 to-surface-2 text-white/90",
          className,
        )}
      >
        <ListMusic className="size-1/2" />
      </div>
    );
  }
  return <Artwork src={src} alt="" className={className} />;
}

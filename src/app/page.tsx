import { TrackList } from "@/components/music/track-list";
import { PageHeader } from "@/components/ui/page-header";
import { TRACKS } from "@/data/tracks";

export default function HomePage() {
  return (
    <>
      <PageHeader
        title="Home"
        description="Phase 2 test list. The real home page arrives in Phase 4."
      />
      <TrackList tracks={TRACKS} />
    </>
  );
}

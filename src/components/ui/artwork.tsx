"use client";

import { useState } from "react";
import { Music2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ArtworkProps {
  src: string;
  alt: string;
  className?: string;
}

export function Artwork({ src, alt, className }: ArtworkProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "grid place-items-center bg-gradient-to-br from-accent/60 to-surface-2 text-fg/70",
          className,
        )}
      >
        <Music2 className="size-1/3" aria-hidden />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className={cn("bg-surface-2 object-cover", className)}
    />
  );
}

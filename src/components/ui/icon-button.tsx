import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

export function IconButton({
  label,
  active = false,
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "grid size-10 place-items-center rounded-full text-muted transition-colors hover:text-fg disabled:opacity-40 disabled:hover:text-muted",
        active && "text-accent hover:text-accent",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

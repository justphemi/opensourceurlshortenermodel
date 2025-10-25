import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PixelBadgeProps {
  children: ReactNode;
  className?: string;
}

const PixelBadge = ({ children, className }: PixelBadgeProps) => {
  return (
    <div
      className={cn(
        "pixel-border-sm inline-block px-4 py-2 bg-primary text-primary-foreground",
        "font-pixel text-[9px] uppercase",
        className
      )}
    >
      {children}
    </div>
  );
};

export default PixelBadge;

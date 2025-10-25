import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {}

const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "pixel-inset w-full px-4 py-3 bg-background text-foreground font-pixel text-[9px]",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary",
          className
        )}
        {...props}
      />
    );
  }
);

PixelInput.displayName = "PixelInput";

export default PixelInput;

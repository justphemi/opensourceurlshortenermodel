import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = "pixel-border pixel-press font-pixel uppercase transition-all duration-100";
    
    const variantStyles = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    };
    
    const sizeStyles = {
      sm: "px-4 py-2 text-[9px]",
      md: "px-6 py-3 text-[9px]",
      lg: "px-8 py-4 text-[12px]"
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          props.disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PixelButton.displayName = "PixelButton";

export default PixelButton;

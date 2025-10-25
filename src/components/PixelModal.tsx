import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ReactNode } from "react";
import PixelButton from "./PixelButton";

interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

const PixelModal = ({ isOpen, onClose, children, title, className }: PixelModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in">
      <div 
        className={cn(
          "pixel-border bg-background p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto",
          "animate-scale-in",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-pixel text-[14px] uppercase">{title}</h2>
            <button
              onClick={onClose}
              className="hover:text-primary transition-colors p-2"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default PixelModal;

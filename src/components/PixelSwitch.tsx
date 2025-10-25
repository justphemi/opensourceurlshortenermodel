import { cn } from "@/lib/utils";

interface PixelSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

const PixelSwitch = ({ checked, onCheckedChange, label }: PixelSwitchProps) => {
  return (
    <label className="flex items-center pixel-gap cursor-pointer">
      <div
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative w-16 h-8 pixel-border-sm transition-colors",
          checked ? "bg-primary" : "bg-secondary"
        )}
      >
        <div
          className={cn(
            "absolute top-1 w-6 h-6 bg-background transition-transform duration-200",
            "border-2 border-border",
            checked ? "translate-x-8" : "translate-x-1"
          )}
        />
      </div>
      {label && (
        <span className="font-pixel text-[9px] uppercase">{label}</span>
      )}
    </label>
  );
};

export default PixelSwitch;

import { useState, useEffect } from "react";
import PixelModal from "./PixelModal";
import PixelInput from "./PixelInput";
import PixelButton from "./PixelButton";
import { checkSlugAvailability } from "@/lib/firestore";
import { Check, X } from "lucide-react";

interface SlugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onShorten: (slug: string) => void;
}

const SlugModal = ({ isOpen, onClose, onBack, onShorten }: SlugModalProps) => {
  const [slug, setSlug] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (!slug) {
      setAvailable(null);
      setError("");
      return;
    }
    
    const checkSlug = async () => {
      const slugRegex = /^[a-zA-Z0-9-]{3,50}$/;
      
      if (!slugRegex.test(slug)) {
        setError("3-50 characters, alphanumeric + hyphens only");
        setAvailable(false);
        return;
      }
      
      setError("");
      setChecking(true);
      
      try {
        const isAvailable = await checkSlugAvailability(slug);
        setAvailable(isAvailable);
      } catch (err) {
        setError("Error checking availability");
      } finally {
        setChecking(false);
      }
    };
    
    const timeout = setTimeout(checkSlug, 300);
    return () => clearTimeout(timeout);
  }, [slug]);
  
  const handleShorten = () => {
    if (available) {
      onShorten(slug);
      setSlug("");
      setAvailable(null);
      setError("");
    }
  };
  
  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="Choose your custom slug">
      <div className="space-y-6">
        <div className="flex items-center pixel-gap">
          <span className="font-pixel text-[9px] text-muted-foreground">
            {window.location.origin}/
          </span>
          <div className="flex-1 relative">
            <PixelInput
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="my-link"
              maxLength={50}
              autoFocus
            />
            {slug && !checking && available !== null && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {available ? (
                  <Check className="text-primary" size={16} />
                ) : (
                  <X className="text-destructive" size={16} />
                )}
              </div>
            )}
          </div>
        </div>
        
        {error && (
          <p className="text-destructive font-pixel text-[9px]">{error}</p>
        )}
        
        {available === true && (
          <p className="text-primary font-pixel text-[9px]">✓ Available</p>
        )}
        
        {available === false && !error && (
          <p className="text-destructive font-pixel text-[9px]">✗ Taken</p>
        )}
        
        <div className="flex justify-between">
          <PixelButton onClick={onBack} variant="secondary">
            Back
          </PixelButton>
          <PixelButton 
            onClick={handleShorten} 
            disabled={!available || checking}
          >
            Shorten
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
};

export default SlugModal;

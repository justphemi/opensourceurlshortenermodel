import { useState } from "react";
import PixelModal from "./PixelModal";
import PixelInput from "./PixelInput";
import PixelButton from "./PixelButton";

interface TitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (title: string) => void;
}

const TitleModal = ({ isOpen, onClose, onNext }: TitleModalProps) => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  
  const handleNext = () => {
    if (!title.trim()) {
      setError("Title cannot be empty");
      return;
    }
    
    if (title.length > 100) {
      setError("Title must be less than 100 characters");
      return;
    }
    
    onNext(title.trim());
    setTitle("");
    setError("");
  };
  
  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="Give your link a title">
      <div className="space-y-6">
        <PixelInput
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
          placeholder="Enter title..."
          maxLength={100}
          autoFocus
        />
        
        {error && (
          <p className="text-destructive font-pixel text-[9px]">{error}</p>
        )}
        
        <div className="flex justify-end pixel-gap">
          <PixelButton onClick={handleNext} disabled={!title.trim()}>
            Next
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
};

export default TitleModal;

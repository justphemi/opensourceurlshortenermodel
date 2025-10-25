import { useState } from "react";
import PixelModal from "./PixelModal";
import PixelInput from "./PixelInput";
import PixelButton from "./PixelButton";

interface EditTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  onSave: (newTitle: string) => void;
}

const EditTitleModal = ({ isOpen, onClose, currentTitle, onSave }: EditTitleModalProps) => {
  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState("");
  
  const handleSave = () => {
    if (!title.trim()) {
      setError("Title cannot be empty");
      return;
    }
    
    if (title.length > 100) {
      setError("Title must be less than 100 characters");
      return;
    }
    
    onSave(title.trim());
    setError("");
  };
  
  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="Edit Title">
      <div className="space-y-6">
        <PixelInput
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
          placeholder="Enter new title..."
          maxLength={100}
          autoFocus
        />
        
        {error && (
          <p className="text-destructive font-pixel text-[9px]">{error}</p>
        )}
        
        <div className="flex justify-between">
          <PixelButton onClick={onClose} variant="secondary">
            Cancel
          </PixelButton>
          <PixelButton onClick={handleSave} disabled={!title.trim()}>
            Save
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
};

export default EditTitleModal;

import PixelModal from "./PixelModal";
import PixelButton from "./PixelButton";
import { QRCode } from 'react-qrcode-logo';
import { Copy, Check, Download, X } from "lucide-react";
import { useState, useRef } from "react";
import { LinkData } from "@/lib/firestore";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: LinkData | null;
}

const QR_COLORS = [
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Black', value: '#000000' },
];

const SuccessModal = ({ isOpen, onClose, link }: SuccessModalProps) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qrColor, setQrColor] = useState('#6366F1'); // Default indigo
  const qrRef = useRef<HTMLDivElement>(null);
  
  const handleCopy = async () => {
    if (link) {
      await navigator.clipboard.writeText(link.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!link || !qrRef.current) return;
    
    setDownloading(true);
    
    try {
      // Find the canvas element inside the QR code component
      const canvas = qrRef.current.querySelector('canvas');
      
      if (canvas) {
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create download link
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            
            // Generate filename from slug or title
            const filename = `qr-${link.slug || 'code'}.png`;
            
            downloadLink.href = url;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Clean up
            URL.revokeObjectURL(url);
          }
          setDownloading(false);
        }, 'image/png');
      } else {
        setDownloading(false);
      }
    } catch (error) {
      console.error('Failed to download QR code:', error);
      setDownloading(false);
    }
  };
  
  if (!link) return null;
  
  return (
    <PixelModal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between">
          <h2 className="font-pixel text-sm uppercase text-primary">
            Link Created!
          </h2>
          <button
            onClick={onClose}
            className="hover:text-primary transition-colors p-1"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Link Title */}
          <div className="text-center">
            <h3 className="font-pixel text-xs sm:text-sm uppercase">{link.title}</h3>
          </div>
          
          {/* Short URL */}
          <div className="pixel-border-sm p-4 bg-secondary">
            <p className="font-pixel text-[9px] break-all text-center">{link.shortUrl}</p>
          </div>
          
          {/* Creation Date */}
          <p className="font-pixel text-[9px] text-muted-foreground text-center">
            Created {new Date(link.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          
          {/* QR Code */}
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="pixel-border-sm p-4 bg-background" ref={qrRef}>
                <QRCode 
                  value={link.shortUrl} 
                  size={200}
                  qrStyle="dots"
                  fgColor={qrColor}
                  eyeRadius={5}
                />
              </div>
            </div>

            {/* Color Picker */}
            <div className="pixel-border-sm p-3 bg-secondary">
              <p className="font-pixel text-[11px] text-muted-foreground mb-2 uppercase text-center">
                QR Code Color
              </p>
              <div className="flex items-center justify-center gap-2">
                {QR_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setQrColor(color.value)}
                    className={`
                        w-8 h-8 rounded-full transition-all
                        ${qrColor === color.value 
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' 
                          : 'hover:scale-105'
                        }
                      `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    aria-label={`Select ${color.name} color`}
                  />
                ))}
              </div>
            </div>

            {/* Download QR Button */}
            <div className="flex justify-center">
              <button
                onClick={handleDownloadQR}
                disabled={downloading}
                className="font-pixel text-[11px] animate-pulse uppercase flex items-center gap-2 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={12} />
                {downloading ? 'Downloading...' : 'Download QR Code'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <PixelButton onClick={handleCopy} className="flex items-center justify-center">
            {copied ? (
              <>
                <Check size={16} className="mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} className="mr-2" />
                Copy Link
              </>
            )}
          </PixelButton>

          <PixelButton 
            onClick={onClose} 
            variant="secondary"
            className="flex items-center justify-center"
          >
            <X size={16} className="mr-2" />
            Close
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
};

export default SuccessModal;
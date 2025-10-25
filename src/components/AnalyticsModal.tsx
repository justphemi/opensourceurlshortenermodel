import PixelModal from "./PixelModal";
import PixelButton from "./PixelButton";
import { QRCode } from 'react-qrcode-logo';
import { Copy, Check, Edit2, X, Download } from "lucide-react";
import { useState, useRef } from "react";
import { LinkData } from "@/lib/firestore";
import { getDeviceId } from "@/lib/deviceId";

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: LinkData | null;
  onEdit?: () => void;
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

const AnalyticsModal = ({ isOpen, onClose, link, onEdit }: AnalyticsModalProps) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qrColor, setQrColor] = useState('#6366F1'); // Default indigo
  const qrRef = useRef<HTMLDivElement>(null);
  const deviceId = getDeviceId();
  const isOwner = link?.deviceId === deviceId;
  
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
  
  // Calculate top countries
  const countryCounts = link.clicks.reduce((acc, click) => {
    acc[click.country] = (acc[click.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  // Calculate top referrers
  const referrerCounts = link.clicks.reduce((acc, click) => {
    acc[click.source] = (acc[click.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topReferrers = Object.entries(referrerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  return (
    <PixelModal isOpen={isOpen} onClose={onClose} className="">
      <div className="space-y-6">
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-pixel text-xs sm:text-sm uppercase">
              {link.title}
            </h3>
            {isOwner && onEdit && (
              <button 
                onClick={onEdit} 
                className="hover:text-primary transition-colors p-1"
                aria-label="Edit title"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="hover:text-primary transition-colors p-1"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Link Info & Stats */}
          <div className="space-y-4">
            {/* Click Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="pixel-border-sm p-4 bg-primary text-primary-foreground text-center">
                <p className="font-pixel text-xl sm:text-2xl">{link.totalClicks}</p>
                <p className="font-pixel text-[9px] mt-2 uppercase">Total Clicks</p>
              </div>
              
              <div className="pixel-border-sm p-4 bg-primary text-primary-foreground text-center">
                <p className="font-pixel text-xl sm:text-2xl">{link.uniqueClicks}</p>
                <p className="font-pixel text-[9px] mt-2 uppercase">Unique Clicks</p>
              </div>
            </div>

            {/* Creation Info */}
            <div className="pixel-border-sm p-4 bg-secondary">
              <p className="font-pixel text-[9px] text-muted-foreground mb-2 uppercase">
                Created
              </p>
              <p className="font-pixel text-[9px]">
                {new Date(link.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="font-pixel text-[9px] text-muted-foreground mt-1">
                From {link.createdFrom}
              </p>
            </div>


            {/* Original URL */}
            <div className="pixel-border-sm p-4 bg-secondary">
              <p className="font-pixel text-[9px] text-muted-foreground mb-2 uppercase">
                Original URL
              </p>
              <p className="font-pixel text-[9px] break-all">{link.originalUrl}</p>
            </div>
            
            {/* Top Countries */}
            <div className="pixel-border-sm p-4 bg-secondary">
              <p className="font-pixel text-[9px] text-muted-foreground mb-3 uppercase">
                Top Countries
              </p>
              <div className="space-y-2">
                {topCountries.length > 0 ? (
                  topCountries.map(([country, count]) => (
                    <div 
                      key={country} 
                      className="flex justify-between items-center py-1"
                    >
                      <span className="font-pixel text-[9px]">{country}</span>
                      <span className="font-pixel text-[9px] text-primary font-bold">
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="font-pixel text-[9px] text-center py-2">
                    No data yet
                  </p>
                )}
              </div>
            </div>
            
            {/* Top Referrers */}
            <div className="pixel-border-sm p-4 bg-secondary">
              <p className="font-pixel text-[9px] text-muted-foreground mb-3 uppercase">
                Top Referrers
              </p>
              <div className="space-y-2">
                {topReferrers.length > 0 ? (
                  topReferrers.map(([referrer, count]) => (
                    <div 
                      key={referrer} 
                      className="flex justify-between items-center gap-2 py-1"
                    >
                      <span className="font-pixel text-[9px] truncate flex-1">
                        {referrer}
                      </span>
                      <span className="font-pixel text-[9px] text-primary font-bold">
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="font-pixel text-[9px] text-center py-2">
                    No data yet
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - QR Code & Analytics */}
          <div className="space-y-4">
            {/* Short URL */}
            <div className="pixel-border-sm p-4 mb-10 bg-secondary">
              <p className="font-pixel text-[9px] text-muted-foreground mb-2 uppercase">
                Short URL
              </p>
              <p className="font-pixel text-[9px] break-all">{link.shortUrl}</p>
            </div>
            
            
            {/* QR Code */}
            <div className="space-y-3">
              <div className="flex mb-10 justify-center">
                <div className="pixel-border-sm p-4 bg-background" ref={qrRef}>
                  <QRCode 
                    value={link.shortUrl} 
                    size={225}
                    qrStyle="dots"
                    fgColor={qrColor}
                    eyeRadius={5}
                  />
                </div>
              </div>
              
              {/* Color Picker */}
              <div className="pixel-border-sm p-3 bg-secondary">
                <p className="font-pixel text-[9px] text-muted-foreground mb-2 uppercase text-center">
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
        </div>
        
        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
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

export default AnalyticsModal;
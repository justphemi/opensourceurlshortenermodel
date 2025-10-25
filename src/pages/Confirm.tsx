import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import PixelButton from "@/components/PixelButton";
import { getLink, logClick, LinkData } from "@/lib/firestore";
import { getCountry } from "@/lib/country";
import { TriangleAlert } from "lucide-react";

const Confirm = () => {
  const { slug } = useParams<{ slug: string }>();
  const [link, setLink] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  useEffect(() => {
    const fetchLink = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      
      try {
        const linkData = await getLink(slug);
        
        if (!linkData) {
          setNotFound(true);
        } else {
          setLink(linkData);
          
          // Log the click
          const country = await getCountry();
          const referrer = document.referrer || 'direct';
          await logClick(slug, country.country, referrer);
        }
      } catch (error) {
        console.error("Error fetching link:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLink();
  }, [slug]);
  
  const handleContinue = () => {
    if (link) {
      window.location.href = link.originalUrl;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="font-pixel text-[12px] text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (notFound) {
    return <Navigate to="/404" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <p className="font-pixel text-[16px] md:text-[24px] uppercase text-muted-foreground">
            Proceed to
          </p>
          
          <h1 className="font-pixel text-[20px] md:text-[40px] uppercase text-primary break-words">
            {link?.title}
          </h1>
          
        </div>
        
        <div className="space-y-4">
          <PixelButton onClick={handleContinue} size="lg">
            Continue
          </PixelButton>
          
          <p className="font-pixel text-[9px] text-muted-foreground">
            @ {window.location.origin}
          </p>
        </div>
          <div className="pixel-border-sm inline-block px-6 py-3 bg-secondary">
            <p className="font-pixel text-[9px] flex gap-2 items-center text-destructive">
               <TriangleAlert />Be careful of phishing links
            </p>
          </div>
      </div>
    </div>
  );
};

export default Confirm;

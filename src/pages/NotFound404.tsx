import { Link } from "react-router-dom";
import PixelButton from "@/components/PixelButton";

const NotFound404 = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="font-pixel text-[60px] md:text-[100px] text-primary">
            404
          </h1>
          
          <p className="font-pixel text-[12px] md:text-[16px] uppercase text-foreground">
            Link Not Found
          </p>
          
          <div className="pixel-border-sm inline-block px-6 py-3 bg-secondary">
            <p className="font-pixel text-[9px] text-muted-foreground">
              This shortened link doesn't exist or has been removed
            </p>
          </div>
        </div>
        
        <Link to="/">
          <PixelButton size="lg">
            Return Home
          </PixelButton>
        </Link>
      </div>
    </div>
  );
};

export default NotFound404;

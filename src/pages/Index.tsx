import { useState, useEffect } from "react";
import { toast } from "sonner";
import PixelButton from "@/components/PixelButton";
import PixelInput from "@/components/PixelInput";
import PixelSwitch from "@/components/PixelSwitch";
import PixelBadge from "@/components/PixelBadge";
import TitleModal from "@/components/TitleModal";
import SlugModal from "@/components/SlugModal";
import SuccessModal from "@/components/SuccessModal";
import AnalyticsModal from "@/components/AnalyticsModal";
import EditTitleModal from "@/components/EditTitleModal";
import LinksTable from "@/components/LinksTable";
import { getDeviceId } from "@/lib/deviceId";
import { 
  addLink, 
  getAllLinks, 
  getUserLinks, 
  getUniqueUsersCount,
  updateTitle,
  LinkData 
} from "@/lib/firestore";
import { Github } from "lucide-react";

const ITEMS_PER_PAGE = 5;

const Index = () => {
  const [url, setUrl] = useState("");
  const [showOnlyMyLinks, setShowOnlyMyLinks] = useState(false);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uniqueUsers, setUniqueUsers] = useState(0);
  
  // Modal states
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [slugModalOpen, setSlugModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [editTitleModalOpen, setEditTitleModalOpen] = useState(false);
  
  // Data states
  const [pendingTitle, setPendingTitle] = useState("");
  const [pendingUrl, setPendingUrl] = useState("");
  const [createdLink, setCreatedLink] = useState<LinkData | null>(null);
  const [selectedLink, setSelectedLink] = useState<LinkData | null>(null);
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);
  
  const deviceId = getDeviceId();
  console.log(deviceId);
  
  const fetchLinks = async () => {
    setLoading(true);
    try {
      const fetchedLinks = showOnlyMyLinks 
        ? await getUserLinks(deviceId)
        : await getAllLinks();
      
      // Set links even if empty array
      setLinks(fetchedLinks || []);
      setCurrentPage(1);
      
      const count = await getUniqueUsersCount();
      setUniqueUsers(count);
    } catch (error) {
      console.error("Error fetching links:", error);
      // Don't show error toast for empty results
      // Only show error for actual failures
      if (error instanceof Error && !error.message.includes("empty")) {
        toast.error("Failed to load links");
      }
      // Set empty array on error
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLinks();
  }, [showOnlyMyLinks, deviceId]);
  
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  const handleShortenClick = () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    
    if (!validateUrl(url)) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    setPendingUrl(url);
    setTitleModalOpen(true);
  };
  
  const handleTitleNext = (title: string) => {
    setPendingTitle(title);
    setTitleModalOpen(false);
    setSlugModalOpen(true);
  };
  
  const handleShorten = async (slug: string) => {
    setSlugModalOpen(false);
    
    try {
      await addLink(pendingTitle, slug, pendingUrl, deviceId);
      
      const newLink: LinkData = {
        title: pendingTitle,
        slug,
        originalUrl: pendingUrl,
        shortUrl: `${window.location.origin}/${slug}`,
        createdAt: Date.now(),
        cCode: "",
        createdFrom: "Unknown",
        deviceId,
        totalClicks: 0,
        uniqueClicks: 0,
        clicks: []
      };
      
      setCreatedLink(newLink);
      setSuccessModalOpen(true);
      setUrl("");
      setPendingTitle("");
      setPendingUrl("");
      
      // Refresh links
      await fetchLinks();
      
      toast.success("Link created successfully!");
    } catch (error) {
      console.error("Error creating link:", error);
      toast.error("Failed to create link");
    }
  };
  
  const handleRowClick = (link: LinkData) => {
    setSelectedLink(link);
    setAnalyticsModalOpen(true);
  };
  
  const handleEditClick = (link: LinkData) => {
    setEditingLink(link);
    setEditTitleModalOpen(true);
  };
  
  const handleSaveTitle = async (newTitle: string) => {
    if (!editingLink) return;
    
    try {
      await updateTitle(editingLink.slug, newTitle, deviceId);
      setEditTitleModalOpen(false);
      setEditingLink(null);
      
      // Update the link in the list
      setLinks(links.map(link => 
        link.slug === editingLink.slug 
          ? { ...link, title: newTitle }
          : link
      ));
      
      // Update selected link if it's the same
      if (selectedLink?.slug === editingLink.slug) {
        setSelectedLink({ ...selectedLink, title: newTitle });
      }
      
      toast.success("Title updated successfully!");
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title");
    }
  };
  
  const paginatedLinks = links.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const totalPages = Math.ceil(links.length / ITEMS_PER_PAGE);
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-4 px-4">
          {/* Title */}
          <h1 className="font-pixel text-lg sm:text-xl md:text-2xl lg:text-3xl uppercase text-primary leading-tight">
            Open Source Link Shortener 
          </h1>

          {/* Version & GitHub Link */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <p className="font-pixel text-[9px] sm:text-xs uppercase text-muted-foreground">
              V 1.0.0
            </p>
            
            <a 
              href="https://github.com/justphemi/opensourceurlshortenermodel" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-pixel text-[9px] sm:text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>@justphemi</span>
            </a>
          </div>

          {/* User Badge */}
          <div className="flex justify-center">
            <PixelBadge>{uniqueUsers} Users</PixelBadge>
          </div>
        </div>
        
        {/* URL Input */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row pixel-gap">
            <PixelInput
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter link to shrink sharps..."
              onKeyDown={(e) => e.key === 'Enter' && handleShortenClick()}
              className="flex-1"
            />
            <PixelButton onClick={handleShortenClick} className="md:w-auto">
              Shorten
            </PixelButton>
          </div>
          
          <div className="flex justify-center">
            <PixelSwitch
              checked={showOnlyMyLinks}
              onCheckedChange={setShowOnlyMyLinks}
              label="Show only my links"
            />
          </div>
        </div>
        
        {/* Links Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="font-pixel text-[10px] text-muted-foreground animate-pulse">
              Loading...
            </p>
          </div>
        ) : links.length === 0 ? (
          <div className="pixel-border bg-background p-12 text-center">
            <p className="font-pixel text-[10px] text-muted-foreground mb-4">
              {showOnlyMyLinks 
                ? "You don't have any links yet. Create your first one!" 
                : "No links yet. Be the first to create one!"}
            </p>
            {showOnlyMyLinks && (
              <PixelButton 
                onClick={() => setShowOnlyMyLinks(false)}
                variant="secondary"
                className="mt-4"
              >
                View All Links
              </PixelButton>
            )}
          </div>
        ) : (
          <LinksTable
            links={paginatedLinks}
            onClickRow={handleRowClick}
            onEditTitle={handleEditClick}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      
      {/* Modals */}
      <TitleModal
        isOpen={titleModalOpen}
        onClose={() => setTitleModalOpen(false)}
        onNext={handleTitleNext}
      />
      
      <SlugModal
        isOpen={slugModalOpen}
        onClose={() => setSlugModalOpen(false)}
        onBack={() => {
          setSlugModalOpen(false);
          setTitleModalOpen(true);
        }}
        onShorten={handleShorten}
      />
      
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        link={createdLink}
      />
      
      <AnalyticsModal
        isOpen={analyticsModalOpen}
        onClose={() => {
          setAnalyticsModalOpen(false);
          setSelectedLink(null);
        }}
        link={selectedLink}
        onEdit={() => {
          if (selectedLink) {
            setAnalyticsModalOpen(false);
            handleEditClick(selectedLink);
          }
        }}
      />
      
      <EditTitleModal
        isOpen={editTitleModalOpen}
        onClose={() => {
          setEditTitleModalOpen(false);
          setEditingLink(null);
        }}
        currentTitle={editingLink?.title || ""}
        onSave={handleSaveTitle}
      />
    </div>
  );
};

export default Index;
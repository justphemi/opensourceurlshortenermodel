import { LinkData } from "@/lib/firestore";
import { Edit2, Search } from "lucide-react";
import { getDeviceId } from "@/lib/deviceId";
import { useState } from "react";

interface LinksTableProps {
  links: LinkData[];
  onClickRow: (link: LinkData) => void;
  onEditTitle: (link: LinkData) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const LinksTable = ({ 
  links, 
  onClickRow, 
  onEditTitle, 
  currentPage, 
  totalPages, 
  onPageChange 
}: LinksTableProps) => {
  const deviceId = getDeviceId();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter links based on search query
  const filteredLinks = links.filter((link) => {
    const query = searchQuery.toLowerCase();
    return (
      link.title.toLowerCase().includes(query) ||
      link.shortUrl.toLowerCase().includes(query) ||
      link.originalUrl.toLowerCase().includes(query)
    );
  });
  
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="pixel-border-sm bg-background p-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search by title or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-secondary font-pixel text-[9px] uppercase placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block pixel-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-4 border-border">
                <th className="p-4 text-left font-pixel text-[9px] uppercase">Title</th>
                <th className="p-4 text-left font-pixel text-[9px] uppercase">Short URL</th>
                <th className="p-4 text-center font-pixel text-[9px] uppercase">Country</th>
                <th className="p-4 text-center font-pixel text-[9px] uppercase">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <p className="font-pixel text-[9px] text-muted-foreground">
                      {searchQuery 
                        ? "No links match your search." 
                        : "No links yet. Create your first one!"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLinks.map((link) => (
                  <tr
                    key={link.slug}
                    onClick={() => onClickRow(link)}
                    className="border-b-2 border-border cursor-pointer hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-[9px] truncate max-w-[200px]">
                          {link.title}
                        </span>
                        {link.deviceId === deviceId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTitle(link);
                            }}
                            className="hover:text-primary transition-colors flex-shrink-0"
                            aria-label="Edit title"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-pixel text-[9px] text-primary truncate block max-w-[250px]">
                        {link.shortUrl}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <img 
                          src={`https://flagsapi.com/${link.cCode}/flat/64.png`}
                          alt={link.createdFrom}
                          className="w-8 h-6 object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-pixel text-[9px]">{link.totalClicks}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredLinks.length === 0 ? (
          <div className="pixel-border bg-background p-8 text-center">
            <p className="font-pixel text-[9px] text-muted-foreground">
              {searchQuery 
                ? "No links match your search." 
                : "No links yet. Create your first one!"}
            </p>
          </div>
        ) : (
          filteredLinks.map((link) => (
            <div
              key={link.slug}
              onClick={() => onClickRow(link)}
              className="pixel-border-sm bg-background p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-pixel text-[9px] truncate">
                    {link.title}
                  </span>
                  {link.deviceId === deviceId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTitle(link);
                      }}
                      className="hover:text-primary transition-colors flex-shrink-0"
                      aria-label="Edit title"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <img 
                    src={`https://flagsapi.com/${link.cCode}/flat/64.png`}
                    alt={link.createdFrom}
                    className="w-6 h-5 object-cover"
                  />
                  <span className="font-pixel text-[9px] bg-secondary px-2 py-1">
                    {link.totalClicks}
                  </span>
                </div>
              </div>
              <div className="font-pixel text-[9px] text-primary truncate">
                {link.shortUrl}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="font-pixel text-[9px] hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-3 py-2"
          >
            ← PREV
          </button>
          
          <span className="font-pixel text-[9px] px-4 py-2 pixel-border-sm bg-secondary">
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="font-pixel text-[9px] hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-3 py-2"
          >
            NEXT →
          </button>
        </div>
      )}

      {/* Search Results Count */}
      {searchQuery && (
        <div className="text-center">
          <p className="font-pixel text-[9px] text-muted-foreground">
            Found {filteredLinks.length} {filteredLinks.length === 1 ? 'link' : 'links'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LinksTable;
import React, { useState, useEffect } from "react";
import { Search, Download, Sparkles, Film, Grid, Image as ImageIcon, Sliders, Check, Eye } from "lucide-react";
import { GalleryItem } from "../types";

export default function LayerOneGuest() {
  const [activeTab, setActiveTab] = useState<"gallery" | "downloader" | "enhancer">("gallery");
  
  // Gallery states
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingGallery, setLoadingGallery] = useState(false);

  // Downloader states
  const [downloadUrl, setDownloadUrl] = useState("");
  const [extractedMedia, setExtractedMedia] = useState<any | null>(null);
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [downloaderError, setDownloaderError] = useState("");

  // Enhancer states
  const [enhancerImg, setEnhancerImg] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedProgress, setEnhancedProgress] = useState(0);
  const [enhancedImg, setEnhancedImg] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);

  // Fetch gallery items from local API
  useEffect(() => {
    fetchGallery();
  }, [selectedCategory, searchQuery]);

  const fetchGallery = async () => {
    setLoadingGallery(true);
    try {
      const res = await fetch(`/api/image-center/gallery?category=${selectedCategory}&search=${searchQuery}`);
      const data = await res.json();
      if (data.success) {
        setGalleryItems(data.items);
      }
    } catch (err) {
      console.error("Error fetching image gallery:", err);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleMediaExtract = async () => {
    if (!downloadUrl) return;
    setLoadingExtract(true);
    setDownloaderError("");
    setExtractedMedia(null);

    try {
      const res = await fetch("/api/downloader/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: downloadUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setExtractedMedia(data);
      } else {
        setDownloaderError(data.error || "Failed to extract video grid stream.");
      }
    } catch (err) {
      setDownloaderError("Mainframe error: Downlink decoder failed to connect.");
    } finally {
      setLoadingExtract(false);
    }
  };

  // HD Enhancer Simulation
  const handleEnhancerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEnhancerImg(reader.result as string);
        setEnhancedImg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerHD_Enhancement = () => {
    if (!enhancerImg) return;
    setIsEnhancing(true);
    setEnhancedProgress(0);

    const interval = setInterval(() => {
      setEnhancedProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsEnhancing(false);
          // Set "enhanced" version - apply custom CSS filter or highly saturated/brightened mock representation
          setEnhancedImg(enhancerImg);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Category selector / Menu */}
      <div className="flex border-b border-cyan-500/20 bg-zinc-950/40 p-1.5 rounded-xl gap-2 backdrop-blur-md">
        <button
          id="tab-gallery"
          onClick={() => setActiveTab("gallery")}
          className={`flex-1 py-2.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "gallery" ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]" : "text-cyan-400 hover:bg-cyan-500/10"}`}
        >
          <Grid className="h-4 w-4" /> GALLERY SYSTEM
        </button>
        <button
          id="tab-downloader"
          onClick={() => setActiveTab("downloader")}
          className={`flex-1 py-2.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "downloader" ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]" : "text-cyan-400 hover:bg-cyan-500/10"}`}
        >
          <Film className="h-4 w-4" /> MEDIA EXTRACTOR
        </button>
        <button
          id="tab-enhancer"
          onClick={() => setActiveTab("enhancer")}
          className={`flex-1 py-2.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "enhancer" ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]" : "text-cyan-400 hover:bg-cyan-500/10"}`}
        >
          <Sparkles className="h-4 w-4" /> HD ENHANCER
        </button>
      </div>

      {/* LAYER ONE: GALLERY SYSTEM */}
      {activeTab === "gallery" && (
        <div className="space-y-6 animate-fade-in">
          {/* Gallery controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-cyan-500/60" />
              <input
                id="gallery-search"
                type="text"
                placeholder="Search wallpaper archives (e.g. Cyberpunk, Anime, Cars...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-cyan-500/20 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono text-white placeholder-cyan-700/50 focus:outline-none focus:border-cyan-400"
              />
            </div>
            {/* Category filter */}
            <select
              id="gallery-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black/40 border border-cyan-500/20 text-cyan-400 font-mono text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all">ALL CATEGORIES</option>
              <option value="cyberpunk">CYBERPUNK AESTHETICS</option>
              <option value="dark themes">GOTHIC & DARK THEMES</option>
              <option value="cars">HIGH VELOCITY CARS</option>
              <option value="technology">QUANTUM NODE TECHNOLOGY</option>
              <option value="anime">NEON ANIME HORIZONS</option>
            </select>
          </div>

          {/* Masonry Layout Grid */}
          {loadingGallery ? (
            <div className="flex flex-col items-center justify-center h-64 text-cyan-400 font-mono">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
              <span>SYNCING WALLPAPER MAIN INFRASTRUCTURE...</span>
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="border border-dashed border-cyan-500/20 rounded-xl p-12 text-center text-cyan-600 font-mono">
              <span>No assets located in the specified quadrant.</span>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="break-inside-avoid bg-zinc-900/60 border border-cyan-500/10 rounded-xl overflow-hidden group hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300 relative"
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover max-h-[360px] group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Hover Overlay info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-xxs font-mono text-cyan-400 uppercase tracking-widest">{item.category}</span>
                    <h4 className="text-sm font-bold text-white mb-1 truncate">{item.title}</h4>
                    <div className="flex items-center justify-between mt-2 border-t border-cyan-500/20 pt-2 font-mono text-xxs">
                      <span className="text-gray-400">Node: {item.author}</span>
                      <a
                        href={item.url}
                        download={`${item.title.replace(/\s+/g, "_")}.jpg`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 bg-cyan-500 rounded text-black hover:bg-cyan-400 flex items-center justify-center cursor-pointer"
                        title="Download Asset"
                      >
                        <Download className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LAYER ONE: MEDIA DOWNLOADER */}
      {activeTab === "downloader" && (
        <div className="space-y-6 max-w-xl mx-auto bg-zinc-950/60 border border-cyan-500/25 p-6 rounded-2xl backdrop-blur-md relative shadow-[0_0_20px_rgba(6,182,212,0.05)]">
          <div className="absolute top-0 right-0 p-3 text-xxs font-mono text-cyan-600">DOWN_MODULE_v3</div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Film className="h-5 w-5 text-cyan-400" /> MULTI-GRID DECODER
            </h3>
            <p className="text-xs text-cyan-400/70 font-mono">
              Deploy raw web URLs of TikToks, YouTubes, or Instagram Reels into the neural decryptor interface.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex gap-2">
              <input
                id="media-url-input"
                type="text"
                placeholder="Paste TikTok, YouTube, or Instagram address link..."
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMediaExtract()}
                className="flex-1 bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-cyan-800 focus:outline-none focus:border-cyan-400"
              />
              <button
                id="media-extract-btn"
                onClick={handleMediaExtract}
                disabled={loadingExtract || !downloadUrl}
                className="px-5 bg-cyan-500 text-black font-mono font-bold rounded-xl hover:bg-cyan-400 transition-all cursor-pointer disabled:opacity-40"
              >
                {loadingExtract ? "DECODING..." : "DECODE"}
              </button>
            </div>

            {downloaderError && (
              <div className="bg-red-950/30 border border-red-500/30 p-3 rounded-lg font-mono text-xs text-red-400">
                {downloaderError}
              </div>
            )}

            {/* Extracted Card Result */}
            {extractedMedia && (
              <div className="border border-cyan-500/30 bg-black/40 rounded-xl p-4 space-y-4 animate-fade-in">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-cyan-500/20 flex-shrink-0 relative">
                    <img src={extractedMedia.thumbnail} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-xxs font-mono text-cyan-400">
                      {extractedMedia.duration}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-xxs font-mono bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded text-cyan-400 uppercase">
                      {extractedMedia.platform}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">{extractedMedia.title}</h4>
                    <p className="text-xxs font-mono text-gray-400">Payload File Size: {extractedMedia.size}</p>
                  </div>
                </div>

                <a
                  id="media-download-link"
                  href={extractedMedia.downloadUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-cyan-500 text-black font-mono font-bold rounded-xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                >
                  <Download className="h-4 w-4" /> EXTRACT RAW TARGET FILE (MP4)
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LAYER ONE: HD ENHANCER */}
      {activeTab === "enhancer" && (
        <div className="space-y-6 max-w-xl mx-auto bg-zinc-950/60 border border-cyan-500/25 p-6 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.05)] relative">
          <div className="absolute top-0 right-0 p-3 text-xxs font-mono text-cyan-600">SYS_ENHANCE_v2</div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" /> MATRIX HD ENHANCER
            </h3>
            <p className="text-xs text-cyan-400/70 font-mono">
              Upload raw image arrays to run sharpening filters, gamma alignments, and ambient noise purges.
            </p>
          </div>

          {!enhancerImg ? (
            /* Upload box */
            <div className="border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/50 rounded-2xl p-10 text-center transition-colors relative bg-black/20">
              <input
                id="enhancer-file-upload"
                type="file"
                accept="image/*"
                onChange={handleEnhancerUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <ImageIcon className="h-10 w-10 text-cyan-500/40 mx-auto mb-3" />
              <p className="text-sm font-mono text-cyan-400">Drag & Drop Image Matrix</p>
              <p className="text-xxs font-mono text-cyan-600 mt-1">or click to browse local files</p>
            </div>
          ) : (
            /* Enhancement Stage */
            <div className="space-y-4">
              {isEnhancing ? (
                /* Scanning state */
                <div className="border border-cyan-500/30 rounded-xl overflow-hidden relative h-64 bg-black flex items-center justify-center">
                  <img src={enhancerImg} alt="Original" className="absolute inset-0 w-full h-full object-contain opacity-40 blur-sm" />
                  {/* Cyber Laser Scanner */}
                  <div className="absolute inset-x-0 h-[2.5px] bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,1)] animate-bounce" style={{ animationDuration: "3s" }} />
                  <div className="relative z-10 text-center font-mono space-y-2 bg-black/60 p-4 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
                    <span className="text-cyan-400 text-sm font-bold block animate-pulse">ENHANCING VECTOR RESOLUTION...</span>
                    <span className="text-cyan-500 text-xl font-bold">{enhancedProgress}%</span>
                  </div>
                </div>
              ) : !enhancedImg ? (
                /* Stage trigger */
                <div className="space-y-4">
                  <div className="border border-cyan-500/20 rounded-xl overflow-hidden h-64 bg-black flex items-center justify-center">
                    <img src={enhancerImg} alt="uploaded preview" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      id="cancel-enhance-btn"
                      onClick={() => setEnhancerImg(null)}
                      className="px-4 py-2.5 rounded-xl border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-mono text-xs transition-colors cursor-pointer"
                    >
                      FLUSH CACHE
                    </button>
                    <button
                      id="trigger-enhance-btn"
                      onClick={triggerHD_Enhancement}
                      className="flex-1 py-2.5 bg-cyan-500 text-black font-mono font-bold rounded-xl hover:bg-cyan-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" /> EXECUTE HD UPSCALING PROTOCOL
                    </button>
                  </div>
                </div>
              ) : (
                /* Enhanced comparator slider */
                <div className="space-y-4">
                  <span className="text-xxs font-mono text-cyan-500 block">SLIDE COMPARATOR TO ASSESS CONTRAST ENHANCEMENTS:</span>
                  <div className="border border-cyan-500/30 rounded-xl overflow-hidden h-64 relative bg-black select-none">
                    {/* Before Image */}
                    <img src={enhancerImg} alt="Before" className="absolute inset-0 w-full h-full object-contain filter grayscale brightness-75 contrast-75" />
                    
                    {/* After Image Container clipped via position */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden border-r border-cyan-400"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={enhancedImg}
                        alt="After"
                        className="absolute inset-0 w-full h-full object-contain filter saturate-125 brightness-110 contrast-110"
                        style={{ width: "100%", maxWidth: "none" }} // Ensure original aspect matches
                      />
                    </div>

                    {/* Interactive Split Slider controller overlay */}
                    <input
                      id="enhancer-split-slider"
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-ew-resize z-20 w-full h-full"
                    />

                    {/* Drag indicator handle bar */}
                    <div
                      className="absolute inset-y-0 w-[2px] bg-cyan-400 pointer-events-none z-10 flex items-center justify-center"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="h-8 w-8 rounded-full border border-cyan-400 bg-black text-cyan-400 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                        <Sliders className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      id="reset-enhancer-btn"
                      onClick={() => {
                        setEnhancerImg(null);
                        setEnhancedImg(null);
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-mono text-xs transition-colors cursor-pointer"
                    >
                      ENHANCE ANOTHER FILE
                    </button>
                    <a
                      id="download-enhanced-btn"
                      href={enhancedImg}
                      download="enhanced_cyber_image.jpg"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 bg-cyan-500 text-black font-mono font-bold rounded-xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    >
                      <Download className="h-4 w-4" /> DOWNLOAD HD ASSET
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

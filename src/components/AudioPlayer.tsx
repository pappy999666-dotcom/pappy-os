import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, Volume2, VolumeX, Music, Disc } from "lucide-react";
import { CYBER_PLAYLIST, Track } from "../types";

export default function AudioPlayer() {
  const [playlist] = useState<Track[]>(CYBER_PLAYLIST);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);
  const [isDucked, setIsDucked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeTrack = playlist[currentIndex];

  useEffect(() => {
    // Instantiate HTML Audio element
    audioRef.current = new Audio(activeTrack.url);
    audioRef.current.loop = true;
    audioRef.current.volume = isMuted ? 0 : volume;

    if (isPlaying) {
      audioRef.current.play().catch((err) => console.log("Audio play deferred until user interaction.", err));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentIndex]);

  // Handle browser autoplay policies by initiating audio on first user touch/key/click interaction if isPlaying is true
  useEffect(() => {
    const startAutoplay = () => {
      if (isPlaying && audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };
    window.addEventListener("click", startAutoplay, { once: true });
    window.addEventListener("keydown", startAutoplay, { once: true });
    window.addEventListener("touchstart", startAutoplay, { once: true });
    return () => {
      window.removeEventListener("click", startAutoplay);
      window.removeEventListener("keydown", startAutoplay);
      window.removeEventListener("touchstart", startAutoplay);
    };
  }, [isPlaying, currentIndex]);

  // Adjust volume / mute / duck states
  useEffect(() => {
    if (audioRef.current) {
      const targetVolume = isMuted ? 0 : isDucked ? volume * 0.15 : volume;
      audioRef.current.volume = targetVolume;
    }
  }, [volume, isMuted, isDucked]);

  // Play/Pause toggler
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Listen to AI speaking events to duck/restore background music
  useEffect(() => {
    const handleSpeakStart = () => {
      setIsDucked(true);
    };
    const handleSpeakEnd = () => {
      setIsDucked(false);
    };

    window.addEventListener("pappy-ai-speak-start", handleSpeakStart);
    window.addEventListener("pappy-ai-speak-end", handleSpeakEnd);

    return () => {
      window.removeEventListener("pappy-ai-speak-start", handleSpeakStart);
      window.removeEventListener("pappy-ai-speak-end", handleSpeakEnd);
    };
  }, [volume]);

  return (
    <div
      id="pappy-audio-player"
      className="bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden"
    >
      {/* Decorative cyber grid accent */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      {/* Info */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className={`p-3 rounded-lg bg-cyan-950/50 border border-cyan-500/40 text-cyan-400 ${isPlaying && !isDucked ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }}>
          <Disc className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-mono text-cyan-500 tracking-wider">AMBIENT AUDIO MODULATOR</span>
          <span className="text-sm font-medium text-white truncate max-w-[180px]">{activeTrack.title}</span>
          <span className="text-xxs font-mono text-cyan-400/60 truncate">{activeTrack.artist}</span>
        </div>
      </div>

      {/* Visualizer Lines */}
      <div className="flex items-end gap-1 h-6 px-2">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`w-1 bg-cyan-500 rounded-t transition-all duration-300 ${isPlaying && !isDucked ? "animate-pulse" : "h-1"}`}
            style={{
              height: isPlaying && !isDucked ? `${Math.floor(Math.random() * 20) + 4}px` : "3px",
              animationDelay: `${i * 120}ms`,
              animationDuration: `${400 + Math.random() * 600}ms`,
              opacity: isDucked ? 0.3 : 1,
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
        <div className="flex items-center gap-2">
          <button
            id="audio-toggle-play"
            onClick={togglePlay}
            className="p-2.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all cursor-pointer shadow-[0_0_8px_rgba(6,182,212,0.3)]"
            title={isPlaying ? "Pause Grid Ambient" : "Engage Grid Ambient"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            id="audio-skip-track"
            onClick={handleNext}
            className="p-2 rounded-full hover:bg-white/10 text-cyan-300/80 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Next Waveform"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            id="audio-toggle-mute"
            onClick={toggleMute}
            className="text-cyan-400/70 hover:text-cyan-400 transition-colors"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            id="audio-volume-range"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-16 h-1 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {isDucked && (
          <span className="text-xxs font-mono text-purple-400 px-2 py-0.5 border border-purple-500/30 bg-purple-950/50 rounded animate-pulse">
            DUCKING ACTIVE
          </span>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Terminal, Compass, Crop, Cpu, ShieldAlert, Clock, Send, Sparkles, AlertCircle, HelpCircle, Mail, MessageSquare, Menu, X } from "lucide-react";
import WelcomeExperience from "./components/WelcomeExperience";
import AudioPlayer from "./components/AudioPlayer";
import LayerOneGuest from "./components/LayerOneGuest";
import LayerTwoPFP from "./components/LayerTwoPFP";
import LayerThreeBot from "./components/LayerThreeBot";
import { ChatMessage } from "./types";
import { speakRobotic } from "./lib/robotVoice";

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [userName, setUserName] = useState("");
  const [userGreeting, setUserGreeting] = useState("");
  const [activeLayer, setActiveLayer] = useState<"layer1" | "layer2" | "layer3">("layer1");
  const [currentTime, setCurrentTime] = useState("");

  // AI Chat panel states
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [colorProfile, setColorProfile] = useState<"cyber-green" | "neon-purple" | "matrix-amber">("cyber-green");

  // Style definitions for dynamic color profiles
  const profileStyles = {
    "cyber-green": {
      panelBorder: "border-emerald-500/35",
      glowEffect: "shadow-[0_0_35px_rgba(16,185,129,0.08)]",
      headerText: "text-emerald-400 font-gothic tracking-wider",
      headerBorder: "border-emerald-500/20",
      pulseBg: "bg-emerald-400",
      userBubble: "bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 shadow-[0_2px_10px_rgba(16,185,129,0.03)]",
      modelBubble: "bg-zinc-900/85 border border-zinc-800/80 text-zinc-300",
      inputContainer: "border-emerald-500/25 focus-within:border-emerald-500/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]",
      sendBtn: "text-emerald-400 hover:text-emerald-300",
      pillActive: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
      pillInactive: "text-emerald-600/70 hover:text-emerald-500 hover:bg-emerald-500/5 border-transparent",
      typingIndicatorBg: "bg-emerald-950/15 border border-emerald-500/10 text-emerald-400",
      accentBg: "bg-emerald-500",
      accentBorder: "border-emerald-500/40",
      accentGlow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
      textAccent: "text-emerald-400",
      navActive: "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] border-emerald-400/50",
      bodyOverlay: "from-emerald-950/5 via-transparent to-transparent"
    },
    "neon-purple": {
      panelBorder: "border-purple-500/35",
      glowEffect: "shadow-[0_0_35px_rgba(168,85,247,0.08)]",
      headerText: "text-purple-400 font-gothic tracking-wider",
      headerBorder: "border-purple-500/20",
      pulseBg: "bg-purple-400",
      userBubble: "bg-purple-950/20 border border-purple-500/30 text-purple-300 shadow-[0_2px_10px_rgba(168,85,247,0.03)]",
      modelBubble: "bg-zinc-900/85 border border-zinc-800/80 text-zinc-300",
      inputContainer: "border-purple-500/25 focus-within:border-purple-500/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]",
      sendBtn: "text-purple-400 hover:text-purple-300",
      pillActive: "bg-purple-500/15 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.15)]",
      pillInactive: "text-purple-600/70 hover:text-purple-500 hover:bg-purple-500/5 border-transparent",
      typingIndicatorBg: "bg-purple-950/15 border border-purple-500/10 text-purple-400",
      accentBg: "bg-purple-500",
      accentBorder: "border-purple-500/40",
      accentGlow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
      textAccent: "text-purple-400",
      navActive: "bg-purple-500 text-black shadow-[0_0_15px_rgba(168,85,247,0.4)] border-purple-400/50",
      bodyOverlay: "from-purple-950/5 via-transparent to-transparent"
    },
    "matrix-amber": {
      panelBorder: "border-amber-500/35",
      glowEffect: "shadow-[0_0_35px_rgba(245,158,11,0.08)]",
      headerText: "text-amber-500 font-gothic tracking-wider",
      headerBorder: "border-amber-500/20",
      pulseBg: "bg-amber-500",
      userBubble: "bg-amber-950/15 border border-amber-500/30 text-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.03)]",
      modelBubble: "bg-zinc-900/85 border border-zinc-800/80 text-zinc-300",
      inputContainer: "border-amber-500/25 focus-within:border-amber-500/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]",
      sendBtn: "text-amber-500 hover:text-amber-400",
      pillActive: "bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
      pillInactive: "text-amber-600/70 hover:text-amber-500 hover:bg-amber-500/5 border-transparent",
      typingIndicatorBg: "bg-amber-950/15 border-amber-500/10 text-amber-400",
      accentBg: "bg-amber-500",
      accentBorder: "border-amber-500/40",
      accentGlow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
      textAccent: "text-amber-500",
      navActive: "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] border-amber-400/50",
      bodyOverlay: "from-amber-950/5 via-transparent to-transparent"
    }
  };

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync real-time UTC / Cyber Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setCurrentTime(now.toLocaleTimeString("en-US", options) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize user profile keys from localStorage if they exist
  useEffect(() => {
    const name = localStorage.getItem("pappy_user_name");
    const greet = localStorage.getItem("pappy_user_greeting");
    if (name && greet) {
      setUserName(name);
      setUserGreeting(greet);
      setOnboarded(true);
      // Greet message
      setChatMessages([
        {
          role: "model",
          parts: [{ text: `[CORE_ACTIVE] Welcome back, ${greet} ${name}. Cyber grid is operating at 100% capacity. Feel free to traverse our three layers or prompt me with queries.` }],
        },
      ]);
    }
  }, []);

  const handleOnboardingComplete = (name: string, greet: string) => {
    setUserName(name);
    setUserGreeting(greet);
    setOnboarded(true);
    setChatMessages([
      {
        role: "model",
        parts: [{ text: `[CORE_ACTIVE] Identification verified: Welcome, ${greet} ${name}. The platform layers are unlocked. How can I assist you on the mainframe today?` }],
      },
    ]);
  };

  // Submit query to server-side Gemini Proxy
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");

    const newHistory = [...chatMessages, { role: "user" as const, parts: [{ text: userMsg }] }];
    setChatMessages(newHistory);
    setChatLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: chatMessages }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "model" as const, parts: [{ text: data.text }] }]);
      
      // Pronounce AI response using the dynamic high-fidelity robotic synth speech engine
      if (data.text) {
        speakRobotic(data.text);
      }
    } catch (err) {
      console.error("AI node response error:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "model" as const,
          parts: [{ text: "[WARNING] Neural proxy transmitter link compromised. Fallback offline response buffer active." }],
        },
      ]);
    } finally {
      setChatLoading(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-x-hidden select-none pb-24 md:pb-8">
      
      {/* 1. First Visit Onboarding welcome experience */}
      {!onboarded && <WelcomeExperience onComplete={handleOnboardingComplete} />}

      {/* Cyber ambient particle network background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none z-0" />
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full transition-all duration-1000 pointer-events-none blur-[120px] ${
        colorProfile === "cyber-green" ? "bg-emerald-500/5" : colorProfile === "neon-purple" ? "bg-purple-500/5" : "bg-amber-500/5"
      }`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full transition-all duration-1000 pointer-events-none blur-[120px] ${
        colorProfile === "cyber-green" ? "bg-emerald-500/5" : colorProfile === "neon-purple" ? "bg-purple-500/5" : "bg-amber-500/5"
      }`} />

      {/* 2. Top Navigation & Brand HUD */}
      <header className={`sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b ${profileStyles[colorProfile].headerBorder} px-6 py-4 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-300`}>
        <div className="flex items-center gap-4">
          {/* Logo Frame: Sharp, Gothic Medallion with double nested borders */}
          <div className="relative group">
            <div className={`w-11 h-11 border ${profileStyles[colorProfile].panelBorder} bg-black flex items-center justify-center p-1 rounded-none rotate-45 transition-transform duration-700 hover:rotate-[225deg] ${profileStyles[colorProfile].glowEffect}`}>
              <div className="w-full h-full border border-dashed border-zinc-800 flex items-center justify-center bg-zinc-950">
                <span className={`-rotate-45 font-gothic font-extrabold text-base tracking-tighter ${profileStyles[colorProfile].textAccent}`}>𝔓</span>
              </div>
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${profileStyles[colorProfile].pulseBg} border-2 border-black animate-pulse`} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-2.5">
              <h1 className="text-base font-black font-gothic tracking-[0.25em] text-white">PAPPY <span className={profileStyles[colorProfile].textAccent}>OS</span></h1>
              <span className={`text-[9px] font-mono border ${profileStyles[colorProfile].panelBorder} bg-black/40 px-2 py-0.5 rounded-none text-zinc-400 tracking-widest`}>CORE_V1.0.4</span>
            </div>
            {onboarded ? (
              <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
                MAIN_SECURE_LINK // <span className={profileStyles[colorProfile].textAccent}>{userGreeting} {userName}</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-500 tracking-wider">OFFLINE_GUEST_ENTRY_PORTAL</span>
            )}
          </div>
        </div>

        {/* Theme Profile Switcher HUD - Centered, styled like a tactical mainframe deck */}
        <div className={`hidden lg:flex items-center gap-3 border-x border-zinc-900/60 px-6 py-1 mx-4`}>
          <span className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase">GOTHIC_TINT //</span>
          <div className="flex bg-black/60 p-1 border border-zinc-900 rounded-none gap-1">
            {(Object.keys(profileStyles) as Array<keyof typeof profileStyles>).map((profile) => {
              const isActive = colorProfile === profile;
              let label = "EMERALD";
              if (profile === "neon-purple") label = "VIOLET";
              if (profile === "matrix-amber") label = "AMBER";
              return (
                <button
                  key={profile}
                  onClick={() => setColorProfile(profile)}
                  className={`px-3 py-1 text-[9px] font-mono tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? `${profileStyles[profile].accentBg} text-black font-black shadow-[0_0_10px_rgba(255,255,255,0.05)]` 
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Creator Info HUD & Clock - Desktop only */}
        <div className={`hidden md:flex items-center gap-6 font-mono text-[10px] border-l ${profileStyles[colorProfile].headerBorder} pl-6`}>
          <div className="flex items-center gap-2 bg-black/40 border border-zinc-900/60 px-3 py-1.5 rounded-none">
            <Clock className={`h-3.5 w-3.5 ${profileStyles[colorProfile].textAccent} animate-pulse`} />
            <span className={`${profileStyles[colorProfile].textAccent} font-bold tracking-widest`}>{currentTime}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-600 text-[9px] uppercase tracking-[0.2em]">CREATOR_HUD</span>
            <div className="flex items-center gap-3 mt-0.5 text-zinc-400">
              <a href="mailto:pappyishim@outlook.com" className={`hover:underline flex items-center gap-1 hover:${profileStyles[colorProfile].textAccent} transition-colors`}>
                <Mail className="h-3 w-3" /> pappyishim@outlook.com
              </a>
              <span className="text-zinc-800">|</span>
              <a href="https://t.me/pappylung" target="_blank" rel="noreferrer" className={`hover:underline hover:${profileStyles[colorProfile].textAccent} transition-colors`}>
                TG: @pappylung
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            id="mobile-menu-trigger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-none border ${profileStyles[colorProfile].panelBorder} ${profileStyles[colorProfile].textAccent} hover:bg-zinc-900/40`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden fixed inset-x-0 top-[76px] bg-zinc-950/95 border-b ${profileStyles[colorProfile].panelBorder} p-4 z-40 space-y-4 font-mono text-xs shadow-2xl backdrop-blur-lg animate-fade-in`}>
          <div className="flex flex-col gap-2">
            <span className={`text-xxs ${profileStyles[colorProfile].textAccent} uppercase tracking-widest mb-1`}>Navigation Sectors</span>
            <button
              onClick={() => {
                setActiveLayer("layer1");
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2 px-3 rounded-none text-left border ${activeLayer === "layer1" ? profileStyles[colorProfile].navActive : "border-transparent text-zinc-400 hover:bg-zinc-900/40"}`}
            >
              LAYER 1: GUEST MATRIX
            </button>
            <button
              onClick={() => {
                setActiveLayer("layer2");
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2 px-3 rounded-none text-left border ${activeLayer === "layer2" ? profileStyles[colorProfile].navActive : "border-transparent text-zinc-400 hover:bg-zinc-900/40"}`}
            >
              LAYER 2: PFP CENTER
            </button>
            <button
              onClick={() => {
                setActiveLayer("layer3");
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2 px-3 rounded-none text-left border ${activeLayer === "layer3" ? profileStyles[colorProfile].navActive : "border-transparent text-zinc-400 hover:bg-zinc-900/40"}`}
            >
              LAYER 3: WHATSAPP BOT
            </button>
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-900 pt-3">
            <span className={`text-xxs ${profileStyles[colorProfile].textAccent} uppercase tracking-widest mb-1`}>Switch Theme</span>
            <div className="grid grid-cols-3 gap-1 bg-black/40 p-1">
              {(Object.keys(profileStyles) as Array<keyof typeof profileStyles>).map((profile) => (
                <button
                  key={profile}
                  onClick={() => setColorProfile(profile)}
                  className={`py-1 text-[9px] text-center font-mono tracking-tighter ${
                    colorProfile === profile 
                      ? `${profileStyles[profile].accentBg} text-black font-bold` 
                      : "text-zinc-500"
                  }`}
                >
                  {profile === "cyber-green" ? "EMERALD" : profile === "neon-purple" ? "VIOLET" : "AMBER"}
                </button>
              ))}
            </div>
          </div>

          <div className={`border-t border-zinc-900 pt-3 flex justify-between text-[10px] ${profileStyles[colorProfile].textAccent}`}>
            <span>CLOCK: {currentTime}</span>
            <a href="mailto:pappyishim@outlook.com" className="hover:underline">Contact Pappy</a>
          </div>
        </div>
      )}

      {/* 3. Primary Workspace Grid Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COMPACT NAVIGATION RAIL (Desktop) */}
        <div className="hidden md:block md:col-span-1 space-y-4">
          <div className={`bg-black/40 border ${profileStyles[colorProfile].panelBorder} rounded-none p-2 flex flex-col gap-3 items-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${profileStyles[colorProfile].glowEffect}`}>
            <button
              id="layer-nav-l1"
              onClick={() => setActiveLayer("layer1")}
              className={`p-3 transition-all cursor-pointer border ${activeLayer === "layer1" ? profileStyles[colorProfile].navActive : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"}`}
              title="Layer 1: Guest Mode Gallery & Extractors"
            >
              <Compass className="h-5 w-5" />
            </button>
            <button
              id="layer-nav-l2"
              onClick={() => setActiveLayer("layer2")}
              className={`p-3 transition-all cursor-pointer border ${activeLayer === "layer2" ? profileStyles[colorProfile].navActive : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"}`}
              title="Layer 2: Profile Picture Scheduler & Aspect crop-free fit"
            >
              <Crop className="h-5 w-5" />
            </button>
            <button
              id="layer-nav-l3"
              onClick={() => setActiveLayer("layer3")}
              className={`p-3 transition-all cursor-pointer border ${activeLayer === "layer3" ? profileStyles[colorProfile].navActive : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"}`}
              title="Layer 3: Live WhatsApp Bot Console & stats"
            >
              <Cpu className="h-5 w-5" />
            </button>
          </div>
          <div 
            className={`text-center font-mono text-[8px] ${profileStyles[colorProfile].textAccent} uppercase tracking-[6px] py-4 select-none opacity-40 font-bold`}
            style={{ writingMode: "vertical-lr" }}
          >
            MAINFRAME LAYER STACK
          </div>
        </div>

        {/* CENTER CONTENT REGION */}
        <div className="col-span-1 md:col-span-7 space-y-6">
          {activeLayer === "layer1" && <LayerOneGuest />}
          {activeLayer === "layer2" && <LayerTwoPFP />}
          {activeLayer === "layer3" && <LayerThreeBot />}
        </div>

        {/* RIGHT INTERACTIVE PAPPY AI CHAT MONITOR (THE LIVING BRAIN) */}
        <div className="col-span-1 md:col-span-4 flex flex-col">
          <div className={`bg-zinc-950/80 border ${profileStyles[colorProfile].panelBorder} rounded-2xl flex flex-col h-[520px] md:h-full overflow-hidden ${profileStyles[colorProfile].glowEffect} relative backdrop-blur-md transition-all duration-300`}>
            {/* Ambient cyber accent */}
            <div className={`absolute top-0 right-0 p-3 text-xxs font-mono ${profileStyles[colorProfile].headerText} select-none opacity-40`}>AI_CORE_UNIT</div>
            
            {/* AI Core header */}
            <div className={`bg-zinc-950/80 border-b ${profileStyles[colorProfile].headerBorder} px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${profileStyles[colorProfile].pulseBg} animate-ping`} />
                <span className="text-xs font-mono font-bold text-white tracking-widest uppercase">Pappy AI Operating System</span>
              </div>
              <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-300 cursor-help" />
            </div>

            {/* COLOR PROFILE TOGGLES */}
            <div className={`px-4 py-1.5 bg-black/40 border-b ${profileStyles[colorProfile].headerBorder} flex items-center justify-between gap-1`}>
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">COLOR_PROFILE:</span>
              <div className="flex gap-1.5">
                {(Object.keys(profileStyles) as Array<keyof typeof profileStyles>).map((profile) => (
                  <button
                    key={profile}
                    onClick={() => setColorProfile(profile)}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono border uppercase tracking-tighter transition-all cursor-pointer ${
                      colorProfile === profile
                        ? profileStyles[profile].pillActive
                        : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-zinc-900/40"
                    }`}
                  >
                    {profile === "cyber-green" ? "Green" : profile === "neon-purple" ? "Purple" : "Amber"}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat message logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs scrollbar-thin scrollbar-thumb-zinc-800 bg-black/30">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-0.5">
                    {msg.role === "user" ? "Operator" : "Pappy AI Core"}
                  </span>
                  <div
                    className={`p-3 rounded-xl border font-mono text-[11px] leading-relaxed transition-all duration-300 ${
                      msg.role === "user"
                        ? profileStyles[colorProfile].userBubble
                        : profileStyles[colorProfile].modelBubble
                    }`}
                  >
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex flex-col max-w-[80%] items-start">
                  <span className={`text-[9px] font-mono ${profileStyles[colorProfile].headerText} uppercase tracking-widest animate-pulse`}>Pappy AI thinking...</span>
                  <div className={`p-3 border rounded-xl rounded-tl-none font-mono text-xxs transition-all duration-300 ${profileStyles[colorProfile].typingIndicatorBg}`}>
                    [NEURAL MATRIX RESOLVING TRANSCRIPT...]
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat query input bar */}
            <div className={`border-t ${profileStyles[colorProfile].headerBorder} bg-zinc-950/80 p-3`}>
              <div className={`flex bg-black/60 border ${profileStyles[colorProfile].inputContainer} rounded-xl px-3 py-1.5 gap-2 transition-all duration-300`}>
                <input
                  id="assistant-chat-input"
                  type="text"
                  placeholder="Ask Pappy AI to guide or traverse layers..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  disabled={chatLoading}
                  className="flex-1 bg-transparent font-mono text-xs text-white placeholder-zinc-700 focus:outline-none"
                />
                <button
                  id="assistant-send-btn"
                  onClick={handleSendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className={`p-1 ${profileStyles[colorProfile].sendBtn} hover:scale-105 active:scale-95 disabled:opacity-40 transition-all cursor-pointer`}
                  title="Deploy query to AI"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* 4. Floating Ambient Audio visualizer (Always docked nicely) */}
      <footer className={`fixed bottom-0 inset-x-0 z-30 p-4 bg-zinc-950/90 border-t ${profileStyles[colorProfile].headerBorder} shadow-2xl backdrop-blur-lg transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">
          <AudioPlayer />
        </div>
      </footer>

    </div>
  );
}

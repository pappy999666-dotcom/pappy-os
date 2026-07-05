import React, { useState, useEffect, useRef } from "react";
import { QrCode, Phone, Calendar, Upload, Trash, Plus, LogOut, Crop, Clock, ShieldAlert, Check, RefreshCw, Github, Sparkles } from "lucide-react";
import { PFPSchedule } from "../types";

export default function LayerTwoPFP() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Pairing Flow states
  const [phoneNode, setPhoneNode] = useState("");
  const [isPairing, setIsPairing] = useState(false);
  const [pairingMethod, setPairingMethod] = useState<"code" | "qr">("code");
  const [pairingCode, setPairingCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [pairingStatus, setPairingStatus] = useState("");
  const [isPaired, setIsPaired] = useState(false);

  // Image Upload and Aspect states
  const [pfpImg, setPfpImg] = useState<string | null>(null);
  const [pfpWidth, setPfpWidth] = useState(0);
  const [pfpHeight, setPfpHeight] = useState(0);
  const [fittingAspect, setFittingAspect] = useState("Original Uncropped Aspect");
  const [previewColor, setPreviewColor] = useState<"blur" | "black" | "cyber">("blur");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // AI PFP Generator states
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiStatus, setAiStatus] = useState("");

  // Scheduler states
  const [schedules, setSchedules] = useState<PFPSchedule[]>([]);
  const [repeatOption, setRepeatOption] = useState("Once");
  const [scheduleTime, setScheduleTime] = useState("12:00");
  const [scheduleDate, setScheduleDate] = useState("2026-07-05");
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/pfp-bot/schedules");
      const data = await res.json();
      if (data.success) {
        setSchedules(data.schedules);
      }
    } catch (err) {
      console.error("Error loading schedules:", err);
    }
  };

  // Simulates registration / quick login
  const handleMagicLogin = () => {
    if (!emailInput.trim()) return;
    setLoadingLogin(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setLoadingLogin(false);
    }, 1000);
  };

  // Pairing action
  const handleGeneratePairing = async () => {
    if (!phoneNode) return;
    setIsPairing(true);
    setPairingStatus("Mainframe contact initiated. Hooking Baileys transport layers...");
    try {
      const res = await fetch("/api/pfp-bot/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNode, method: pairingMethod }),
      });
      const data = await res.json();
      if (data.success) {
        setPairingCode(data.pairingCode);
        setQrCodeUrl(data.qrCode);
        setPairingStatus("Awaiting authentication... Enter the code in Linked Devices.");
        // Simulate successful link after 8 seconds
        setTimeout(() => {
          setIsPaired(true);
          setPairingStatus("Connected. Link established successfully with WhatsApp network.");
        }, 8000);
      }
    } catch (err) {
      setPairingStatus("Authentication failed: Transport link unavailable.");
    }
  };

  // Purge Session
  const handlePurgeSession = async () => {
    setIsPaired(false);
    setPhoneNode("");
    setPairingCode("");
    setQrCodeUrl("");
    setPairingStatus("Session destroyed. Keys deleted.");
    // Log to simulated console
    await fetch("/api/whatsapp-bot/logs/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "info", message: "Operator closed Layer Two profile connection." }),
    });
  };

  // Handle uploaded photo for crop-free fit
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          setPfpImg(reader.result as string);
          setPfpWidth(img.width);
          setPfpHeight(img.height);
          
          // Determine aspect description
          const ratio = img.width / img.height;
          if (Math.abs(ratio - 1) < 0.1) {
            setFittingAspect("Square (1:1)");
          } else if (ratio > 1.2) {
            setFittingAspect(`Landscape (${img.width}x${img.height})`);
          } else if (ratio < 0.8) {
            setFittingAspect(`Portrait (${img.width}x${img.height}) - Direct uncropped longer PFP transmission via Baileys`);
          } else {
            setFittingAspect(`Uncropped Aspect (${img.width}x${img.height})`);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // AI PFP Generator handler
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setGeneratingAi(true);
    setAiStatus("Connecting to Gemini AI Neuro-Composer...");
    try {
      const res = await fetch("/api/pfp-bot/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.success) {
        setAiStatus(`Visual composition synthesized successfully! (${data.source})`);
        setPfpImg(data.imageUrl);
        setPfpWidth(600);
        setPfpHeight(1066); // Custom 9:16 taller/longer portrait layout
        setFittingAspect("AI Uncropped 9:16 Portrait (Longer Layout)");
      } else {
        setAiStatus("Synthesis failure. Retry connection.");
      }
    } catch (err) {
      setAiStatus("Cyberlink error. Gemini neural nodes overloaded.");
    } finally {
      setGeneratingAi(false);
    }
  };

  // Render on Canvas preserving exact original aspect ratio (Uncropped Tall / Long Portrait / Landscape)
  useEffect(() => {
    if (!pfpImg || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Determine canvas proportions directly from image to support longer dimensions without cropping or padding!
      const maxWidth = 400;
      const maxHeight = 500; // Allows longer portrait format heights!
      
      let w = img.width;
      let h = img.height;
      
      const ratio = w / h;
      if (w > maxWidth) {
        w = maxWidth;
        h = maxWidth / ratio;
      }
      if (h > maxHeight) {
        h = maxHeight;
        w = maxHeight * ratio;
      }
      
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      
      // Draw image in original uncropped aspect ratio
      ctx.drawImage(img, 0, 0, w, h);
      
      // Draw a sleek cyan border highlighting the uncropped transmission bounds
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, w, h);
    };
    img.src = pfpImg;
  }, [pfpImg]);

  // Upload uncropped longer picture immediately
  const handleImmediateUpload = async () => {
    if (!pfpImg || !phoneNode || !isPaired) return;
    setLoadingSchedule(true);
    try {
      const res = await fetch("/api/pfp-bot/upload-immediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNode,
          imageData: canvasRef.current?.toDataURL("image/jpeg") || pfpImg,
          width: pfpWidth,
          height: pfpHeight
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        // Automatically close/purge session if requested (one-time task finishes!)
        handlePurgeSession();
      }
    } catch (err) {
      alert("Error pushing immediate profile picture updates.");
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Schedule a PFP change
  const handleCreateSchedule = async () => {
    if (!pfpImg || !phoneNode) return;
    setLoadingSchedule(true);
    try {
      const res = await fetch("/api/pfp-bot/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNode,
          imageUrl: pfpImg,
          aspect: fittingAspect,
          scheduledTime: `${scheduleTime} (${repeatOption})`,
          repeat: repeatOption,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSchedules();
        setPfpImg(null);
      }
    } catch (err) {
      console.error("Scheduler configuration failed:", err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Remove a schedule
  const handleDeleteSchedule = async (id: string) => {
    try {
      const res = await fetch("/api/pfp-bot/schedule/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchSchedules();
      }
    } catch (err) {
      console.error("Error removing schedule:", err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Dynamic Header */}
      <div className="flex justify-between items-center bg-zinc-950/40 p-4 border border-cyan-500/10 rounded-xl backdrop-blur-md">
        <div>
          <h2 className="text-md font-bold text-white font-mono flex items-center gap-2">
            <Crop className="h-5 w-5 text-cyan-400" /> LAYER TWO: PROFILE PICTURE CENTER
          </h2>
          <p className="text-xxs text-cyan-500/70 font-mono uppercase tracking-wider mt-0.5">
            CROP-FREE WhatsApp Dynamic PFP Manager & Scheduled Rotator
          </p>
        </div>
        {isPaired && (
          <button
            id="pfp-logout"
            onClick={handlePurgeSession}
            className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 font-mono text-xxs hover:bg-red-500 hover:text-black transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="h-3 w-3" /> PURGE & DISCONNECT
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Connection & Scheduling config */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* STEP 1: Fast Registration/Authentication */}
          {!isLoggedIn ? (
            <div className="bg-zinc-950/60 border border-cyan-500/20 p-5 rounded-2xl space-y-4 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <span className="text-xxs font-mono text-cyan-500 block tracking-widest uppercase">SECTION AUTH // REGISTER DIRECTORY</span>
              <h3 className="text-sm font-bold text-white font-mono">Unlock Scheduling Memory Channels</h3>
              <p className="text-xxs text-gray-400 leading-relaxed font-mono">
                One-time PFP updates require no account. Registration is required solely to store cron triggers and calendar schedules safely in our persistent memory databases.
              </p>

              <div className="space-y-3 pt-2">
                <input
                  id="pfp-login-email"
                  type="email"
                  placeholder="Enter email for secure magic link..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-cyan-800 focus:outline-none focus:border-cyan-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="pfp-github-login"
                    onClick={() => setIsLoggedIn(true)}
                    className="py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white font-mono text-xxs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Github className="h-3.5 w-3.5" /> GITHUB COUPLING
                  </button>
                  <button
                    id="pfp-magic-login"
                    onClick={handleMagicLogin}
                    disabled={loadingLogin || !emailInput}
                    className="py-2 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 font-mono text-xxs font-bold cursor-pointer disabled:opacity-40"
                  >
                    {loadingLogin ? "ENGAGING..." : "MAGIC COUPLING"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950/60 border border-purple-500/25 p-4 rounded-xl flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-purple-400 animate-pulse" />
                <span className="text-xs text-purple-400 font-bold">SCHEDULING CHANNELS ENGAGED</span>
              </div>
              <button
                id="pfp-deauth"
                onClick={() => setIsLoggedIn(false)}
                className="text-xxs text-purple-500/80 hover:text-purple-400"
              >
                [LOGOUT]
              </button>
            </div>
          )}

          {/* STEP 2: WhatsApp Pairing console */}
          <div className="bg-zinc-950/60 border border-cyan-500/20 p-5 rounded-2xl space-y-4">
            <span className="text-xxs font-mono text-cyan-500 block tracking-widest uppercase">WHATSAPP CONNECTION HARNESS</span>
            
            <div className="space-y-3">
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-cyan-500" />
                <input
                  id="pfp-phone-input"
                  type="text"
                  placeholder="Enter phone number (+250...)"
                  value={phoneNode}
                  onChange={(e) => setPhoneNode(e.target.value)}
                  disabled={isPaired}
                  className="w-full bg-black/50 border border-cyan-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-white placeholder-cyan-800 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex border border-cyan-500/20 bg-black/40 rounded-xl p-1 gap-1">
                <button
                  id="pair-method-code"
                  onClick={() => setPairingMethod("code")}
                  disabled={isPaired}
                  className={`flex-1 py-1.5 rounded-lg font-mono text-xxs tracking-wider ${pairingMethod === "code" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-cyan-500/60 hover:text-cyan-500"}`}
                >
                  PAIRING CODE
                </button>
                <button
                  id="pair-method-qr"
                  onClick={() => setPairingMethod("qr")}
                  disabled={isPaired}
                  className={`flex-1 py-1.5 rounded-lg font-mono text-xxs tracking-wider ${pairingMethod === "qr" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-cyan-500/60 hover:text-cyan-500"}`}
                >
                  QR SCANNER
                </button>
              </div>

              {!isPaired ? (
                <button
                  id="pfp-connect-btn"
                  onClick={handleGeneratePairing}
                  disabled={isPairing || !phoneNode}
                  className="w-full py-2.5 bg-cyan-500 text-black font-mono font-bold rounded-xl hover:bg-cyan-400 transition-all cursor-pointer disabled:opacity-40"
                >
                  {isPairing ? "COUPING WITH HARNESS..." : "INITIATE COUPLING LINK"}
                </button>
              ) : (
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl font-mono text-xs text-emerald-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SESSION LIVE ON NODE: +{phoneNode}</span>
                </div>
              )}
            </div>

            {/* Displaying Pairing codes / QR codes */}
            {isPairing && !isPaired && (
              <div className="bg-black/50 border border-cyan-500/25 rounded-xl p-4 text-center space-y-4 animate-fade-in">
                <p className="text-xxs font-mono text-cyan-400">{pairingStatus}</p>

                {pairingMethod === "code" && pairingCode && (
                  <div className="bg-cyan-950/30 border border-cyan-500/30 p-3.5 rounded-xl text-cyan-400 font-mono text-lg font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                    {pairingCode}
                  </div>
                )}

                {pairingMethod === "qr" && qrCodeUrl && (
                  <div className="p-3 bg-white rounded-xl max-w-[200px] mx-auto border border-cyan-500/30">
                    <img src={qrCodeUrl} alt="QR Code" className="w-full h-auto" />
                  </div>
                )}

                <div className="flex items-center gap-2 justify-center text-xxs font-mono text-cyan-600">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>LISTENING FOR DEVICE PAIRING TOKENS...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Crop-free image processor canvas & Schedules List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-950/60 border border-cyan-500/20 p-5 rounded-2xl space-y-5">
            <span className="text-xxs font-mono text-cyan-500 block tracking-widest uppercase">UNCROPPED ASPECT PREVIEW PROTOCOL</span>

            {!pfpImg ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Manual Upload box */}
                <div className="border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-6 text-center relative bg-black/20 flex flex-col justify-center items-center min-h-[220px]">
                  <input
                    id="pfp-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="h-6 w-6 text-cyan-500/40 mb-2" />
                  <p className="text-xs font-mono text-cyan-400 font-bold">MANUAL STREAM DEPLOY</p>
                  <p className="text-xxs font-mono text-cyan-600 mt-1 max-w-[180px] mx-auto leading-relaxed">
                    Deploy native tall portrait or wide landscape file. Uncropped binary stream preserves exact aspect.
                  </p>
                </div>

                {/* AI Composer box */}
                <div className="bg-zinc-900/40 border border-purple-500/20 rounded-2xl p-5 space-y-3 flex flex-col justify-between min-h-[220px]">
                  <div className="space-y-1.5">
                    <span className="text-xxs font-mono text-purple-400 font-bold flex items-center gap-1">
                      <Sparkles className="h-3 w-3 animate-pulse text-purple-400" /> GEMINI AI COMPOSER
                    </span>
                    <p className="text-xxs font-mono text-gray-400 leading-normal">
                      Formulate professional gothic/cyberpunk visual designs directly from neural grids.
                    </p>
                    <textarea
                      placeholder="Prompt: Gothic cyber warrior, glowing red optics, dark Tokyo skyline..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full bg-black/60 border border-purple-500/20 rounded-lg p-2 text-xxs font-mono text-white placeholder-purple-900/60 focus:outline-none focus:border-purple-500 min-h-[60px] resize-none"
                    />
                  </div>
                  <button
                    id="generate-ai-btn"
                    onClick={handleAiGenerate}
                    disabled={generatingAi || !aiPrompt}
                    className="w-full py-2 bg-purple-500 hover:bg-purple-400 text-black font-bold font-mono text-xxs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-40"
                  >
                    {generatingAi ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>SYNTHESIZING MATRIX...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        <span>DECREE AI COMPOSITION</span>
                      </>
                    )}
                  </button>
                  {aiStatus && (
                    <p className="text-xxs font-mono text-purple-400/80 text-center animate-fade-in text-[10px] truncate">
                      {aiStatus}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Square 1:1 Canvas container */}
                <div className="space-y-2">
                  <div className="min-h-[280px] bg-zinc-900 border border-cyan-500/30 rounded-xl overflow-hidden flex items-center justify-center relative p-3 shadow-inner">
                    <canvas ref={canvasRef} className="max-w-full max-h-[360px] object-contain rounded" />
                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded border border-cyan-500/10 text-[9px] font-mono text-cyan-400 uppercase tracking-wider">
                      RAW UNCROPPED (NO WHATSAPP INTERFERENCE)
                    </div>
                  </div>
                  <span className="text-xxs font-mono text-gray-400 block text-center truncate">{fittingAspect}</span>
                </div>

                {/* Configuration panel */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="bg-cyan-950/20 border border-cyan-500/20 p-3 rounded-xl space-y-1.5 font-mono">
                      <span className="text-xxs text-cyan-400 font-bold block">DIRECT TRANS-SOCKET HARNESS</span>
                      <p className="text-[10px] text-gray-400 leading-normal">
                        Your WhatsApp Bot uses Baileys direct binary transmission. We completely bypass native crop frames to render uncropped portrait visuals directly.
                      </p>
                    </div>

                    {isLoggedIn && (
                      <div className="space-y-2 border-t border-cyan-500/10 pt-3">
                        <span className="text-xxs font-mono text-purple-400 block">SCHEDULE AUTOMATIC CHANGE:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            id="schedule-date"
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="bg-black/50 border border-purple-500/20 rounded-lg px-2.5 py-1.5 font-mono text-xxs text-white"
                          />
                          <input
                            id="schedule-time"
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="bg-black/50 border border-purple-500/20 rounded-lg px-2.5 py-1.5 font-mono text-xxs text-white"
                          />
                        </div>
                        <div className="flex border border-purple-500/20 bg-black/40 rounded-xl p-1 gap-1">
                          {["Once", "Daily", "Weekly"].map((rep) => (
                            <button
                              key={rep}
                              onClick={() => setRepeatOption(rep)}
                              className={`flex-1 py-1 rounded font-mono text-xxs uppercase ${repeatOption === rep ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-purple-500/60 hover:text-purple-500"}`}
                            >
                              {rep}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-cyan-500/10">
                    <button
                      id="flush-photo-btn"
                      onClick={() => { setPfpImg(null); setAiPrompt(""); setAiStatus(""); }}
                      className="w-full py-1.5 rounded-xl border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-mono text-xxs"
                    >
                      FLUSH IMAGE BUFFER
                    </button>

                    {isLoggedIn ? (
                      <button
                        id="pfp-schedule-btn"
                        onClick={handleCreateSchedule}
                        disabled={loadingSchedule || !isPaired}
                        className="w-full py-2.5 bg-purple-600 text-white hover:bg-purple-500 font-mono text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(147,51,234,0.3)] cursor-pointer disabled:opacity-40"
                      >
                        {loadingSchedule ? "DEPLOING CRON TRIGGER..." : "CONFIRM MATRIX SCHEDULE"}
                      </button>
                    ) : (
                      <button
                        id="pfp-immediate-btn"
                        onClick={handleImmediateUpload}
                        disabled={loadingSchedule || !isPaired}
                        className="w-full py-2.5 bg-cyan-500 text-black hover:bg-cyan-400 font-mono text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer disabled:opacity-40"
                      >
                        {loadingSchedule ? "TRANSMITTING PHOTO..." : "ENGAGE ONE-TIME PFP UPDATE"}
                      </button>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Schedules list panel */}
          {isLoggedIn && (
            <div className="bg-zinc-950/60 border border-purple-500/20 p-5 rounded-2xl space-y-4">
              <span className="text-xxs font-mono text-purple-400 block tracking-widest uppercase">ACTIVE CHRON SCHEDULERS IN DATABASE</span>
              
              {schedules.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-purple-500/10 rounded-xl text-xxs font-mono text-purple-400/50">
                  No automated rotators registered in memory.
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((sched) => (
                    <div key={sched.id} className="flex items-center justify-between bg-black/40 border border-purple-500/15 p-3 rounded-xl gap-4 font-mono text-xxs">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={sched.imageUrl} alt="sched" className="w-10 h-10 rounded object-cover border border-purple-500/20" />
                        <div className="min-w-0 space-y-1">
                          <span className="text-xs font-bold text-white block truncate">Node: {sched.aspect}</span>
                          <div className="flex items-center gap-1.5 text-purple-400/80">
                            <Clock className="h-3 w-3" />
                            <span>Interval: {sched.scheduledTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2 py-0.5 rounded bg-purple-950/50 text-purple-400 border border-purple-500/25">ACTIVE</span>
                        <button
                          id={`delete-schedule-${sched.id}`}
                          onClick={() => handleDeleteSchedule(sched.id)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                          title="Purge Schedule Trigger"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

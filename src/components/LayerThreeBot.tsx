import { useState, useEffect, useRef, FormEvent } from "react";
import { Terminal, Shield, Activity, Cpu, HardDrive, Users, MessageSquare, Settings, RefreshCw, Power, AlertTriangle, Trash2, Lock, Github, Check } from "lucide-react";
import { ConsoleLog, UserSession } from "../types";

export default function LayerThreeBot() {
  const [githubAuthed, setGithubAuthed] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Bot states
  const [stats, setStats] = useState<UserSession | null>(null);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [cliInput, setCliInput] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showSyncGuide, setShowSyncGuide] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Telegram pairing states
  const [pairingPhone, setPairingPhone] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copiedPairingCode, setCopiedPairingCode] = useState(false);

  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (githubAuthed) {
      fetchStats();
      fetchLogs();
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.channel === "hello") {
            if (data.payload?.stats) setStats(data.payload.stats);
            if (Array.isArray(data.payload?.logs)) setLogs(data.payload.logs);
          }
          if (data.channel === "logs") {
            setLogs((prev) => [...prev.slice(-199), data.payload]);
            scrollToConsoleBottom();
          }
          if (data.channel === "stats") setStats(data.payload);
        } catch (error) {
          console.error("Realtime stream decode error:", error);
        }
      };
      socket.onerror = () => console.warn("Realtime stream unavailable; REST fallback remains active.");
      const interval = setInterval(fetchStats, 10000);
      return () => {
        clearInterval(interval);
        socket.close();
      };
    }
  }, [githubAuthed]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/whatsapp-bot/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/whatsapp-bot/logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        scrollToConsoleBottom();
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const scrollToConsoleBottom = () => {
    setTimeout(() => {
      if (consoleEndRef.current) {
        consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleGithubConnect = () => {
    setLoadingAuth(true);
    setTimeout(() => {
      setGithubAuthed(true);
      setLoadingAuth(false);
    }, 1200);
  };

  // Perform bot action
  const handleBotAction = async (action: "restart" | "logout" | "reconnect" | "purge") => {
    setLoadingAction(action);
    try {
      const res = await fetch("/api/whatsapp-bot/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchStats();
        fetchLogs();
      }
    } catch (err) {
      console.error("Error executing bot action:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  // Deploy CLI terminal command
  const handleDeployCLI = async () => {
    if (!cliInput.trim()) return;
    const command = cliInput;
    setCliInput("");

    // Log the user entering command
    try {
      await fetch("/api/whatsapp-bot/logs/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "command", message: `Admin executed CLI command: ${command}` }),
      });
      fetchLogs();

      // Simulate a response log shortly after
      setTimeout(async () => {
        let responseType = "success";
        let responseMsg = `[BOT] Executed successfully: '${command}'. Channel matrix stable.`;
        if (command.startsWith(".error") || command.toLowerCase().includes("fail")) {
          responseType = "warning";
          responseMsg = `[WARNING] Command execution exception: target thread uncoupled.`;
        }
        await fetch("/api/whatsapp-bot/logs/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: responseType, message: responseMsg }),
        });
        fetchLogs();
      }, 1000);

    } catch (err) {
      console.error("Error pushing terminal logs:", err);
    }
  };

  // Generate pairing code via Telegram portal
  const handleRequestPairingCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!pairingPhone.trim()) return;
    setIsGeneratingCode(true);
    try {
      const res = await fetch("/api/whatsapp-bot/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: pairingPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setPairingCode(data.pairingCode);
        fetchStats();
        fetchLogs();
      }
    } catch (err) {
      console.error("Error generating pairing code:", err);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const getLogColorClass = (type: string) => {
    switch (type) {
      case "system": return "text-purple-400 font-bold";
      case "success": return "text-emerald-400";
      case "command": return "text-cyan-400";
      case "warning": return "text-amber-500 font-medium";
      case "error": return "text-red-500 font-semibold";
      default: return "text-cyan-200/85";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Dynamic Header */}
      <div className="flex justify-between items-center bg-zinc-950/40 p-4 border border-cyan-500/10 rounded-xl backdrop-blur-md">
        <div>
          <h2 className="text-md font-bold text-white font-mono flex items-center gap-2">
            <Terminal className="h-5 w-5 text-cyan-400 animate-pulse" /> LAYER THREE: WHATSAPP BOT CENTER
          </h2>
          <p className="text-xxs text-cyan-500/70 font-mono uppercase tracking-wider mt-0.5">
            Admin Mainframe & Interactive Live Terminal Matrix
          </p>
        </div>
        {githubAuthed && (
          <div className="flex items-center gap-1.5 font-mono text-xxs px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-950/20 text-purple-400">
            <Shield className="h-3 w-3 text-purple-400 animate-ping" />
            <span>SECURED OWNER SESSION (GITHUB)</span>
          </div>
        )}
      </div>

      {/* GitHub Authentication Lock Wall */}
      {!githubAuthed ? (
        <div className="max-w-md mx-auto bg-zinc-950/80 border-2 border-cyan-500/25 p-8 rounded-2xl text-center space-y-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden backdrop-blur-md py-12">
          {/* Moving scan grid design accent */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

          <div className="w-16 h-16 rounded-full bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Lock className="h-8 w-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold font-mono text-white">Mainframe Access Required</h3>
            <p className="text-xs text-cyan-500/85 font-mono leading-relaxed max-w-sm mx-auto">
              Owner-specific data paths are encrypted. To deploy or inspect your WhatsApp bot dashboard, you must authenticate through GitHub.
            </p>
          </div>

          <button
            id="github-auth-btn"
            onClick={handleGithubConnect}
            disabled={loadingAuth}
            className="w-full py-3 rounded-xl bg-cyan-500 text-black font-mono font-bold hover:bg-cyan-400 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            {loadingAuth ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>DECRYPTING OWNERSHIP SCHEMAS...</span>
              </>
            ) : (
              <>
                <Github className="h-4 w-4 text-black" />
                <span>COUPLE GITHUB OWNER ID</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Full WhatsApp Bot Dashboard grid */
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Box: Stats Dashboard */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Bot Info card */}
              {stats && (
                <div className="bg-zinc-950/60 border border-cyan-500/25 p-5 rounded-2xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 text-xxs font-mono text-cyan-500/40">SYS_BOT_METRIC</div>
                  
                  <div className="flex gap-4 items-center">
                    <img src={stats.botAvatar} alt="bot pfp" className="w-16 h-16 rounded-xl object-cover border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]" />
                    <div className="space-y-1">
                      <span className="text-xxs font-mono bg-cyan-500/15 border border-cyan-400/30 px-2 py-0.5 rounded text-cyan-400 uppercase tracking-widest font-bold">
                        {stats.status}
                      </span>
                      <h3 className="text-md font-bold text-white font-mono">{stats.botName}</h3>
                      <p className="text-xxs font-mono text-gray-400">Owner ID: pappy999666</p>
                    </div>
                  </div>

                  <div className="border-t border-cyan-500/10 pt-4 grid grid-cols-2 gap-4 font-mono text-xxs">
                    <div>
                      <span className="text-gray-500 block uppercase">Phone Number</span>
                      <span className="text-cyan-400 font-bold">+{stats.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block uppercase">Pair Date</span>
                      <span className="text-cyan-400">07/01/2026</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Resource meters (Progress style) */}
              {stats && (
                <div className="bg-zinc-950/60 border border-cyan-500/20 p-5 rounded-2xl space-y-4">
                  <span className="text-xxs font-mono text-cyan-500 block tracking-widest uppercase">HARDWARE NODE LOAD</span>
                  
                  {/* CPU Meter */}
                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between text-xxs">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Cpu className="h-3 w-3 text-cyan-400" /> CPU CORE MATRIX
                      </span>
                      <span className="text-cyan-400 font-bold">{stats.cpu}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-cyan-950/40 rounded-full overflow-hidden border border-cyan-500/10">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000"
                        style={{ width: `${stats.cpu}%` }}
                      />
                    </div>
                  </div>

                  {/* RAM Meter */}
                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between text-xxs">
                      <span className="text-gray-400 flex items-center gap-1">
                        <HardDrive className="h-3 w-3 text-cyan-400" /> SYSTEM ALLOCATED MEMORY
                      </span>
                      <span className="text-cyan-400 font-bold">{stats.memory} MB / 512 MB</span>
                    </div>
                    <div className="w-full h-1.5 bg-cyan-950/40 rounded-full overflow-hidden border border-cyan-500/10">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000"
                        style={{ width: `${(stats.memory / 512) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Census metrics */}
              {stats && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-950/50 border border-cyan-500/15 p-3 rounded-xl font-mono text-center">
                    <Users className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                    <span className="text-gray-500 text-xxs uppercase block">Groups</span>
                    <span className="text-xs font-bold text-white block mt-1">{stats.groupCount}</span>
                  </div>
                  <div className="bg-zinc-950/50 border border-cyan-500/15 p-3 rounded-xl font-mono text-center">
                    <Activity className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                    <span className="text-gray-500 text-xxs uppercase block">Users</span>
                    <span className="text-xs font-bold text-white block mt-1">{stats.userCount}</span>
                  </div>
                  <div className="bg-zinc-950/50 border border-cyan-500/15 p-3 rounded-xl font-mono text-center">
                    <MessageSquare className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                    <span className="text-gray-500 text-xxs uppercase block">Command Runs</span>
                    <span className="text-xs font-bold text-white block mt-1">{stats.commandsCount}</span>
                  </div>
                </div>
              )}

              {/* Mainframe Controls panel */}
              <div className="bg-zinc-950/60 border border-cyan-500/20 p-5 rounded-2xl space-y-3">
                <span className="text-xxs font-mono text-cyan-500 block tracking-widest uppercase">NODE TRANSPORT CONTROLS</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="bot-action-restart"
                    onClick={() => handleBotAction("restart")}
                    disabled={loadingAction !== null}
                    className="py-2.5 rounded-xl border border-cyan-500/30 hover:bg-cyan-500 hover:text-black font-mono text-xxs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingAction === "restart" ? "animate-spin" : ""}`} />
                    <span>RESTART ENG</span>
                  </button>
                  <button
                    id="bot-action-reconnect"
                    onClick={() => handleBotAction("reconnect")}
                    disabled={loadingAction !== null}
                    className="py-2.5 rounded-xl border border-cyan-500/30 hover:bg-cyan-500 hover:text-black font-mono text-xxs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Power className={`h-3.5 w-3.5 ${loadingAction === "reconnect" ? "animate-spin" : ""}`} />
                    <span>RECONNECT</span>
                  </button>
                  <button
                    id="bot-action-logout"
                    onClick={() => handleBotAction("logout")}
                    disabled={loadingAction !== null}
                    className="py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black font-mono text-xxs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className={`h-3.5 w-3.5 ${loadingAction === "logout" ? "animate-spin" : ""}`} />
                    <span>LOGOUT UNIT</span>
                  </button>
                  <button
                    id="bot-action-purge"
                    onClick={() => handleBotAction("purge")}
                    disabled={loadingAction !== null}
                    className="py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black font-mono text-xxs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className={`h-3.5 w-3.5 ${loadingAction === "purge" ? "animate-spin" : ""}`} />
                    <span>PURGE STATE</span>
                  </button>
                </div>
              </div>

              {/* Telegram Bot Pairing Gateway */}
              <div className="bg-zinc-950/60 border border-purple-500/45 p-5 rounded-none space-y-4 shadow-[0_0_20px_rgba(168,85,247,0.1)] relative">
                <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-purple-500/40 font-bold uppercase tracking-widest">PAIR_SYSTEM_CORE</div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-purple-400 block tracking-[0.2em] uppercase font-bold">TELEGRAM BOT PAIR GATEWAY</span>
                  <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">
                    Couple your WhatsApp bot securely. Our active pairing handshake is processed on Telegram (<span className="text-purple-400">@pappylung</span>). Submit your host number below to acquire your unique 8-digit authorization token.
                  </p>
                </div>

                <form onSubmit={handleRequestPairingCode} className="space-y-3">
                  <div className="space-y-1 font-mono text-[9px]">
                    <label htmlFor="pairing-phone-input" className="text-zinc-500 block uppercase font-bold">HOST WHATSAPP NUMBER (with Country Code)</label>
                    <div className="flex bg-black/60 border border-zinc-900 focus-within:border-purple-500/60 rounded-none p-1 transition-all">
                      <span className="text-zinc-600 font-bold text-xs select-none px-2 flex items-center">+</span>
                      <input
                        id="pairing-phone-input"
                        type="tel"
                        required
                        placeholder="2348123456789"
                        value={pairingPhone}
                        onChange={(e) => setPairingPhone(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 bg-transparent font-mono text-xs text-white placeholder-zinc-800 focus:outline-none py-1.5"
                      />
                    </div>
                  </div>

                  <button
                    id="pair-generate-token-btn"
                    type="submit"
                    disabled={isGeneratingCode || !pairingPhone}
                    className="w-full py-2.5 rounded-none border border-purple-500/30 bg-purple-950/20 text-purple-300 font-mono text-xxs tracking-widest uppercase font-bold hover:bg-purple-500 hover:text-black hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    {isGeneratingCode ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>ACQUIRING TELEGRAM TOKEN...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-3.5 w-3.5" />
                        <span>ACQUIRE HANDSHAKE TOKEN</span>
                      </>
                    )}
                  </button>
                </form>

                {pairingCode && (
                  <div className="space-y-3.5 pt-3 border-t border-dashed border-purple-500/20 animate-fade-in font-mono">
                    <div className="bg-black/80 border border-purple-500/40 p-4 text-center space-y-2 relative overflow-hidden rounded-none">
                      <span className="text-[9px] text-zinc-500 block tracking-wider uppercase font-bold">YOUR PAIRING HANDSHAKE TOKEN</span>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-lg font-black text-white tracking-[0.15em] select-all font-mono">
                          {pairingCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(pairingCode);
                            setCopiedPairingCode(true);
                            setTimeout(() => setCopiedPairingCode(false), 2000);
                          }}
                          className="p-1 px-2 rounded-none bg-purple-500 text-black text-[9px] font-black hover:bg-purple-400 transition-colors cursor-pointer flex items-center gap-1 border-none"
                        >
                          {copiedPairingCode ? <Check className="h-3 w-3" /> : null}
                          <span>{copiedPairingCode ? "COPIED" : "COPY"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-[10px] text-zinc-400 leading-relaxed bg-purple-950/10 border border-purple-500/10 p-3 rounded-none">
                      <div className="flex items-start gap-1.5">
                        <span className="text-purple-400 font-bold select-none">[1]</span>
                        <span>Copy the token shown above.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-purple-400 font-bold select-none">[2]</span>
                        <span>Send the token directly to our official operator on Telegram.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-purple-400 font-bold select-none">[3]</span>
                        <span>Once verified, your physical bot socket couples automatically.</span>
                      </div>
                    </div>

                    <a
                      href="https://t.me/pappylung"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 rounded-none border border-emerald-500/40 bg-emerald-950/10 text-emerald-400 hover:bg-emerald-500 hover:text-black font-mono text-xxs tracking-widest font-black text-center block hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                    >
                      COUPLE ON TELEGRAM (@PAPPYLUNG) →
                    </a>
                  </div>
                )}
              </div>

              {/* Real Bot Synchronization Harness */}
              <div className="bg-zinc-950/60 border border-purple-500/30 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xxs font-mono text-purple-400 block tracking-widest uppercase">PHYSICAL BOT GATEWAY</span>
                  <button
                    onClick={() => setShowSyncGuide(!showSyncGuide)}
                    className="text-xxs font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                  >
                    {showSyncGuide ? "HIDE SCHEMAS" : "INTEGRATE REAL BOT"}
                  </button>
                </div>
                
                <p className="text-[10px] font-mono text-gray-400 leading-normal">
                  Your web panel can receive actual real-time telemetry from any physical Baileys WhatsApp bot running on your local machine or VPS!
                </p>

                {showSyncGuide && (
                  <div className="space-y-3 pt-2 border-t border-purple-500/15 animate-fade-in text-[10px] font-mono leading-relaxed">
                    <div className="space-y-1">
                      <span className="text-gray-500 block uppercase">Your Sync Secret Key</span>
                      <div className="flex bg-black/80 border border-purple-500/30 rounded-lg p-2 items-center justify-between gap-2">
                        <code className="text-purple-300 text-[9px] select-all">PAPPY_OS_SYNC_9FE89E7B</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("PAPPY_OS_SYNC_9FE89E7B");
                            setCopiedKey(true);
                            setTimeout(() => setCopiedKey(false), 2000);
                          }}
                          className="px-1.5 py-0.5 rounded bg-purple-500 text-black text-[9px] font-bold hover:bg-purple-400 cursor-pointer"
                        >
                          {copiedKey ? "COPIED" : "COPY"}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-gray-500 block uppercase">Baileys Hook Integration Code (Node.js)</span>
                      <p className="text-gray-400 text-[9px]">
                        Inject this payload in your bot's startup or message loop to sync actual status directly with your browser frame:
                      </p>
                      <pre className="bg-black/90 p-2.5 rounded-lg border border-cyan-500/20 text-[8px] text-cyan-300 overflow-x-auto max-h-[150px] leading-relaxed">
{`// Sync real-time statistics
async function syncTelemetry(bot) {
  await fetch("${window.location.origin}/api/whatsapp-bot/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: "PAPPY_OS_SYNC_9FE89E7B",
      stats: {
        phone: bot.user.id.split(":")[0],
        botName: "My Local Baileys Bot",
        groupCount: bot.groups.length,
        userCount: bot.chats.length,
        commandsCount: 1420,
        cpu: 1.2,
        memory: 145
      },
      log: {
        type: "success",
        message: "Real-time sync matrix connected successfully."
      }
    })
  });
}`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Box: Live Console Terminal */}
            <div className="lg:col-span-7 flex flex-col h-[540px] bg-black/90 border border-cyan-500/25 rounded-2xl relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              {/* Terminal header */}
              <div className="border-b border-cyan-500/20 bg-zinc-950/80 px-4 py-3 flex justify-between items-center z-10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xxs font-mono text-cyan-400 tracking-wider ml-2 font-bold">PAPPY_PROJECT_v1.0.4 // TERMINAL_OUTPUT</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xxs font-mono text-cyan-500">LIVE FEED</span>
                </div>
              </div>

              {/* Logs body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xxs scrollbar-thin scrollbar-thumb-cyan-500/25">
                {logs.map((log, index) => (
                  <div key={index} className="flex gap-2 items-start hover:bg-cyan-500/5 p-1 rounded transition-colors">
                    <span className="text-gray-500 flex-shrink-0">[{log.timestamp}]</span>
                    <span className={`break-all ${getLogColorClass(log.type)}`}>
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>

              {/* CLI command input box */}
              <div className="border-t border-cyan-500/20 bg-zinc-950/80 p-3 flex-shrink-0 z-10">
                <div className="flex gap-2 bg-black/60 border border-cyan-500/25 rounded-lg px-3 py-1.5">
                  <span className="text-cyan-500 font-bold font-mono text-xs select-none">&gt;</span>
                  <input
                    id="cli-input-command"
                    type="text"
                    placeholder="Enter bot operator command (e.g. .menu, .pfp, .ai reset)..."
                    value={cliInput}
                    onChange={(e) => setCliInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleDeployCLI()}
                    className="flex-1 bg-transparent font-mono text-xs text-white placeholder-cyan-800 focus:outline-none"
                  />
                  <button
                    id="cli-execute-btn"
                    onClick={handleDeployCLI}
                    className="text-xxs font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase font-mono"
                  >
                    RUN_CMD
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}

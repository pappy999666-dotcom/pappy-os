import { useState, useEffect, useRef } from "react";
import { Terminal, Cpu, Sparkles, SkipForward, Volume2, User, Check, ShieldAlert } from "lucide-react";

interface WelcomeProps {
  onComplete: (name: string, greeting: string) => void;
}

export default function WelcomeExperience({ onComplete }: WelcomeProps) {
  const [bootStep, setBootStep] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [step, setStep] = useState(1); // Onboarding questions
  const [userName, setUserName] = useState("");
  const [greetingType, setGreetingType] = useState("Boss");
  const [aiText, setAiText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  const bootSequenceLogs = [
    "LOG: Initializing PAPPY PROJECT Core Matrix...",
    "LOG: Loading cyber-gothic stylesheets and fonts...",
    "LOG: Checking local memory storage sectors...",
    "LOG: Syncing with WhatsApp Bot Transport (Baileys Node v2)...",
    "LOG: Initializing PFP crop-free aspect fitter engine...",
    "LOG: Establishing secure proxy link to Gemini AI cluster...",
    "LOG: Access granted. Boot protocol completed successfully.",
  ];

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
  }, []);

  // 1. Boot sequence terminal loading effect
  useEffect(() => {
    if (bootStep < bootSequenceLogs.length) {
      const timer = setTimeout(() => {
        setBootLogs((prev) => [...prev, bootSequenceLogs[bootStep]]);
        setBootStep((prev) => prev + 1);
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
      }, 400);
      return () => clearTimeout(timer);
    } else {
      // Boot done, check if already completed onboarding previously
      const savedName = localStorage.getItem("pappy_user_name");
      const savedGreeting = localStorage.getItem("pappy_user_greeting");
      if (savedName && savedGreeting) {
        // Quick welcome announcement
        announceText(`Welcome back, ${savedGreeting} ${savedName}. Engaging operating system.`, () => {
          onComplete(savedName, savedGreeting);
        });
      } else {
        setIsOnboarding(true);
        triggerAiSpeech("Greetings, human subject. I am the intelligence matrix of Pappy Project. What name shall I register in my mainframe database?");
      }
    }
  }, [bootStep]);

  // Trigger TTS and synchronized subtitle
  const triggerAiSpeech = (text: string, onEndCallback?: () => void) => {
    setAiText(text);
    if (!synthRef.current) {
      if (onEndCallback) setTimeout(onEndCallback, 3000);
      return;
    }

    // Cancel prior speeches
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to pick a cool, futuristic english voice
    const voices = synthRef.current.getVoices();
    const premiumVoice = voices.find(
      (v) => v.name.includes("Google") || v.name.includes("Natural") || v.lang.startsWith("en")
    );
    if (premiumVoice) utterance.voice = premiumVoice;
    
    utterance.rate = 1.05;
    utterance.pitch = 0.9; // Lower pitch for a cool operator vibe

    utterance.onstart = () => {
      setIsSpeaking(true);
      window.dispatchEvent(new CustomEvent("pappy-ai-speak-start"));
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      window.dispatchEvent(new CustomEvent("pappy-ai-speak-end"));
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      window.dispatchEvent(new CustomEvent("pappy-ai-speak-end"));
      if (onEndCallback) onEndCallback();
    };

    synthRef.current.speak(utterance);
  };

  const announceText = (text: string, onEnd?: () => void) => {
    if (!synthRef.current) {
      if (onEnd) onEnd();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => window.dispatchEvent(new CustomEvent("pappy-ai-speak-start"));
    utterance.onend = () => {
      window.dispatchEvent(new CustomEvent("pappy-ai-speak-end"));
      if (onEnd) onEnd();
    };
    synthRef.current.speak(utterance);
  };

  const handleNameSubmit = () => {
    if (!userName.trim()) return;
    setStep(2);
    triggerAiSpeech(`Acknowledge, ${userName}. Select your operator prefix code or desired greeting identifier so I can synchronize our frequencies.`);
  };

  const handleGreetingSubmit = (selected: string) => {
    setGreetingType(selected);
    setStep(3);

    const explanation = `Synchronization complete. Welcome, ${selected} ${userName}. Let me explain the layers of Pappy Project. 
Layer One is the Guest Matrix, providing crop-free profile tests, media down loaders, and ambient audio visualizers immediately without friction. 
Layer Two is the Profile Picture Center, designed for precise WhatsApp profile scheduler logs and auto-purging session logs to protect your privacy. 
Layer Three is the Bot Dashboard, which connects owners directly to their WhatsApp bot instances with real-time system logs and consoles. 
This operating system was coded entirely by the developer Pappy. You may connect with him via Telegram @pappylung or email pappyishim@outlook.com. Let us initiate the interface.`;

    triggerAiSpeech(explanation, () => {
      handleFinishOnboarding(userName, selected);
    });
  };

  const handleFinishOnboarding = (name: string, greet: string) => {
    if (synthRef.current) synthRef.current.cancel();
    window.dispatchEvent(new CustomEvent("pappy-ai-speak-end"));
    localStorage.setItem("pappy_user_name", name);
    localStorage.setItem("pappy_user_greeting", greet);
    onComplete(name, greet);
  };

  const handleSkip = () => {
    const finalName = userName.trim() || "Guest Operator";
    const finalGreet = greetingType || "Boss";
    handleFinishOnboarding(finalName, finalGreet);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4 overflow-hidden font-sans">
      {/* Moving scanline laser line */}
      <div className="absolute inset-x-0 h-[2px] bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-bounce pointer-events-none top-0 bottom-0" style={{ animationDuration: "8s" }} />

      <div className="w-full max-w-2xl bg-zinc-950 border-2 border-cyan-500/40 rounded-2xl p-6 md:p-8 relative shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col justify-between min-h-[480px]">
        {/* Hologram aesthetic grid background inside card */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-zinc-950 to-zinc-950 opacity-40 pointer-events-none" />

        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-cyan-400 animate-pulse" />
            <span className="text-sm font-mono tracking-widest text-cyan-400 font-bold">PAPPY_PROJECT_v1.0.4 // BOOT_SEQUENCE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 animate-ping" />
            <span className="text-xxs font-mono text-cyan-500">LIVE COUPLING</span>
          </div>
        </div>

        {/* Core Content Box */}
        <div className="flex-1 flex flex-col justify-center py-4 relative z-10">
          {!isOnboarding ? (
            /* Boot Terminal Log Loader */
            <div
              ref={logContainerRef}
              className="bg-black/80 border border-cyan-500/10 rounded-xl p-4 font-mono text-xs text-cyan-400/80 h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-cyan-500/30"
            >
              {bootLogs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-cyan-500 font-bold">&gt;</span>
                  <span className={index === bootLogs.length - 1 ? "text-cyan-300 font-medium" : ""}>
                    {log}
                  </span>
                </div>
              ))}
              {bootStep < bootSequenceLogs.length && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-cyan-400 font-bold animate-pulse">&gt; ANALYZING MAIN DIRECTORY STATE...</span>
                  <div className="w-1.5 h-4 bg-cyan-400 animate-blink" />
                </div>
              )}
            </div>
          ) : (
            /* Interactive Holographic AI Assistant Onboarding */
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Holographic glowing orb AI assistant */}
              <div className="relative">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center p-0.5 relative shadow-[0_0_30px_rgba(6,182,212,0.4)] ${isSpeaking ? "animate-pulse" : ""}`}>
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <Sparkles className={`h-8 w-8 text-cyan-400 ${isSpeaking ? "animate-bounce" : ""}`} />
                  </div>
                </div>
                {/* Decorative orbiting ring */}
                <div className={`absolute -inset-3 border border-dashed border-cyan-400/40 rounded-full ${isSpeaking ? "animate-spin" : ""}`} style={{ animationDuration: "10s" }} />
                <div className="absolute -inset-5 border border-dashed border-purple-500/20 rounded-full animate-spin" style={{ animationDuration: "25s", animationDirection: "reverse" }} />
              </div>

              {/* Subtitles showing current AI utterance */}
              <div className="bg-black/60 border border-cyan-500/20 rounded-xl p-4 max-w-lg min-h-[80px] flex items-center justify-center">
                <p className="text-sm font-mono text-cyan-300 leading-relaxed">
                  {aiText}
                </p>
              </div>

              {/* Onboarding steps Form */}
              <div className="w-full max-w-md transition-all duration-300">
                {step === 1 && (
                  <div className="flex gap-2 mt-4">
                    <div className="relative flex-1">
                      <User className="absolute left-3 top-3 h-4 w-4 text-cyan-500" />
                      <input
                        id="user-name-input"
                        type="text"
                        placeholder="Enter Operator Name..."
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                        maxLength={25}
                        className="w-full bg-black/50 border border-cyan-500/30 rounded-xl pl-9 pr-4 py-2 text-white font-mono placeholder-cyan-700/60 focus:outline-none focus:border-cyan-400 shadow-inner"
                      />
                    </div>
                    <button
                      id="name-submit-btn"
                      onClick={handleNameSubmit}
                      disabled={!userName.trim()}
                      className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-mono font-bold hover:bg-cyan-400 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    >
                      <Check className="h-4 w-4" /> SECURE
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col gap-3 mt-4">
                    <span className="text-xxs font-mono text-cyan-500 tracking-widest block mb-1">SELECT PREFERENTIAL PROTOCOL:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {["Boss", "Operator", "Goth Hacker", "Pilot", "Guest"].map((pref) => (
                        <button
                          key={pref}
                          onClick={() => handleGreetingSubmit(pref)}
                          className="px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-500 hover:text-black font-mono text-xs text-cyan-400 font-medium transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:border-cyan-400 cursor-pointer text-left flex items-center justify-between"
                        >
                          <span>{pref}</span>
                          <span className="text-xxs border border-cyan-500/20 px-1 py-0.5 rounded text-cyan-500/60 uppercase">SET_CMD</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col gap-4 mt-6">
                    {/* Synchronized Creator Details card */}
                    <div className="grid grid-cols-2 gap-3 bg-black/40 border border-purple-500/30 rounded-xl p-3 text-left font-mono text-xs">
                      <div>
                        <span className="text-purple-400/60 block uppercase text-xxs">CREATOR</span>
                        <span className="text-purple-400 font-bold">Pappy</span>
                      </div>
                      <div>
                        <span className="text-purple-400/60 block uppercase text-xxs">TELEGRAM</span>
                        <a href="https://t.me/pappylung" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">@pappylung</a>
                      </div>
                      <div className="col-span-2 border-t border-purple-500/20 pt-2 mt-1">
                        <span className="text-purple-400/60 block uppercase text-xxs">EMAIL ROUTE</span>
                        <span className="text-cyan-300">pappyishim@outlook.com</span>
                      </div>
                    </div>
                    
                    <button
                      id="launch-os-btn"
                      onClick={() => handleFinishOnboarding(userName, greetingType)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-mono font-bold hover:from-cyan-400 hover:to-purple-500 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-black" /> INITIALIZE OPERATING SYSTEM
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls & Skip */}
        <div className="border-t border-cyan-500/20 pt-4 mt-4 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-1.5 text-xxs font-mono text-cyan-600">
            <Volume2 className="h-3 w-3 text-cyan-600" />
            <span>SYNCHRONIZED SPEECH SYS ACTIVE</span>
          </div>
          <button
            id="skip-onboarding-btn"
            onClick={handleSkip}
            className="flex items-center gap-1.5 text-xs font-mono text-cyan-500/85 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <span>SKIP COUPLING</span>
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

let robotAudioCtx: AudioContext | null = null;
let robotOsc: OscillatorNode | null = null;
let robotModulator: OscillatorNode | null = null;
let robotGain: GainNode | null = null;
let intervalId: any = null;

export function startRobotSound() {
  try {
    // Clean up any existing instances first
    stopRobotSound();

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    robotAudioCtx = new AudioContextClass();

    // Carrier oscillator: retro square wave for that robotic edge
    robotOsc = robotAudioCtx.createOscillator();
    robotOsc.type = "square";
    robotOsc.frequency.setValueAtTime(110, robotAudioCtx.currentTime); // base vocal pitch

    // Modulator oscillator: creates classic Ring Modulation
    robotModulator = robotAudioCtx.createOscillator();
    robotModulator.type = "sine";
    robotModulator.frequency.setValueAtTime(75, robotAudioCtx.currentTime); // metallic ring rate

    // Modulator gain to control depth
    const modulatorGain = robotAudioCtx.createGain();
    modulatorGain.gain.setValueAtTime(60, robotAudioCtx.currentTime);

    // Biquad filter for formant resonance simulation
    const filter = robotAudioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(750, robotAudioCtx.currentTime);
    filter.Q.setValueAtTime(12, robotAudioCtx.currentTime); // resonant spike

    // Main Output Gain
    robotGain = robotAudioCtx.createGain();
    robotGain.gain.setValueAtTime(0.07, robotAudioCtx.currentTime); // gentle backdrop level

    // Connections: Modulator -> ModulatorGain -> Carrier frequency (Ring/FM modulation)
    robotModulator.connect(modulatorGain);
    modulatorGain.connect(robotOsc.frequency);

    // Carrier -> resonant filter -> output
    robotOsc.connect(filter);
    filter.connect(robotGain);
    robotGain.connect(robotAudioCtx.destination);

    robotOsc.start();
    robotModulator.start();

    // Stepped pitch modulation to simulate mechanical speech syllables
    intervalId = setInterval(() => {
      if (!robotAudioCtx || !robotOsc || robotAudioCtx.state === "closed") {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        return;
      }
      const t = robotAudioCtx.currentTime;
      // Step pitch up/down like binary syllabic cadence
      const randomFreq = 95 + Math.random() * 50; 
      robotOsc.frequency.setValueAtTime(randomFreq, t);
      
      // Sweep the resonant bandpass filter to sound like formants shifting
      filter.frequency.setValueAtTime(500 + Math.random() * 600, t);
    }, 75);

  } catch (e) {
    console.error("Robot synthesizer failed to initialize:", e);
  }
}

export function stopRobotSound() {
  try {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (robotOsc) {
      robotOsc.stop();
      robotOsc.disconnect();
      robotOsc = null;
    }
    if (robotModulator) {
      robotModulator.stop();
      robotModulator.disconnect();
      robotModulator = null;
    }
    if (robotGain) {
      robotGain.disconnect();
      robotGain = null;
    }
    if (robotAudioCtx) {
      robotAudioCtx.close();
      robotAudioCtx = null;
    }
  } catch (e) {
    // fail silently
  }
}

/**
 * Custom voice synthesis with flat robotic modulation pitch & rate
 */
export function speakRobotic(text: string) {
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // We only speak text under 180 characters for elegant performance
  if (text.length > 180) return;

  const utter = new SpeechSynthesisUtterance(text);
  
  // Flatten voice features for robotic monotone
  utter.pitch = 0.35; // Monotone robot pitch
  utter.rate = 1.15;  // Slightly accelerated metallic speed
  utter.volume = 1.0;

  // Try to find a crisp male/female voice to serve as base
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    (v) =>
      v.name.includes("Google US English") ||
      v.name.includes("Microsoft David") ||
      v.name.includes("Zira") ||
      v.lang.startsWith("en")
  );
  if (preferredVoice) {
    utter.voice = preferredVoice;
  }

  // Hook event dispatchers for background music ducking & Web Audio robot hum sync
  utter.onstart = () => {
    startRobotSound();
    window.dispatchEvent(new CustomEvent("pappy-ai-speak-start"));
  };
  
  utter.onend = () => {
    stopRobotSound();
    window.dispatchEvent(new CustomEvent("pappy-ai-speak-end"));
  };

  utter.onerror = () => {
    stopRobotSound();
    window.dispatchEvent(new CustomEvent("pappy-ai-speak-end"));
  };

  window.speechSynthesis.speak(utter);
}

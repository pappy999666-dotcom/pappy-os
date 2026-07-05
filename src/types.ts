export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  url: string;
  downloads: number;
  author: string;
}

export interface PFPSchedule {
  id: string;
  phone: string;
  imageUrl: string;
  aspect: string;
  scheduledTime: string;
  repeat: string;
  status: "pending" | "completed" | "active";
  created: string;
}

export interface UserSession {
  phone: string;
  status: "connected" | "disconnected" | "pairing";
  pairedAt: string | null;
  botName: string;
  botAvatar: string;
  groupCount: number;
  userCount: number;
  commandsCount: number;
  cpu: number;
  memory: number;
}

export interface ConsoleLog {
  type: string;
  message: string;
  timestamp: string;
}

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: string;
}

export const CYBER_PLAYLIST: Track[] = [
  {
    id: "track_1",
    title: "Neuro-Link Ambient",
    artist: "Pappy Synth",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "6:12",
  },
  {
    id: "track_2",
    title: "Gothic Cyber Grid",
    artist: "Onyx Operator",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "7:05",
  },
  {
    id: "track_3",
    title: "Abyssal Mainframe Loop",
    artist: "Pappy Velocity",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: "5:02",
  },
  {
    id: "track_4",
    title: "Sub-Thermal Protocol",
    artist: "Rebel Grid",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: "5:38",
  },
];

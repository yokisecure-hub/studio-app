// === 定数定義 ===

export const VocalType = {
  FEMALE_SOLO: "Female Solo",
  MALE_SOLO: "Male Solo",
  FEMALE_DUO: "Female Duo",
  MALE_DUO: "Male Duo",
  MIXED_DUO: "Mixed Duo",
  GROUP: "Group/Choir",
  CHILD: "Child Voice",
  ANIME_FEMALE: "Anime Female",
  ANIME_MALE: "Anime Male",
  RAP_MALE: "Rap Male",
  RAP_FEMALE: "Rap Female",
  WHISPER: "Whisper",
  OPERA: "Opera",
  VOCALOID_STYLE: "Vocaloid Style",
} as const;
export type VocalType = (typeof VocalType)[keyof typeof VocalType];

export const StyleMode = {
  STANDARD: "standard",
  ANIME: "anime",
  VIRAL_COMICAL: "viral_comical",
  HEARTFELT: "heartfelt",
} as const;
export type StyleMode = (typeof StyleMode)[keyof typeof StyleMode];

export const LyricsLanguage = {
  JAPANESE: "japanese",
  ENGLISH: "english",
} as const;
export type LyricsLanguage = (typeof LyricsLanguage)[keyof typeof LyricsLanguage];

// === Input/Output型 ===

export interface SongStructureInput {
  genre: string;
  bpm: number;
  targetAudience: string;
  structureType: string;
  targetDuration?: string;
}

export interface SongStructureOutput {
  proposal1: string;
}

export interface StyleInput {
  genre: string;
  mood: string;
  vocalType: VocalType;
  mode: StyleMode;
  useHumanize: boolean;
  useDrumsUp: boolean;
  useSfx: boolean;
}

export interface StyleOutput {
  stylePrompt: string;
}

export interface LyricsInput {
  theme: string;
  structure: string;
  language: LyricsLanguage;
  techniques: string[];
}

export interface LyricsOutput {
  lyrics: string;
}

export interface HumanizeInput {
  genre: string;
  theme: string;
}

export interface HumanizeOutput {
  strategy: string;
}

export interface TitleInput {
  lyrics: string;
}

export interface TitleOutput {
  titles: Array<{ en: string; ja: string }>;
}

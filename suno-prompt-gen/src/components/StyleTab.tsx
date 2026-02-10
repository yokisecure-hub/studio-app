import { useState } from "react";
import { Music, Sparkles, Zap, Heart, Copy, Check, Loader2 } from "lucide-react";
import { VocalType, StyleMode } from "../types";
import type { StyleInput } from "../types";
import { generateStylePrompt } from "../services/geminiService";

interface StyleTabProps {
  styleOutput: string;
  setStyleOutput: (value: string) => void;
}

const MODE_CONFIG = [
  {
    mode: StyleMode.STANDARD,
    label: "Standard",
    icon: Music,
    color: "bg-blue-600",
    hoverColor: "hover:bg-blue-700",
  },
  {
    mode: StyleMode.ANIME,
    label: "Anime / Idol",
    icon: Sparkles,
    color: "bg-pink-600",
    hoverColor: "hover:bg-pink-700",
  },
  {
    mode: StyleMode.VIRAL_COMICAL,
    label: "Viral / TikTok",
    icon: Zap,
    color: "bg-green-600",
    hoverColor: "hover:bg-green-700",
  },
  {
    mode: StyleMode.HEARTFELT,
    label: "Heartfelt & Universal",
    icon: Heart,
    color: "bg-amber-600",
    hoverColor: "hover:bg-amber-700",
  },
];

const PRESETS: Record<StyleMode, Array<{ label: string; genre: string; mood: string }>> = {
  [StyleMode.STANDARD]: [
    { label: "Modern Pop", genre: "Modern Pop", mood: "Upbeat, Catchy, Radio-Ready" },
    { label: "EDM Festival", genre: "EDM, Festival", mood: "Euphoric, High Energy, Drop-Heavy" },
    { label: "Lo-fi Chill", genre: "Lo-fi, Chill Hop", mood: "Relaxed, Nostalgic, Vinyl Crackle, Nostalgic Guitar" },
    { label: "Rock Anthem", genre: "Rock, Alternative", mood: "Powerful, Anthemic, Guitar-Driven" },
    { label: "R&B Vibes", genre: "R&B, Soul", mood: "Smooth, Sensual, Groovy" },
    { label: "Cyberpunk", genre: "Synthwave, Cyberpunk", mood: "Dark, Futuristic, Neon" },
  ],
  [StyleMode.ANIME]: [
    { label: "Anime OP (Fast)", genre: "J-Pop, Anime Opening", mood: "Epic, Fast, Dramatic Build" },
    { label: "Idol Cute", genre: "Idol Pop, Kawaii", mood: "Cute, Genki, Sparkly" },
    { label: "Idol Cool", genre: "Idol Pop, Cool", mood: "Cool, Stylish, Dance" },
    { label: "Isekai Fantasy", genre: "Fantasy, Orchestral J-Pop", mood: "Magical, Adventure, Epic" },
    { label: "Denpa Song", genre: "Denpa, Electronic", mood: "Chaotic, Addictive, High BPM" },
    { label: "Gothic Rock", genre: "Gothic Rock, Visual Kei", mood: "Dark, Dramatic, Beautiful" },
  ],
  [StyleMode.VIRAL_COMICAL]: [
    { label: "Hyperpop/Glitch", genre: "Hyperpop, Glitch", mood: "Chaotic, Distorted, Experimental" },
    { label: "Comical/Meme", genre: "Comedy, Novelty", mood: "Funny, Absurd, Catchy" },
    { label: "Phonk Drift", genre: "Phonk, Drift", mood: "Aggressive, Bass-Heavy, Cowbell" },
    { label: "Sped Up Dance", genre: "Sped Up, Dance Pop", mood: "Fast, Energetic, Nightcore" },
    { label: "Fail/Sad Trombone", genre: "Comedy, Brass", mood: "Dramatic Failure, Comedic" },
  ],
  [StyleMode.HEARTFELT]: [
    { label: "Epic Ballad", genre: "Ballad, Orchestral", mood: "Emotional, Sweeping, Powerful" },
    { label: "Cinematic Soul", genre: "Cinematic, Soul", mood: "Deep, Moving, Filmic" },
    { label: "Emotional Melodies", genre: "Indie, Acoustic", mood: "Tender, Intimate, Raw" },
    { label: "Universal Anthem", genre: "Pop, Anthem", mood: "Uplifting, Unity, Hopeful" },
    { label: "Healing Ambient", genre: "Ambient, New Age", mood: "Peaceful, Healing, Ethereal" },
  ],
};

const ALL_VOCAL_TYPES = Object.values(VocalType);

export default function StyleTab({ styleOutput, setStyleOutput }: StyleTabProps) {
  const [mode, setMode] = useState<StyleMode>(StyleMode.STANDARD);
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [vocalType, setVocalType] = useState<VocalType>(VocalType.FEMALE_SOLO);
  const [useHumanize, setUseHumanize] = useState(false);
  const [useDrumsUp, setUseDrumsUp] = useState(false);
  const [useSfx, setUseSfx] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePreset = (preset: { genre: string; mood: string }) => {
    setGenre(preset.genre);
    setMood(preset.mood);
  };

  const handleGenerate = async () => {
    setLoading(true);
    const input: StyleInput = {
      genre,
      mood,
      vocalType,
      mode,
      useHumanize,
      useDrumsUp,
      useSfx,
    };
    try {
      const result = await generateStylePrompt(input);
      setStyleOutput(result.stylePrompt);
    } catch {
      setStyleOutput("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(styleOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentModeConfig = MODE_CONFIG.find((m) => m.mode === mode);
  const buttonColor = currentModeConfig?.color || "bg-blue-600";
  const buttonHover = currentModeConfig?.hoverColor || "hover:bg-blue-700";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-100">スタイル＆ボーカル</h2>

      {/* Mode Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          モード選択
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {MODE_CONFIG.map((cfg) => {
            const Icon = cfg.icon;
            return (
              <button
                key={cfg.mode}
                onClick={() => setMode(cfg.mode)}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                  mode === cfg.mode
                    ? `${cfg.color} text-white`
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          クイックプリセット
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS[mode].map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset)}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                genre === preset.genre
                  ? `${buttonColor} text-white`
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genre & Mood */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            ジャンル
          </label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ジャンルを入力またはプリセットを選択"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            ムード
          </label>
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ムード/雰囲気を入力"
          />
        </div>
      </div>

      {/* Vocal Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          ボーカルタイプ
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {ALL_VOCAL_TYPES.map((vt) => (
            <button
              key={vt}
              onClick={() => setVocalType(vt)}
              className={`px-3 py-2 rounded-md text-xs transition-colors ${
                vocalType === vt
                  ? `${buttonColor} text-white`
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {vt}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-4">
        <ToggleSwitch label="Drums Up" checked={useDrumsUp} onChange={setUseDrumsUp} />
        <ToggleSwitch label="SFX (Comical)" checked={useSfx} onChange={setUseSfx} />
        <ToggleSwitch label="Humanize" checked={useHumanize} onChange={setUseHumanize} />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`w-full ${buttonColor} ${buttonHover} disabled:opacity-50 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            生成中...
          </>
        ) : (
          "スタイルプロンプトを生成"
        )}
      </button>

      {/* Output */}
      {styleOutput && (
        <div className="relative">
          <div className="bg-black/50 rounded-md p-4 font-mono text-sm text-green-400 whitespace-pre-wrap">
            {styleOutput}
          </div>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-700"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
}

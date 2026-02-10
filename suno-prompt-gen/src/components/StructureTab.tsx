import { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import type { SongStructureInput } from "../types";
import { generateSongStructures } from "../services/geminiService";

interface StructureTabProps {
  structureOutput: string;
  setStructureOutput: (value: string) => void;
}

const STRUCTURE_TYPES = [
  "Verse-Chorus",
  "Progressive",
  "Loop-based",
  "AABA Classic",
  "Through-composed",
  "Verse-Chorus-Bridge",
];

const DURATION_OPTIONS = ["Short (1-2min)", "Standard", "Extended (4min+)"];

export default function StructureTab({
  structureOutput,
  setStructureOutput,
}: StructureTabProps) {
  const [genre, setGenre] = useState("Pop");
  const [bpm, setBpm] = useState(120);
  const [targetAudience, setTargetAudience] = useState("");
  const [structureType, setStructureType] = useState("Verse-Chorus");
  const [targetDuration, setTargetDuration] = useState("Standard");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const input: SongStructureInput = {
      genre,
      bpm,
      targetAudience,
      structureType,
      targetDuration,
    };
    try {
      const result = await generateSongStructures(input);
      setStructureOutput(result.proposal1);
    } catch {
      setStructureOutput("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(structureOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-100">楽曲構成ジェネレーター</h2>

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
            placeholder="例: Pop, EDM, Rock, R&B..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            BPM: {bpm}
          </label>
          <input
            type="range"
            min="60"
            max="200"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>60</span>
            <span>130</span>
            <span>200</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            ターゲットオーディエンス
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: 10代, クラブリスナー, アニメファン..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            目標時間
          </label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setTargetDuration(d)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  targetDuration === d
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          構成タイプ
        </label>
        <div className="flex flex-wrap gap-2">
          {STRUCTURE_TYPES.map((st) => (
            <button
              key={st}
              onClick={() => setStructureType(st)}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                structureType === st
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            生成中...
          </>
        ) : (
          "楽曲構成を生成"
        )}
      </button>

      {structureOutput && (
        <div className="relative">
          <div className="bg-black/50 rounded-md p-4 font-mono text-sm text-green-400 whitespace-pre-wrap">
            {structureOutput}
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

import { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { LyricsLanguage } from "../types";
import type { LyricsInput } from "../types";
import { generateLyrics } from "../services/geminiService";

interface LyricsTabProps {
  structureOutput: string;
  lyricsOutput: string;
  setLyricsOutput: (value: string) => void;
}

const TECHNIQUES = [
  "韻踏み",
  "メタファー",
  "反復",
  "英語混合",
  "ストーリーテリング",
  "抽象表現",
];

export default function LyricsTab({
  structureOutput,
  lyricsOutput,
  setLyricsOutput,
}: LyricsTabProps) {
  const [theme, setTheme] = useState("");
  const [structure, setStructure] = useState(structureOutput);
  const [language, setLanguage] = useState<LyricsLanguage>(LyricsLanguage.JAPANESE);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleTechnique = (tech: string) => {
    setSelectedTechniques((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    const input: LyricsInput = {
      theme,
      structure: structure || structureOutput,
      language,
      techniques: selectedTechniques,
    };
    try {
      const result = await generateLyrics(input);
      setLyricsOutput(result.lyrics);
    } catch {
      setLyricsOutput("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(lyricsOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseStructure = () => {
    setStructure(structureOutput);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-100">作詞ジェネレーター</h2>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          テーマ
        </label>
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="例: 夜の東京、片思い、新しい始まり..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-300">
            楽曲構成
          </label>
          {structureOutput && (
            <button
              onClick={handleUseStructure}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              構成タブの出力を使用
            </button>
          )}
        </div>
        <textarea
          value={structure}
          onChange={(e) => setStructure(e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="楽曲構成を入力（構成タブの出力をペースト可能）"
        />
      </div>

      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          言語
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage(LyricsLanguage.JAPANESE)}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              language === LyricsLanguage.JAPANESE
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            日本語
          </button>
          <button
            onClick={() => setLanguage(LyricsLanguage.ENGLISH)}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              language === LyricsLanguage.ENGLISH
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Techniques */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          テクニック
        </label>
        <div className="flex flex-wrap gap-2">
          {TECHNIQUES.map((tech) => (
            <button
              key={tech}
              onClick={() => toggleTechnique(tech)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                selectedTechniques.includes(tech)
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            作詞中...
          </>
        ) : (
          "歌詞を生成"
        )}
      </button>

      {lyricsOutput && (
        <div className="relative">
          <div className="bg-black/50 rounded-md p-4 font-mono text-sm text-green-400 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {lyricsOutput}
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

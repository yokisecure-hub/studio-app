import { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import type { HumanizeInput } from "../types";
import { generateHumanizedStrategy } from "../services/geminiService";

export default function HumanizeTab() {
  const [genre, setGenre] = useState("");
  const [theme, setTheme] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const input: HumanizeInput = { genre, theme };
    try {
      const result = await generateHumanizedStrategy(input);
      setOutput(result.strategy);
    } catch {
      setOutput("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-100">ヒューマナイズ戦略</h2>
      <p className="text-sm text-gray-400">
        AI生成音楽に人間味を付加する戦略を生成します。Suno v5の「完璧すぎる」出力に有機的な不完全さを加えます。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            ジャンル
          </label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="例: Pop, Rock, EDM..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            テーマ
          </label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="例: 夏の終わり、都会の孤独..."
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            分析中...
          </>
        ) : (
          "ヒューマナイズ戦略を生成"
        )}
      </button>

      {output && (
        <div className="relative">
          <div className="bg-black/50 rounded-md p-4 font-mono text-sm text-green-400 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {output}
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

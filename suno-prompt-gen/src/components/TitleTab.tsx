import { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import type { TitleInput } from "../types";
import { generateSongTitle } from "../services/geminiService";

interface TitleTabProps {
  lyricsOutput: string;
}

export default function TitleTab({ lyricsOutput }: TitleTabProps) {
  const [lyrics, setLyrics] = useState("");
  const [titles, setTitles] = useState<Array<{ en: string; ja: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    const input: TitleInput = { lyrics: lyrics || lyricsOutput };
    try {
      const result = await generateSongTitle(input);
      setTitles(result.titles);
    } catch {
      setTitles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUseLyrics = () => {
    setLyrics(lyricsOutput);
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-100">タイトル生成</h2>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-300">
            歌詞
          </label>
          {lyricsOutput && (
            <button
              onClick={handleUseLyrics}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              作詞タブの出力を使用
            </button>
          )}
        </div>
        <textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          rows={6}
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="歌詞をここに入力（作詞タブの出力をペースト可能）"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || (!lyrics && !lyricsOutput)}
        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            タイトル生成中...
          </>
        ) : (
          "タイトルを生成"
        )}
      </button>

      {titles.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {titles.map((title, i) => (
            <div
              key={i}
              className="bg-gray-800/50 border border-gray-700 rounded-md p-4 flex items-center justify-between"
            >
              <div>
                <div className="text-lg font-bold text-cyan-400">
                  {title.en}
                </div>
                <div className="text-sm text-gray-300 mt-1">{title.ja}</div>
              </div>
              <button
                onClick={() => handleCopy(`${title.en} / ${title.ja}`, i)}
                className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors shrink-0 ml-4"
              >
                {copiedIndex === i ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

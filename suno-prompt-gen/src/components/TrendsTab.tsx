import { useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { fetchTrendingThemes } from "../services/geminiService";

interface TrendsTabProps {
  onTrendSelect?: (trend: string) => void;
}

export default function TrendsTab({ onTrendSelect }: TrendsTabProps) {
  const [trends, setTrends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");

  const handleFetch = async () => {
    setLoading(true);
    setLoadingStage("検索中...");

    const stageTimer = setTimeout(() => {
      setLoadingStage("解析中...");
    }, 3000);

    try {
      const result = await fetchTrendingThemes();
      setTrends(result.trends);
    } catch {
      setTrends(["トレンドの取得に失敗しました。もう一度お試しください。"]);
    } finally {
      clearTimeout(stageTimer);
      setLoading(false);
      setLoadingStage("");
    }
  };

  const handleTrendClick = (trend: string) => {
    const cleanTrend = trend.replace(/^\(トレンド\)\s*/, "");
    onTrendSelect?.(cleanTrend);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-100">リアルタイムトレンド</h2>
      <p className="text-sm text-gray-400">
        Google Search Grounding を使って最新の音楽・ポップカルチャートレンドを取得します。
      </p>

      <button
        onClick={handleFetch}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingStage}
          </>
        ) : (
          <>
            <TrendingUp className="w-4 h-4" />
            トレンドを取得
          </>
        )}
      </button>

      {trends.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {trends.map((trend, i) => (
            <button
              key={i}
              onClick={() => handleTrendClick(trend)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300 hover:bg-emerald-900 hover:border-emerald-600 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {trend}
            </button>
          ))}
        </div>
      )}

      {trends.length > 0 && onTrendSelect && (
        <p className="text-xs text-gray-500">
          クリックでテーマ欄に反映されます
        </p>
      )}
    </div>
  );
}

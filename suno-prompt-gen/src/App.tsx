import { useState, useCallback } from "react";
import StructureTab from "./components/StructureTab";
import StyleTab from "./components/StyleTab";
import LyricsTab from "./components/LyricsTab";
import HumanizeTab from "./components/HumanizeTab";
import TitleTab from "./components/TitleTab";
import TrendsTab from "./components/TrendsTab";

type TabId = "structure" | "style" | "lyrics" | "humanize" | "title" | "trends";

const TABS: Array<{ id: TabId; label: string; icon: string }> = [
  { id: "structure", label: "楽曲構成", icon: "🏗️" },
  { id: "style", label: "スタイル＆ボーカル", icon: "🎨" },
  { id: "lyrics", label: "作詞", icon: "✍️" },
  { id: "humanize", label: "ヒューマナイズ", icon: "🤖" },
  { id: "title", label: "タイトル生成", icon: "💿" },
  { id: "trends", label: "トレンド", icon: "📈" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("structure");

  // Shared state between tabs
  const [structureOutput, setStructureOutput] = useState("");
  const [styleOutput, setStyleOutput] = useState("");
  const [lyricsOutput, setLyricsOutput] = useState("");

  const handleTrendSelect = useCallback((_trend: string) => {
    // When a trend is selected, switch to lyrics tab
    setActiveTab("lyrics");
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center">
            🎵 Suno v5.0+ 楽曲プロンプトジェネレーター
          </h1>
          <p className="text-center text-sm text-gray-500 mt-1">
            API Key不要 — 高品質な楽曲生成プロンプトを自動生成
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex overflow-x-auto gap-1 pb-0 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          {activeTab === "structure" && (
            <StructureTab
              structureOutput={structureOutput}
              setStructureOutput={setStructureOutput}
            />
          )}
          {activeTab === "style" && (
            <StyleTab
              styleOutput={styleOutput}
              setStyleOutput={setStyleOutput}
            />
          )}
          {activeTab === "lyrics" && (
            <LyricsTab
              structureOutput={structureOutput}
              lyricsOutput={lyricsOutput}
              setLyricsOutput={setLyricsOutput}
            />
          )}
          {activeTab === "humanize" && <HumanizeTab />}
          {activeTab === "title" && <TitleTab lyricsOutput={lyricsOutput} />}
          {activeTab === "trends" && (
            <TrendsTab onTrendSelect={handleTrendSelect} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-gray-600">
          Suno AI v5.0+ 最適化 — ピアノ禁止 — 48kHz マスタリング対応
        </div>
      </footer>
    </div>
  );
}

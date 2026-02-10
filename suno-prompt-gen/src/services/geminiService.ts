import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  SongStructureInput,
  SongStructureOutput,
  StyleInput,
  StyleOutput,
  LyricsInput,
  LyricsOutput,
  HumanizeInput,
  HumanizeOutput,
  TitleInput,
  TitleOutput,
} from "../types";
import { StyleMode } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// === 共通ルール ===
const ABSOLUTE_RULES = `
ABSOLUTE RULES (MUST FOLLOW):
1. NEVER use Piano, Keys, or Keyboard as default instruments. Instead use: Analog Synths, Clean Electric Guitar, Distorted Bass, Orchestral Strings, Atmospheric Pads, Acoustic Guitar Strumming, Tube Amp Guitar, Moog Sub 37, TR-808, Fender Stratocaster, etc.
2. Always include Suno v5.0+ Hi-Fi tags: "48kHz Mastered, Dolby Atmos Ready, Wide Stereo Image"
3. Use specific instrument model names (e.g., Fender Stratocaster, TR-808, Moog Sub 37, Juno-106)
4. Include mixing tags (e.g., Sidechain Compression, Multiband Comp, Tape Saturation)
5. Include vocal performance tags (e.g., (Breath), (Fry), (Falsetto), (Whisper to Belt))
`;

// === 1. 楽曲構成生成 ===
export async function generateSongStructures(
  data: SongStructureInput
): Promise<SongStructureOutput> {
  const prompt = `You are an expert music producer specializing in Suno AI v5.0+ song generation.

${ABSOLUTE_RULES}

Generate ONE optimized song structure string for Suno AI v5.0+.

Input:
- Genre: ${data.genre}
- BPM: ${data.bpm}
- Target Audience: ${data.targetAudience}
- Structure Type: ${data.structureType}
- Target Duration: ${data.targetDuration || "Standard"}

Requirements:
- Use [Section Name] [Instrument/Style Details] format
- Include mixing tags (Filter, Reverb, Pan) and specific instrument model names
- Keep under 400 characters
- Output ONLY the structure string, no explanations
- NEVER mention Piano, Keys, or Keyboard

Example format:
[Intro: Moog Sub 37 Pad, Tape Hiss, LPF Sweep] [Verse 1: TR-808 Kick, Fender Strat Clean, Whisper Vox] [Pre-Chorus: Rising Synth, Sidechain Comp] [Chorus: Full Band, Juno-106 Lead, Wide Stereo, (Belt)] [Verse 2: Acoustic Guitar Strumming, Soft Drums] [Bridge: Orchestral Strings, Falsetto] [Final Chorus: Layered Vocals, Tape Saturation, 48kHz Mastered]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return { proposal1: text };
  } catch (error) {
    console.error("Structure generation error:", error);
    return {
      proposal1:
        "[Intro: Moog Sub 37 Pad, Tape Hiss, LPF Sweep 4bars] [Verse 1: TR-808 Kick, Fender Strat Clean, Whisper Vox] [Pre-Chorus: Rising Analog Synth, Sidechain Comp] [Chorus: Full Band, Juno-106 Lead, Wide Stereo, (Belt)] [Bridge: Orchestral Strings, Atmospheric Pads, Falsetto] [Final Chorus: Layered Vocals, Tape Saturation, 48kHz Mastered, Dolby Atmos Ready]",
    };
  }
}

// === 2. スタイルプロンプト生成 ===
export async function generateStylePrompt(
  data: StyleInput
): Promise<StyleOutput> {
  let modeInstructions = "";
  switch (data.mode) {
    case StyleMode.ANIME:
      modeInstructions = `MODE: Anime/Idol
- High information density, Denpa elements, complex chord progressions
- Anime tie-up style, J-Pop influenced, high energy
- Use anime-specific tags: Kawaii, Genki, Moe, Idol Pop
- Fast tempo changes, dramatic builds, orchestral + electronic fusion`;
      break;
    case StyleMode.VIRAL_COMICAL:
      modeInstructions = `MODE: Viral/TikTok
- TikTok viral potential, comical SFX, repetitive hooks, meme elements
- Catchy 15-second loop potential, Hyperpop influence
- Use viral tags: Earworm Hook, Sped Up, Bass Boosted, Glitch
- Comedic timing, unexpected drops, sound effect integration`;
      break;
    case StyleMode.HEARTFELT:
      modeInstructions = `MODE: Heartfelt & Universal
- Deep emotion, cinematic quality, orchestral swells, soulful delivery
- Universal themes, epic build-ups, emotional crescendos
- Use emotional tags: Cinematic, Epic, Soul-stirring, Intimate
- Dynamic range from whisper to powerful belt`;
      break;
    default:
      modeInstructions = `MODE: Standard Hi-Fi
- High fidelity, genre-faithful, professional mixing standards
- Clean production, balanced mix, radio-ready
- Standard industry production quality
- Genre-appropriate instrumentation and arrangement`;
  }

  const humanizeAddition = data.useHumanize
    ? "\nADD Humanize tags: Breathy vocals, Raw production, Emotional delivery, Imperfect, Room tone, Analog warmth, Vinyl texture"
    : "";

  const drumsAddition = data.useDrumsUp
    ? "\nEmphasize drums: Punchy Kicks, Crisp Snare, Hi-Hat Groove, Drum Fill Transitions, Percussion Forward Mix"
    : "";

  const sfxAddition = data.useSfx
    ? "\nAdd SFX elements: Comedic Sound Effects, Cartoon Boings, Record Scratch, Air Horn, Laugh Track hints"
    : "";

  const prompt = `You are an expert Suno AI v5.0+ style prompt engineer.

${ABSOLUTE_RULES}

${modeInstructions}
${humanizeAddition}
${drumsAddition}
${sfxAddition}

Generate a Suno v5.0+ style prompt (approximately 700 characters, comma-separated high-value tags).

Input:
- Genre: ${data.genre}
- Mood: ${data.mood}
- Vocal Type: ${data.vocalType}

Requirements:
- Output ONLY comma-separated tags, approximately 700 characters
- No title, no explanation, no quotes
- Include: genre tags, mood tags, instrument model names, mixing tags, vocal style tags, hi-fi tags
- Must include: 48kHz Mastered, Dolby Atmos Ready, Wide Stereo Image
- NEVER use Piano/Keys/Keyboard
- Vocal type "${data.vocalType}" should influence vocal description tags`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return { stylePrompt: text };
  } catch (error) {
    console.error("Style generation error:", error);
    return {
      stylePrompt: `${data.genre}, ${data.mood}, ${data.vocalType}, Analog Synths, Fender Stratocaster Clean, TR-808 Drums, Moog Sub 37 Bass, Tape Saturation, Sidechain Compression, Multiband Comp, Wide Stereo Image, 48kHz Mastered, Dolby Atmos Ready, Atmospheric Pads, Vintage Reverb, Tube Amp Warmth`,
    };
  }
}

// === 3. 歌詞生成 ===
export async function generateLyrics(
  data: LyricsInput
): Promise<LyricsOutput> {
  const langRules =
    data.language === "japanese"
      ? `
JAPANESE LYRICS SPECIAL RULES (CRITICAL):
- Convert particle pronunciation: は → wa, へ → e, を → wo
- Convert difficult kanji to hiragana for singing: 運命 → さだめ, 本気 → マジ, 宇宙 → そら
- Other particles (が, に, の, で, と etc.) remain as-is
- Do NOT mix romaji within Japanese words
- English words that fit the style ARE allowed as standalone words
- Write lyrics primarily in Japanese (hiragana/katakana/kanji mix)`
      : `
ENGLISH LYRICS RULES:
- Natural, conversational English
- Poetic but accessible language
- Strong rhyme schemes where appropriate`;

  const techniqueStr = data.techniques.length > 0 ? data.techniques.join(", ") : "natural flow";

  const prompt = `You are an expert songwriter for Suno AI v5.0+.

${ABSOLUTE_RULES}

${langRules}

Generate complete song lyrics for the following:

Theme: ${data.theme}
Song Structure: ${data.structure}
Language: ${data.language}
Techniques to use: ${techniqueStr}

Requirements:
- Start with [Intro]
- Follow the provided song structure sections
- Insert Suno v5 vocal performance tags: (Breath), (Fry), (Falsetto), (Whisper), (Belt), (Spoken)
- In stage directions, NEVER mention Piano. Use (Music starts) instead of (Piano starts)
- Output ONLY the lyrics with section tags, no explanations
- Each section should have appropriate length (verses 4-8 lines, chorus 4-6 lines)`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return { lyrics: text };
  } catch (error) {
    console.error("Lyrics generation error:", error);
    return {
      lyrics:
        "[Intro]\n(Music starts softly)\n(Breath)\n\n[Verse 1]\nGeneration failed. Please try again.\n\n[Chorus]\nPlease check your API key and try again.",
    };
  }
}

// === 4. トレンド取得 ===
export async function fetchTrendingThemes(): Promise<{
  trends: string[];
  sourceUrl?: string;
}> {
  const today = new Date().toISOString().split("T")[0];

  const prompt = `Today is ${today}. You MUST use Google Search to find the latest real-time information.

Search for the latest trending themes in music and pop culture as of ${today}.

Find 15 trending themes mixing these categories:
- Vibe trends (e.g., Y2K revival, Cyberpunk aesthetic, Cottagecore, Dark Academia)
- Situation trends (e.g., late night drive, SNS jealousy, post-breakup healing, solo travel)
- Keyword trends (e.g., Chill, Emo, Ethereal, Hyperpop, Lo-fi)

Include both global trends and Japan-specific trends (anime, J-Pop, Vocaloid culture, etc.).

Output ONLY a numbered list of 15 items, one per line. Each item should be a short phrase (2-6 words).
No explanations, no categories, no markdown formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const lines = text
      .split("\n")
      .map((line) => line.replace(/^\d+[.)]\s*/, ""))
      .map((line) => line.replace(/^[-*]\s*/, ""))
      .map((line) => line.replace(/\*\*(.*?)\*\*/g, "$1"))
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const trends = lines.map((line) => `(トレンド) ${line}`);

    return { trends: trends.length > 0 ? trends : getFallbackTrends() };
  } catch (error) {
    console.error("Trend fetch error:", error);
    return { trends: getFallbackTrends() };
  }
}

function getFallbackTrends(): string[] {
  return [
    "(トレンド) Y2K Revival Aesthetic",
    "(トレンド) Cyberpunk Neon Nights",
    "(トレンド) Late Night City Drive",
    "(トレンド) Post-Breakup Healing",
    "(トレンド) SNS Jealousy & FOMO",
    "(トレンド) Anime Opening Energy",
    "(トレンド) Lo-fi Study Beats",
    "(トレンド) Hyperpop Glitch Core",
    "(トレンド) Cottagecore Serenity",
    "(トレンド) Dark Academia Vibes",
    "(トレンド) Vocaloid Underground",
    "(トレンド) Solo Travel Freedom",
    "(トレンド) Digital Detox Nature",
    "(トレンド) Emo Revival Wave",
    "(トレンド) J-Pop City Pop Fusion",
  ];
}

// === 5. ヒューマナイズ戦略生成 ===
export async function generateHumanizedStrategy(
  data: HumanizeInput
): Promise<HumanizeOutput> {
  const prompt = `You are an expert in making AI-generated music sound human and organic for Suno AI v5.0+.

${ABSOLUTE_RULES}

Generate a humanization strategy for:
- Genre: ${data.genre}
- Theme: ${data.theme}

Output EXACTLY 3 sections with these headers:

[Suno スタイルプロンプト]
A comma-separated style prompt addition (under 150 chars) using: Tube Amp, Vintage Drums, Room Mic, Breath, Analog Warmth, Tape Hiss, Vinyl Crackle. NEVER use Piano/Keys/Keyboard.

[Suno 歌詞構成]
Strategies to break AI monotony in lyrics: unexpected pauses, tempo changes, [Spoken] sections, [Whisper] tags, [Scream] tags, irregular line lengths, conversational asides, breath marks.

[ポスト処理アドバイス]
DAW post-processing tips to hide AI artifacts: EQ adjustments, Tape Saturation, subtle pitch drift, room reverb, analog warmth plugins, micro-timing shifts, gentle wow & flutter.

Output in Japanese where appropriate. Be specific and actionable.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return { strategy: text };
  } catch (error) {
    console.error("Humanize strategy error:", error);
    return {
      strategy: `[Suno スタイルプロンプト]
Tube Amp Warmth, Vintage Drum Machine, Room Mic Ambience, Breath Texture, Analog Tape Hiss, Vinyl Crackle, Raw Vocal, Imperfect Timing

[Suno 歌詞構成]
- [Spoken] セクションを予期しない場所に挿入
- (Breath) タグでリアルな呼吸感を追加
- [Whisper] から [Belt] への急激な変化
- 不規則な行の長さでAIの均一性を破壊
- テンポの微妙な揺れを示唆するステージディレクション

[ポスト処理アドバイス]
- DAWでTape Saturationプラグインを軽く適用
- EQで100Hz付近にアナログ的な温かみを追加
- 微細なピッチドリフト（±5cent）でロボット感を除去
- ルームリバーブで空間的なリアリティを付加
- マイクロタイミングシフトで機械的な正確さを崩す`,
    };
  }
}

// === 6. タイトル生成 ===
export async function generateSongTitle(
  data: TitleInput
): Promise<TitleOutput> {
  const lyricsSnippet = data.lyrics.substring(0, 1000);

  const prompt = `You are a creative music title generator.

Analyze the following lyrics and generate 5 song title pairs (English + Japanese).

Lyrics:
${lyricsSnippet}

Requirements:
- English titles: Cool, abstract, catchy, global standard appeal
- Japanese titles: Emotional, symbolic, beautiful Japanese expressions
- Output ONLY a JSON array, no explanation, no markdown fences
- Format: [{"en": "English Title", "ja": "日本語タイトル"}, ...]
- Generate exactly 5 pairs`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Remove markdown JSON fences if present
    text = text.replace(/^```json\s*\n?/i, "").replace(/\n?```\s*$/i, "");

    const titles = JSON.parse(text) as Array<{ en: string; ja: string }>;
    return { titles };
  } catch (error) {
    console.error("Title generation error:", error);
    return {
      titles: [
        { en: "Neon Heartbeat", ja: "ネオンの鼓動" },
        { en: "Starlight Reverie", ja: "星灯りの夢想" },
        { en: "Echoes of Tomorrow", ja: "明日のこだま" },
        { en: "Velvet Midnight", ja: "真夜中のベルベット" },
        { en: "Crystal Pulse", ja: "水晶の脈動" },
      ],
    };
  }
}

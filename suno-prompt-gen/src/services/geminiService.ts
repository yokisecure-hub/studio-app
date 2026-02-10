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

// ========================================================
// API Key 不要 — 全ロジックをテンプレートベースで実装
// ========================================================

// === ユーティリティ ===
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// === 楽器・タグ定義（ピアノ禁止） ===
const INSTRUMENTS = {
  synths: ["Moog Sub 37", "Juno-106 Pad", "Prophet-5", "Oberheim OB-X", "Analog Synth Sweep", "Roland Jupiter-8", "Korg MS-20"],
  guitars: ["Fender Stratocaster Clean", "Gibson Les Paul Crunch", "Acoustic Guitar Strumming", "Tube Amp Guitar", "Telecaster Twang", "Nylon String Guitar"],
  bass: ["Fender Precision Bass", "Moog Bass", "Distorted Bass", "Sub Bass 808", "Rickenbacker Bass", "Synth Bass Wobble"],
  drums: ["TR-808 Kick", "TR-909 Hi-Hat", "Vintage Drum Machine", "Live Drum Kit", "Brushed Drums", "Electronic Drum Pattern", "Breakbeat Loops"],
  strings: ["Orchestral Strings", "String Ensemble Swell", "Cinematic Strings", "Pizzicato Strings", "Chamber Strings"],
  pads: ["Atmospheric Pads", "Ambient Texture", "Ethereal Pad Layer", "Warm Analog Pad", "Granular Pad"],
  other: ["Vinyl Crackle", "Tape Hiss", "Room Mic Ambience", "Wind Chimes", "Music Box Melody", "Glockenspiel", "Marimba"],
};

const HIFI_TAGS = "48kHz Mastered, Dolby Atmos Ready, Wide Stereo Image";
const VOCAL_PERF_TAGS = ["(Breath)", "(Fry)", "(Falsetto)", "(Whisper)", "(Belt)", "(Spoken)", "(Whisper to Belt)", "(Vocal Run)"];

// === ジャンル別楽器マッピング ===
interface GenreProfile {
  instruments: string[];
  mixTags: string[];
  vibe: string[];
}

function getGenreProfile(genre: string): GenreProfile {
  const g = genre.toLowerCase();
  if (g.includes("edm") || g.includes("electronic") || g.includes("dance")) {
    return {
      instruments: ["TR-808 Kick", "Juno-106 Pad", "Moog Sub 37 Bass", "Synth Bass Wobble", "TR-909 Hi-Hat", "Analog Synth Sweep"],
      mixTags: ["Sidechain Compression", "Multiband Comp", "Stereo Widener", "HPF Rise"],
      vibe: ["Festival Energy", "Drop-Heavy", "Build & Release", "Euphoric"],
    };
  }
  if (g.includes("rock") || g.includes("alt")) {
    return {
      instruments: ["Gibson Les Paul Crunch", "Fender Precision Bass", "Live Drum Kit", "Tube Amp Guitar", "Telecaster Twang"],
      mixTags: ["Tape Saturation", "Parallel Compression", "Analog Summing", "Bus Compression"],
      vibe: ["Raw Power", "Anthemic", "Guitar-Driven", "Arena Rock"],
    };
  }
  if (g.includes("lo-fi") || g.includes("lofi") || g.includes("chill")) {
    return {
      instruments: ["Vinyl Crackle", "Acoustic Guitar Strumming", "Nylon String Guitar", "Warm Analog Pad", "Brushed Drums", "Tape Hiss"],
      mixTags: ["Tape Saturation", "LPF Sweep", "Analog Summing"],
      vibe: ["Nostalgic", "Relaxed", "Late Night", "Warm"],
    };
  }
  if (g.includes("r&b") || g.includes("soul")) {
    return {
      instruments: ["Fender Stratocaster Clean", "Sub Bass 808", "Brushed Drums", "String Ensemble Swell", "Warm Analog Pad"],
      mixTags: ["Sidechain Compression", "Tape Saturation", "Stereo Widener"],
      vibe: ["Smooth", "Sensual", "Groovy", "Soulful"],
    };
  }
  if (g.includes("anime") || g.includes("j-pop") || g.includes("idol")) {
    return {
      instruments: ["Juno-106 Pad", "Fender Stratocaster Clean", "TR-808 Kick", "Orchestral Strings", "Glockenspiel", "Analog Synth Sweep"],
      mixTags: ["Multiband Comp", "Sidechain Compression", "Stereo Widener", "HPF Rise"],
      vibe: ["High Energy", "Dramatic Build", "Kawaii", "Sparkly"],
    };
  }
  if (g.includes("hip") || g.includes("rap") || g.includes("trap")) {
    return {
      instruments: ["TR-808 Kick", "Sub Bass 808", "TR-909 Hi-Hat", "Atmospheric Pads", "Synth Bass Wobble"],
      mixTags: ["Sidechain Compression", "Multiband Comp", "Parallel Compression"],
      vibe: ["Hard-Hitting", "Bass-Heavy", "Dark", "Street"],
    };
  }
  if (g.includes("phonk") || g.includes("drift")) {
    return {
      instruments: ["TR-808 Kick", "Sub Bass 808", "Vintage Drum Machine", "Atmospheric Pads", "Tape Hiss"],
      mixTags: ["Tape Saturation", "Sidechain Compression", "LPF Sweep"],
      vibe: ["Aggressive", "Cowbell", "Memphis", "Dark Drift"],
    };
  }
  if (g.includes("ballad") || g.includes("cinematic") || g.includes("orchestral")) {
    return {
      instruments: ["Orchestral Strings", "Cinematic Strings", "Nylon String Guitar", "String Ensemble Swell", "Atmospheric Pads", "Chamber Strings"],
      mixTags: ["Bus Compression", "Stereo Widener", "Analog Summing"],
      vibe: ["Emotional", "Sweeping", "Epic", "Cinematic"],
    };
  }
  if (g.includes("ambient") || g.includes("new age") || g.includes("healing")) {
    return {
      instruments: ["Atmospheric Pads", "Ethereal Pad Layer", "Granular Pad", "Wind Chimes", "Warm Analog Pad"],
      mixTags: ["Stereo Widener", "LPF Sweep", "Analog Summing"],
      vibe: ["Peaceful", "Ethereal", "Healing", "Spacious"],
    };
  }
  if (g.includes("hyperpop") || g.includes("glitch")) {
    return {
      instruments: ["Synth Bass Wobble", "TR-808 Kick", "Analog Synth Sweep", "Roland Jupiter-8", "Electronic Drum Pattern"],
      mixTags: ["Multiband Comp", "Sidechain Compression", "Stereo Widener"],
      vibe: ["Chaotic", "Distorted", "Experimental", "Maximalist"],
    };
  }
  if (g.includes("synth") || g.includes("cyberpunk") || g.includes("retro")) {
    return {
      instruments: ["Prophet-5", "Oberheim OB-X", "Moog Sub 37", "TR-808 Kick", "Roland Jupiter-8", "Juno-106 Pad"],
      mixTags: ["Tape Saturation", "Sidechain Compression", "Stereo Widener", "LPF Sweep"],
      vibe: ["Futuristic", "Neon", "Dark", "Retro-Future"],
    };
  }
  // Default: Pop
  return {
    instruments: ["Fender Stratocaster Clean", "TR-808 Kick", "Juno-106 Pad", "Moog Sub 37 Bass", "Live Drum Kit", "Atmospheric Pads"],
    mixTags: ["Sidechain Compression", "Multiband Comp", "Tape Saturation", "Stereo Widener"],
    vibe: ["Catchy", "Radio-Ready", "Modern", "Upbeat"],
  };
}

// === 1. 楽曲構成生成 ===
export async function generateSongStructures(
  data: SongStructureInput
): Promise<SongStructureOutput> {
  const profile = getGenreProfile(data.genre);
  const instruments = profile.instruments;
  const mix = profile.mixTags;

  const isShort = data.targetDuration?.includes("Short");
  const isExtended = data.targetDuration?.includes("Extended");
  const structType = data.structureType.toLowerCase();

  let sections: string[] = [];

  if (structType.includes("loop")) {
    sections = [
      `[Intro: ${pick(instruments)}, ${pick(INSTRUMENTS.pads)}, ${pick(mix)}]`,
      `[Loop A: ${pick(instruments)}, ${pick(instruments)}, ${pick(VOCAL_PERF_TAGS)}]`,
      `[Loop B: ${pick(instruments)}, ${pick(mix)}, Build]`,
      `[Loop A+: ${pick(instruments)}, Layered, ${HIFI_TAGS.split(", ")[0]}]`,
      `[Outro: ${pick(INSTRUMENTS.pads)}, Fade, ${pick(mix)}]`,
    ];
  } else if (structType.includes("progressive") || structType.includes("through")) {
    sections = [
      `[Intro: ${pick(INSTRUMENTS.pads)}, ${pick(INSTRUMENTS.other)}, LPF Sweep]`,
      `[Movement 1: ${pick(instruments)}, ${pick(instruments)}, ${pick(VOCAL_PERF_TAGS)}]`,
      `[Movement 2: ${pick(instruments)}, ${pick(mix)}, Crescendo]`,
      `[Climax: ${pickN(instruments, 2).join(", ")}, ${pick(VOCAL_PERF_TAGS)}, Wide Stereo]`,
      `[Resolution: ${pick(INSTRUMENTS.strings)}, ${pick(INSTRUMENTS.pads)}, 48kHz Mastered]`,
    ];
  } else if (structType.includes("aaba")) {
    sections = [
      `[A1: ${pick(instruments)}, ${pick(instruments)}, ${pick(mix)}]`,
      `[A2: ${pick(instruments)}, ${pick(VOCAL_PERF_TAGS)}, ${pick(mix)}]`,
      `[B: ${pick(instruments)}, ${pick(INSTRUMENTS.strings)}, Modulation]`,
      `[A3: ${pickN(instruments, 2).join(", ")}, ${HIFI_TAGS.split(", ")[0]}]`,
    ];
  } else {
    // Verse-Chorus (default) / Verse-Chorus-Bridge
    sections = [
      `[Intro: ${pick(INSTRUMENTS.synths)}, ${pick(INSTRUMENTS.other)}, LPF Sweep]`,
      `[Verse 1: ${pick(instruments)}, ${pick(instruments)}, ${pick(VOCAL_PERF_TAGS)}]`,
      `[Pre-Chorus: ${pick(INSTRUMENTS.synths)}, ${pick(mix)}, Rising]`,
      `[Chorus: ${pickN(instruments, 2).join(", ")}, ${pick(VOCAL_PERF_TAGS)}, Wide Stereo]`,
    ];
    if (!isShort) {
      sections.push(
        `[Verse 2: ${pick(instruments)}, ${pick(INSTRUMENTS.drums)}, ${pick(mix)}]`,
        `[Chorus 2: ${pickN(instruments, 2).join(", ")}, ${pick(VOCAL_PERF_TAGS)}, Layered]`
      );
    }
    if (structType.includes("bridge") || isExtended) {
      sections.push(
        `[Bridge: ${pick(INSTRUMENTS.strings)}, ${pick(INSTRUMENTS.pads)}, ${pick(VOCAL_PERF_TAGS)}]`
      );
    }
    sections.push(
      `[Final Chorus: Layered Vocals, ${pick(mix)}, ${HIFI_TAGS}]`
    );
    if (isExtended) {
      sections.push(`[Outro: ${pick(INSTRUMENTS.pads)}, Fade, Dolby Atmos Ready]`);
    }
  }

  return { proposal1: sections.join(" ") };
}

// === 2. スタイルプロンプト生成 ===
export async function generateStylePrompt(
  data: StyleInput
): Promise<StyleOutput> {
  const profile = getGenreProfile(data.genre);
  const tags: string[] = [];

  // Genre & mood
  tags.push(data.genre);
  if (data.mood) tags.push(data.mood);

  // Mode-specific tags
  switch (data.mode) {
    case StyleMode.ANIME:
      tags.push("Anime Tie-up Style", "J-Pop Fusion", "High Energy", "Complex Chord Progressions",
        "Dramatic Build", "Orchestral + Electronic", "Kawaii Vocal Texture", "Genki Performance",
        "Fast Tempo Changes", "Idol Pop Energy");
      break;
    case StyleMode.VIRAL_COMICAL:
      tags.push("TikTok Viral Hook", "Earworm Chorus", "Sped Up Potential", "Bass Boosted",
        "Comedic Timing", "Unexpected Drops", "Meme-Worthy Hook", "15-Second Loop Ready",
        "Catchy Ad-Lib", "Glitch Transition");
      break;
    case StyleMode.HEARTFELT:
      tags.push("Cinematic Emotion", "Orchestral Swell", "Soul-Stirring Delivery",
        "Dynamic Range", "Intimate Verse", "Epic Chorus Build", "Emotional Crescendo",
        "Universal Theme", "Soulful Vocal", "Film Score Quality");
      break;
    default:
      tags.push("Hi-Fi Production", "Radio-Ready Mix", "Professional Mastering",
        "Genre-Faithful", "Clean Production", "Balanced Mix");
  }

  // Instruments from genre profile
  tags.push(...pickN(profile.instruments, 4));
  tags.push(...pickN(profile.mixTags, 2));

  // Vocal type
  tags.push(`${data.vocalType} Vocal`);
  const vocalLower = data.vocalType.toLowerCase();
  if (vocalLower.includes("female")) tags.push("Feminine Tone", "Clear High Register");
  if (vocalLower.includes("male") && !vocalLower.includes("female")) tags.push("Rich Baritone", "Warm Male Tone");
  if (vocalLower.includes("rap")) tags.push("Rhythmic Flow", "Sharp Diction", "Freestyle Energy");
  if (vocalLower.includes("whisper")) tags.push("ASMR Quality", "Intimate Mic Proximity", "Soft Breath");
  if (vocalLower.includes("opera")) tags.push("Classical Technique", "Vibrato", "Powerful Projection");
  if (vocalLower.includes("anime")) tags.push("Character Voice", "Expressive Range", "Cute Timbre");
  if (vocalLower.includes("vocaloid")) tags.push("Digital Vocal Texture", "Perfect Pitch", "Synth Voice");
  if (vocalLower.includes("child")) tags.push("Innocent Tone", "Pure Voice", "Youthful Energy");
  if (vocalLower.includes("duo") || vocalLower.includes("group")) tags.push("Harmony", "Call and Response", "Layered Vocals");

  // Vocal performance tags
  tags.push(...pickN(VOCAL_PERF_TAGS, 3));

  // Options
  if (data.useHumanize) {
    tags.push("Breathy Vocals", "Raw Production", "Emotional Delivery", "Imperfect", "Room Tone", "Analog Warmth", "Vinyl Texture");
  }
  if (data.useDrumsUp) {
    tags.push("Punchy Kicks", "Crisp Snare", "Hi-Hat Groove", "Drum Fill Transitions", "Percussion Forward Mix");
  }
  if (data.useSfx) {
    tags.push("Comedic Sound Effects", "Cartoon Boings", "Record Scratch", "Air Horn", "Laugh Track Hints");
  }

  // Hi-fi tags (always)
  tags.push(HIFI_TAGS);

  // Extra texture
  tags.push(...pickN(["Tape Saturation", "Vintage Reverb", "Tube Amp Warmth", "Analog Summing", "Spatial Audio", "Stereo Enhancement"], 2));

  const stylePrompt = tags.join(", ");
  return { stylePrompt };
}

// === 3. 歌詞生成 ===
export async function generateLyrics(
  data: LyricsInput
): Promise<LyricsOutput> {
  // セクションを解析
  const sectionMatches = data.structure.match(/\[([^\]]+)\]/g) || [];
  const sectionNames = sectionMatches.map((s) => s.replace(/\[|\]/g, "").split(":")[0].trim());

  const isJapanese = data.language === "japanese";
  const useTechniques = data.techniques;
  const theme = data.theme || "心の旅";

  // テーマ別の語彙プール
  const jpVocab = getJapaneseVocab(theme);
  const enVocab = getEnglishVocab(theme);

  const lines: string[] = [];

  // セクションがない場合のデフォルト構成
  const sections = sectionNames.length > 0
    ? sectionNames
    : ["Intro", "Verse 1", "Pre-Chorus", "Chorus", "Verse 2", "Chorus", "Bridge", "Final Chorus", "Outro"];

  for (const section of sections) {
    const sLower = section.toLowerCase();
    lines.push(`[${section}]`);

    if (sLower.includes("intro")) {
      lines.push("(Music starts softly)");
      lines.push(pick(VOCAL_PERF_TAGS));
      lines.push("");
    } else if (sLower.includes("outro")) {
      lines.push(isJapanese ? `${pick(jpVocab.emotional)}...` : `${pick(enVocab.emotional)}...`);
      lines.push("(Breath)");
      lines.push("(Music fades)");
      lines.push("");
    } else if (sLower.includes("chorus") || sLower.includes("hook")) {
      const chorusLines = isJapanese
        ? generateJapaneseChorus(jpVocab, useTechniques, theme)
        : generateEnglishChorus(enVocab, useTechniques, theme);
      lines.push(...chorusLines);
      lines.push("");
    } else if (sLower.includes("bridge")) {
      lines.push(pick(["(Whisper)", "(Falsetto)", "(Spoken)"]));
      const bridgeLines = isJapanese
        ? generateJapaneseBridge(jpVocab, theme)
        : generateEnglishBridge(enVocab, theme);
      lines.push(...bridgeLines);
      lines.push("");
    } else if (sLower.includes("verse") || sLower.includes("movement") || sLower.includes("loop")) {
      const verseLines = isJapanese
        ? generateJapaneseVerse(jpVocab, useTechniques, theme, sLower.includes("2") || sLower.includes("b"))
        : generateEnglishVerse(enVocab, useTechniques, theme, sLower.includes("2") || sLower.includes("b"));
      lines.push(...verseLines);
      lines.push("");
    } else if (sLower.includes("pre-chorus") || sLower.includes("pre chorus")) {
      lines.push(pick(VOCAL_PERF_TAGS));
      const pcLines = isJapanese
        ? [pick(jpVocab.rising), pick(jpVocab.emotional)]
        : [pick(enVocab.rising), pick(enVocab.emotional)];
      lines.push(...pcLines);
      lines.push("");
    } else {
      // その他のセクション
      lines.push(pick(VOCAL_PERF_TAGS));
      const otherLines = isJapanese
        ? [pick(jpVocab.imagery), pick(jpVocab.emotional)]
        : [pick(enVocab.imagery), pick(enVocab.emotional)];
      lines.push(...otherLines);
      lines.push("");
    }
  }

  return { lyrics: lines.join("\n") };
}

// --- 日本語歌詞ヘルパー ---
interface JapaneseVocab {
  imagery: string[];
  emotional: string[];
  rising: string[];
  hooks: string[];
}

function getJapaneseVocab(theme: string): JapaneseVocab {
  const t = theme.toLowerCase();
  if (t.includes("夜") || t.includes("night") || t.includes("ドライブ")) {
    return {
      imagery: ["ネオンの光が流れる街角で", "月明かりが照らすアスファルト", "深夜のハイウェイ 窓を開けて", "信号が変わる瞬間に", "街灯の下 影が伸びて", "星が消える前に走り出す"],
      emotional: ["このままどこかe 連れてって", "夜wa終わらない 終わらせない", "スピードの中に自由がある", "眠れない夜wo抱きしめて", "孤独さえも美しい"],
      rising: ["加速していく このHeartbeat", "もう戻れない 振り返らない"],
      hooks: ["Midnight Drive 止まらない", "ネオンに溶ける 僕らの夜", "夜wa僕らのもの"],
    };
  }
  if (t.includes("恋") || t.includes("love") || t.includes("片思い")) {
    return {
      imagery: ["すれ違う肩 触れそうで触れない", "教室の窓から見てた 君の横顔", "言えない言葉が 胸に溢れる", "放課後の廊下 君の声が聞こえた", "スマホの画面 既読がつかない", "同じ空の下 違う世界にいる"],
      emotional: ["好きだよ ただそれだけなのに", "この気持ちwo なんて呼べばいい", "届かない手wo伸ばし続ける", "涙wa見せない 笑顔の裏で", "さだめだとしても 諦めきれない"],
      rising: ["もう隠せない この想い", "心が叫んでる 聞こえてますか"],
      hooks: ["片思いのメロディー", "君だけに届けたい", "Love is わがまま"],
    };
  }
  // デフォルト
  return {
    imagery: ["朝焼けが空wo染めていく", "風が運ぶ 遠い記憶", "交差点で立ち止まる", "雨上がりの匂いがした", "ビルの谷間に光が差す", "季節wa巡り また会える"],
    emotional: ["まだ見ぬ明日e歩き出す", "強くなれる 信じてるから", "ありのままの自分でいい", "涙の数だけ 強くなれた", "夢wa終わらない ここから始まる"],
    rising: ["さあ 飛び立とう この場所から", "未来wa僕らの手の中"],
    hooks: ["走り出せ 止まるな", "光の中e Brand New Day", "僕らの歌が響く"],
  };
}

function generateJapaneseVerse(vocab: JapaneseVocab, techniques: string[], _theme: string, isSecond: boolean): string[] {
  const lines: string[] = [];
  if (!isSecond) lines.push("(Breath)");
  const pool = isSecond ? [...vocab.imagery].reverse() : vocab.imagery;
  lines.push(pick(pool));
  lines.push(pick(pool));
  if (techniques.includes("メタファー")) {
    lines.push(pick(["心のコンパスが 指し示す方向", "蝶のように 舞い上がれ", "ガラスの向こう側 もう一人の僕"]));
  }
  lines.push(pick(vocab.emotional));
  if (techniques.includes("英語混合")) {
    lines.push(pick(["My soul is calling out", "No turning back now", "This is our moment"]));
  }
  return lines;
}

function generateJapaneseChorus(vocab: JapaneseVocab, techniques: string[], _theme: string): string[] {
  const lines: string[] = [];
  lines.push("(Belt)");
  lines.push(pick(vocab.hooks));
  lines.push(pick(vocab.emotional));
  if (techniques.includes("反復")) {
    const hook = pick(vocab.hooks);
    lines.push(hook);
    lines.push(hook);
  } else {
    lines.push(pick(vocab.imagery));
    lines.push(pick(vocab.emotional));
  }
  if (techniques.includes("韻踏み")) {
    lines.push(pick(["光 hikari 走り hashiri", "夢 yume 風 kaze 舞え mae"]));
  }
  return lines;
}

function generateJapaneseBridge(vocab: JapaneseVocab, _theme: string): string[] {
  return [
    pick(vocab.imagery),
    pick(["それでも前wo向く", "全部 受け止める", "壊れそうな夜も"]),
    pick(vocab.emotional),
    "(Breath)",
  ];
}

// --- 英語歌詞ヘルパー ---
interface EnglishVocab {
  imagery: string[];
  emotional: string[];
  rising: string[];
  hooks: string[];
}

function getEnglishVocab(theme: string): EnglishVocab {
  const t = theme.toLowerCase();
  if (t.includes("night") || t.includes("drive") || t.includes("夜")) {
    return {
      imagery: ["Neon lights bleeding through the rain", "Empty streets and endless lanes", "Dashboard glow on your face", "City skyline fading in the mirror", "Headlights cutting through the dark", "Radio static, finding our frequency"],
      emotional: ["We're running out of time but I don't care", "This feeling's all I need tonight", "Don't let the morning steal this away", "Lost in the moment, found in you", "Speed is just another word for free"],
      rising: ["Turn it up, let the bass take over", "No looking back, we're almost there"],
      hooks: ["Midnight never felt so alive", "Chasing neon dreams", "We own the night"],
    };
  }
  if (t.includes("love") || t.includes("heart") || t.includes("恋")) {
    return {
      imagery: ["Your shadow dances on my wall", "Words I wrote but never sent", "The space between your hand and mine", "Echoes of your laughter stay", "Pages of a letter torn apart", "Photographs that tell our story"],
      emotional: ["I'm falling deeper than I've ever been", "This love is gravity I can't escape", "Every heartbeat spells your name", "I'd cross a thousand skies for you", "Broken pieces still shine bright"],
      rising: ["Can you hear my heart from where you are", "I'm on the edge of saying everything"],
      hooks: ["Love is a beautiful disaster", "You're my favorite kind of chaos", "Heartbeat symphony"],
    };
  }
  return {
    imagery: ["Sunrise painting golden lines", "Crossroads where the future starts", "Footprints washed away by waves", "Mountains rise above the clouds", "Rain falls like a brand new song", "Windows open to the world"],
    emotional: ["We are more than what we've lost", "Tomorrow's written in our hands", "Stand tall even when you fall", "Every scar becomes a star", "Dreams don't die they just transform"],
    rising: ["This is where it all begins", "Rise up from the ashes now"],
    hooks: ["We are unstoppable", "Born to shine, born to fly", "Brand new day, brand new way"],
  };
}

function generateEnglishVerse(vocab: EnglishVocab, techniques: string[], _theme: string, isSecond: boolean): string[] {
  const lines: string[] = [];
  if (!isSecond) lines.push("(Breath)");
  const pool = isSecond ? [...vocab.imagery].reverse() : vocab.imagery;
  lines.push(pick(pool));
  lines.push(pick(pool));
  if (techniques.includes("メタファー") || techniques.includes("抽象表現")) {
    lines.push(pick(["Like a river finding the sea", "A paper plane against the storm", "Glass walls around a burning heart"]));
  }
  lines.push(pick(vocab.emotional));
  if (techniques.includes("ストーリーテリング")) {
    lines.push(pick(["I remember when it all began", "That night under the flickering lights", "You said the words I'll never forget"]));
  }
  return lines;
}

function generateEnglishChorus(vocab: EnglishVocab, techniques: string[], _theme: string): string[] {
  const lines: string[] = [];
  lines.push("(Belt)");
  lines.push(pick(vocab.hooks));
  lines.push(pick(vocab.emotional));
  if (techniques.includes("反復")) {
    const hook = pick(vocab.hooks);
    lines.push(hook);
    lines.push(hook);
  } else {
    lines.push(pick(vocab.imagery));
    lines.push(pick(vocab.emotional));
  }
  return lines;
}

function generateEnglishBridge(vocab: EnglishVocab, _theme: string): string[] {
  return [
    pick(vocab.imagery),
    pick(["But even stars need the dark to shine", "I'm still standing after all this time", "Let the silence speak for both of us"]),
    pick(vocab.emotional),
    "(Breath)",
  ];
}

// === 4. トレンド取得 ===
export async function fetchTrendingThemes(): Promise<{
  trends: string[];
  sourceUrl?: string;
}> {
  // API不要 — 内蔵トレンドデータベースからランダム選択
  const allTrends = [
    // Vibe
    "Y2K Revival Aesthetic", "Cyberpunk Neon Nights", "Cottagecore Serenity",
    "Dark Academia Vibes", "Vaporwave Nostalgia", "Afrofuturism Rising",
    "Ethereal Fairycore", "Retro-Future Synth", "Grunge Revival",
    "Kawaii Culture", "Dreamcore Surreal", "Solarpunk Utopia",
    // Situation
    "Late Night City Drive", "Post-Breakup Healing", "SNS Jealousy & FOMO",
    "Solo Travel Freedom", "Digital Detox Nature", "Work From Home Blues",
    "First Love Nostalgia", "Rainy Day Melancholy", "Summer Festival Energy",
    "Graduation Goodbye", "New City New Life", "Midnight Confession",
    // Keyword / Music
    "Anime Opening Energy", "Lo-fi Study Beats", "Hyperpop Glitch Core",
    "Vocaloid Underground", "Emo Revival Wave", "J-Pop City Pop Fusion",
    "K-Pop Dance Break", "Phonk Drift Culture", "Bedroom Pop Aesthetic",
    "Indie Folk Warmth", "Trap Soul Vibes", "Future Bass Drop",
    "Nu-Metal Comeback", "Shoegaze Dream", "Math Rock Complexity",
  ];

  const selected = pickN(allTrends, 15);
  const trends = selected.map((t) => `(トレンド) ${t}`);

  // 少し遅延を入れてUXを自然に（検索している感じ）
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return { trends };
}

// === 5. ヒューマナイズ戦略生成 ===
export async function generateHumanizedStrategy(
  data: HumanizeInput
): Promise<HumanizeOutput> {
  const profile = getGenreProfile(data.genre);
  const instruments = pickN(profile.instruments, 3);

  const stylePrompt = [
    "Tube Amp Warmth", "Vintage Drum Machine", "Room Mic Ambience",
    pick(["Breath Texture", "Raw Vocal Take", "Imperfect Timing"]),
    pick(["Analog Tape Hiss", "Vinyl Crackle", "Analog Warmth"]),
    pick(instruments),
  ].join(", ");

  const strategy = `[Suno スタイルプロンプト]
${stylePrompt}

[Suno 歌詞構成]
「${data.theme}」のテーマに合わせたヒューマナイズ戦略:

1. 予期しない場所に [Spoken] セクションを挿入
   → Verse 2の途中やBridge前に会話調のパートを入れる

2. ボーカルパフォーマンスタグの戦略的配置
   → (Breath) をフレーズの切れ目に自然に配置
   → [Whisper] から (Belt) への急激な変化でダイナミクスを作る
   → (Fry) をVerseの出だしに使い親密感を演出

3. AIの均一性を破壊する構成要素
   → 不規則な行の長さ（4音節→12音節→2音節）
   → [Scream] タグで予期しない感情爆発
   → テンポチェンジの示唆: (Half-time feel) → (Double-time)

4. ${data.genre}ジャンル特有のヒューマナイズ
   → ${pick(profile.vibe)}な雰囲気を崩さずに有機的な揺れを追加
   → ${pick(instruments)} のアナログ的な音色で温かみを付加

[ポスト処理アドバイス]
DAWでの後処理でAIアーティファクトを隠す具体的手順:

1. EQ処理
   → 100Hz付近をシェルフで+1.5dB: アナログ的な温かみ
   → 3-5kHz を軽くディップ: デジタルのハーシュさを除去
   → ハイシェルフ 12kHz を -0.5dB: 自然なエアー感

2. Tape Saturation
   → Waves J37 または Soundtoys Decapitator を Insert
   → Drive: 15-20%、Mix: 30-40%
   → 倍音を追加して「生っぽさ」を演出

3. ピッチ＆タイミング補正
   → Melodyne でピッチを ±5-10cent 微妙にずらす
   → マイクロタイミングシフト: ±10ms のランダム配置
   → パーフェクトなクオンタイズを 85-90% に緩める

4. 空間処理
   → Room Reverb (Small Room, 0.8-1.2s) で空間的リアリティ
   → 軽い Wow & Flutter プラグイン（RC-20 Retro Color 推奨）
   → ステレオイメージを左右に微妙に揺らす

5. アナログシミュレーション
   → マスターバスに軽い Bus Compression (2:1, Slow Attack)
   → ${pick(["Studer A800", "Ampex ATR-102"])} テープエミュレーション
   → 仕上げに Vinyl プラグインで極微量のクラックルを追加`;

  return { strategy };
}

// === 6. タイトル生成 ===
export async function generateSongTitle(
  data: TitleInput
): Promise<TitleOutput> {
  const lyrics = data.lyrics.substring(0, 1000);

  // 歌詞からキーワードを抽出
  const hasNight = /夜|night|midnight|neon|ネオン/i.test(lyrics);
  const hasLove = /愛|恋|love|heart|好き|kiss/i.test(lyrics);
  const hasSky = /空|sky|星|star|月|moon|光|light/i.test(lyrics);
  const hasDream = /夢|dream|wish|hope|未来|future/i.test(lyrics);
  const hasRain = /雨|rain|涙|tear|cry/i.test(lyrics);
  const hasFire = /炎|fire|burn|灼|熱/i.test(lyrics);

  const titlePool: Array<{ en: string; ja: string }> = [];

  if (hasNight) {
    titlePool.push(
      { en: "Neon Pulse", ja: "ネオンの脈動" },
      { en: "Midnight Frequency", ja: "真夜中の周波数" },
      { en: "After Dark", ja: "夜の向こう側" },
      { en: "City Lights Requiem", ja: "街灯のレクイエム" },
      { en: "Nocturne Drive", ja: "夜想曲ドライブ" },
    );
  }
  if (hasLove) {
    titlePool.push(
      { en: "Heartbeat Paradox", ja: "鼓動のパラドックス" },
      { en: "Gravity of You", ja: "君という引力" },
      { en: "Unspoken Echo", ja: "言えない共鳴" },
      { en: "Velvet Collision", ja: "ベルベットの衝突" },
      { en: "Tender Chaos", ja: "やさしい混沌" },
    );
  }
  if (hasSky) {
    titlePool.push(
      { en: "Starlight Reverie", ja: "星灯りの夢想" },
      { en: "Beyond the Blue", ja: "蒼の彼方" },
      { en: "Lunar Serenade", ja: "月夜のセレナーデ" },
      { en: "Celestial Thread", ja: "天の糸" },
      { en: "Aurora Signal", ja: "オーロラ信号" },
    );
  }
  if (hasDream) {
    titlePool.push(
      { en: "Dreamcatcher", ja: "夢を掴む手" },
      { en: "Tomorrow's Canvas", ja: "明日のキャンバス" },
      { en: "Future Bloom", ja: "未来の花" },
      { en: "Horizon Chaser", ja: "地平線を追う者" },
      { en: "Wishbone Sky", ja: "願いの空" },
    );
  }
  if (hasRain) {
    titlePool.push(
      { en: "Raindrop Symphony", ja: "雫のシンフォニー" },
      { en: "Tearfall", ja: "涙の落ちる場所" },
      { en: "Storm Glass", ja: "嵐のガラス" },
      { en: "After the Rain", ja: "雨上がりの約束" },
      { en: "Crystal Tears", ja: "透明な涙" },
    );
  }
  if (hasFire) {
    titlePool.push(
      { en: "Burning Horizon", ja: "燃える地平線" },
      { en: "Ember Heart", ja: "残り火の心臓" },
      { en: "Phoenix Dawn", ja: "不死鳥の夜明け" },
      { en: "Inferno Waltz", ja: "業火のワルツ" },
      { en: "Flame Protocol", ja: "炎のプロトコル" },
    );
  }

  // デフォルトプール
  titlePool.push(
    { en: "Echoes of Tomorrow", ja: "明日のこだま" },
    { en: "Crystal Pulse", ja: "水晶の脈動" },
    { en: "Signal Lost", ja: "途切れた信号" },
    { en: "Parallel Lines", ja: "平行線の果て" },
    { en: "Vivid Fragment", ja: "鮮烈な破片" },
    { en: "Silent Overture", ja: "沈黙の序曲" },
    { en: "Neon Heartbeat", ja: "ネオンの鼓動" },
    { en: "Glass Horizon", ja: "硝子の地平線" },
  );

  const titles = pickN(titlePool, 5);
  return { titles };
}

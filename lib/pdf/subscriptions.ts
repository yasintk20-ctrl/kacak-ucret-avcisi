/* ============================================================
   Abonelik / tekrar eden ödeme marka kataloğu
   ------------------------------------------------------------
   Kart ekstresi ve banka hareketlerinde en sık görülen marka
   imzaları. Yanlış pozitif yaratmamak için her patternın
   belirgin olması şart (ör. "apple" tek başına değil,
   "apple.com/bill" gibi ekstreye düşen spesifik satır).
   ============================================================ */

export interface BrandPattern {
  key: string;
  name: string;
  icon: string;
  /** Lowercase substrings; herhangi biri metinde geçerse eşleşir. */
  patterns: string[];
  cancelUrl?: string;
}

export const SUBSCRIPTION_BRANDS: BrandPattern[] = [
  // --- Video streaming ---
  {
    key: "netflix",
    name: "Netflix",
    icon: "🎬",
    patterns: ["netflix"],
    cancelUrl: "https://www.netflix.com/youraccount",
  },
  {
    key: "spotify",
    name: "Spotify",
    icon: "🎧",
    patterns: ["spotify"],
    cancelUrl: "https://www.spotify.com/tr/account/subscription/",
  },
  {
    key: "exxen",
    name: "Exxen",
    icon: "📺",
    patterns: ["exxen"],
    cancelUrl: "https://www.exxen.com/hesap/abonelik",
  },
  {
    key: "blutv",
    name: "BluTV",
    icon: "🎥",
    patterns: ["blutv", "blu tv"],
    cancelUrl: "https://www.blutv.com/hesap",
  },
  {
    key: "tabii",
    name: "Tabii",
    icon: "📺",
    patterns: ["tabii.com", "tabii trt"],
  },
  {
    key: "gain",
    name: "GAIN",
    icon: "🎞️",
    patterns: ["gain.tv", "gaintv"],
  },
  {
    key: "puhutv",
    name: "PuhuTV",
    icon: "📺",
    patterns: ["puhutv", "puhu tv"],
  },
  {
    key: "disneyplus",
    name: "Disney+",
    icon: "🐭",
    patterns: ["disney+", "disney plus", "disneyplus"],
    cancelUrl: "https://www.disneyplus.com/account/subscription",
  },
  {
    key: "mubi",
    name: "MUBI",
    icon: "🎞️",
    patterns: ["mubi"],
  },
  {
    key: "youtube_premium",
    name: "YouTube Premium",
    icon: "▶️",
    patterns: ["youtube premium", "youtubepremium", "google*youtube", "google *youtube"],
    cancelUrl: "https://www.youtube.com/paid_memberships",
  },
  {
    key: "amazon_prime",
    name: "Amazon Prime",
    icon: "📦",
    patterns: ["amazon prime", "prime video", "amazon.com*", "amzn mktp"],
    cancelUrl: "https://www.amazon.com.tr/gp/primecentral",
  },
  {
    key: "hbo_max",
    name: "HBO Max / Max",
    icon: "🎭",
    patterns: ["hbo max", "hbomax", "max.com"],
  },
  {
    key: "bein",
    name: "beIN Connect",
    icon: "⚽",
    patterns: ["bein connect", "beinconnect", "bein.com"],
  },
  {
    key: "ssport",
    name: "S Sport Plus",
    icon: "⚽",
    patterns: ["s sport plus", "ssport plus", "s sport+"],
  },
  {
    key: "digiturk",
    name: "Digiturk",
    icon: "📡",
    patterns: ["digiturk"],
  },
  {
    key: "dsmart",
    name: "D-Smart",
    icon: "📡",
    patterns: ["d-smart", "d smart"],
  },
  {
    key: "tivibu",
    name: "Tivibu",
    icon: "📡",
    patterns: ["tivibu"],
  },
  {
    key: "turkcell_tv",
    name: "Turkcell TV+",
    icon: "📺",
    patterns: ["turkcell tv+", "turkcell tv plus"],
  },

  // --- Müzik ---
  {
    key: "apple_music",
    name: "Apple Music",
    icon: "🎵",
    patterns: ["apple music"],
  },
  {
    key: "fizy",
    name: "Fizy",
    icon: "🎵",
    patterns: ["fizy"],
  },
  {
    key: "deezer",
    name: "Deezer",
    icon: "🎵",
    patterns: ["deezer"],
  },
  {
    key: "tidal",
    name: "TIDAL",
    icon: "🎵",
    patterns: ["tidal.com", "tidal*"],
  },

  // --- Apple / Google store ödemeleri (iCloud vs.) ---
  {
    key: "apple_bill",
    name: "Apple (App Store / iCloud)",
    icon: "",
    patterns: ["apple.com/bill", "apple com bill", "itunes.com/bill", "apple.com.bill"],
    cancelUrl: "https://apps.apple.com/account/subscriptions",
  },
  {
    key: "google_play",
    name: "Google Play / Google One",
    icon: "☁️",
    patterns: ["google*", "google play", "google one", "google workspace"],
    cancelUrl: "https://play.google.com/store/account/subscriptions",
  },

  // --- Cloud / productivity ---
  {
    key: "adobe",
    name: "Adobe Creative Cloud",
    icon: "🎨",
    patterns: ["adobe"],
    cancelUrl: "https://account.adobe.com/plans",
  },
  {
    key: "ms365",
    name: "Microsoft 365",
    icon: "📝",
    patterns: ["microsoft 365", "office 365", "msft*office", "microsoft*store"],
  },
  {
    key: "dropbox",
    name: "Dropbox",
    icon: "📦",
    patterns: ["dropbox"],
    cancelUrl: "https://www.dropbox.com/account/plan",
  },
  {
    key: "notion",
    name: "Notion",
    icon: "📝",
    patterns: ["notion labs", "notion.so"],
  },
  {
    key: "figma",
    name: "Figma",
    icon: "🎨",
    patterns: ["figma"],
  },
  {
    key: "canva",
    name: "Canva",
    icon: "🎨",
    patterns: ["canva"],
  },
  {
    key: "zoom",
    name: "Zoom",
    icon: "🎥",
    patterns: ["zoom.us", "zoom video"],
  },

  // --- AI ---
  {
    key: "openai",
    name: "ChatGPT / OpenAI",
    icon: "🤖",
    patterns: ["openai", "chat gpt", "chatgpt"],
    cancelUrl: "https://chat.openai.com/#settings/Subscription",
  },
  {
    key: "claude",
    name: "Claude (Anthropic)",
    icon: "🤖",
    patterns: ["anthropic", "claude.ai"],
  },
  {
    key: "midjourney",
    name: "Midjourney",
    icon: "🎨",
    patterns: ["midjourney"],
  },
  {
    key: "copilot",
    name: "GitHub Copilot",
    icon: "🤖",
    patterns: ["github copilot", "github.com"],
  },

  // --- Eğitim / iş ---
  {
    key: "duolingo",
    name: "Duolingo Super",
    icon: "🦉",
    patterns: ["duolingo"],
    cancelUrl: "https://www.duolingo.com/settings/subscription",
  },
  {
    key: "linkedin",
    name: "LinkedIn Premium",
    icon: "💼",
    patterns: ["linkedin"],
  },
  {
    key: "grammarly",
    name: "Grammarly",
    icon: "✍️",
    patterns: ["grammarly"],
  },
  {
    key: "udemy",
    name: "Udemy",
    icon: "🎓",
    patterns: ["udemy"],
  },

  // --- Oyun ---
  {
    key: "psn",
    name: "PlayStation Plus",
    icon: "🎮",
    patterns: ["playstation", "psn*", "sony entertainment"],
  },
  {
    key: "xbox",
    name: "Xbox Game Pass",
    icon: "🎮",
    patterns: ["xbox", "game pass", "xboxlive"],
  },
  {
    key: "nintendo",
    name: "Nintendo Online",
    icon: "🎮",
    patterns: ["nintendo"],
  },
  {
    key: "steam",
    name: "Steam",
    icon: "🎮",
    patterns: ["steampowered", "steam games", "valve*"],
  },
  {
    key: "twitch",
    name: "Twitch",
    icon: "🎮",
    patterns: ["twitch.tv", "twitch interactive"],
  },

  // --- Dating ---
  {
    key: "tinder",
    name: "Tinder",
    icon: "🔥",
    patterns: ["tinder"],
  },
  {
    key: "bumble",
    name: "Bumble",
    icon: "🐝",
    patterns: ["bumble"],
  },

  // --- E-ticaret / teslimat üyelikleri ---
  {
    key: "hepsiburada_premium",
    name: "Hepsiburada Premium",
    icon: "🛒",
    patterns: ["hepsiburada premium", "hb premium"],
  },
  {
    key: "trendyol_plus",
    name: "Trendyol Plus",
    icon: "🛒",
    patterns: ["trendyol plus"],
  },
  {
    key: "yemeksepeti_joker",
    name: "Yemeksepeti Joker",
    icon: "🍔",
    patterns: ["yemeksepeti joker", "joker tek"],
  },
  {
    key: "getir_blue",
    name: "Getir Blue",
    icon: "🛒",
    patterns: ["getir blue", "getirblue"],
  },

  // --- Haber / yayıncılık ---
  {
    key: "nytimes",
    name: "New York Times",
    icon: "📰",
    patterns: ["nytimes", "ny times", "new york times"],
  },
  {
    key: "medium",
    name: "Medium",
    icon: "📝",
    patterns: ["medium.com", "medium*membership"],
  },
  {
    key: "wsj",
    name: "Wall Street Journal",
    icon: "📰",
    patterns: ["wsj.com", "wall street journal"],
  },

  // --- Fitness ---
  {
    key: "strava",
    name: "Strava",
    icon: "🏃",
    patterns: ["strava"],
  },
  {
    key: "mp_sport",
    name: "MP Sports",
    icon: "🏋️",
    patterns: ["mp sports", "mpsports"],
  },

  // --- VPN / güvenlik ---
  {
    key: "nordvpn",
    name: "NordVPN",
    icon: "🛡️",
    patterns: ["nordvpn"],
  },
  {
    key: "expressvpn",
    name: "ExpressVPN",
    icon: "🛡️",
    patterns: ["expressvpn"],
  },
  {
    key: "1password",
    name: "1Password",
    icon: "🔐",
    patterns: ["1password", "agilebits"],
  },
];

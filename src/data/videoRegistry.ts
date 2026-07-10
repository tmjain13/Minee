export interface VideoCategory {
  title: string;
  description: string;
  icon: string;
  playlistUrl?: string;
  videos: VideoItem[];
}

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  type: 'live' | 'pravachan' | 'yatra' | 'bhajan' | 'documentary';
  date?: string;
  duration?: string;
  seriesId?: string;
  episodeNumber?: number;
  mood?: 'Peace & Calm' | 'Discipline & Penance (Tap)' | 'Devotion & Bhakti' | 'Spiritual Wisdom' | 'Ahimsa & Travel';
  prefilledQuote?: string;
  description?: string;
}

export interface DiscourseSeries {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  coverImage?: string;
  icon: string;
  videos: VideoItem[];
}

export const OFFICIAL_CHANNEL_URL = "https://youtube.com/@terapanth";
export const OFFICIAL_INSTAGRAM_URL = "https://www.instagram.com/terapanth?igsh=YmczYmc2a3VwbWp1";

export const VIDEO_REGISTRY: VideoCategory[] = [
  {
    title: "Live Broadcasts",
    description: "Daily live discourses and events directly from the Acharya's current Vihar station.",
    icon: "Radio",
    playlistUrl: "https://www.youtube.com/@terapanth/streams",
    videos: [
      {
        id: "daily-pravachan",
        title: "Daily Morning Pravachan - Live from Delhi Pitampura Base",
        url: "https://www.youtube.com/watch?v=live_pravachan_placeholder",
        thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
        type: "live",
        duration: "Live Stream",
        mood: "Spiritual Wisdom",
        prefilledQuote: "Join the divine direct stream of Acharya Shri Mahashraman Ji from Delhi base. Daily moral updates, vows, and spiritual uplift.",
        description: "The official continuous streaming service of the Terapanth order. Starts daily at 7:00 AM IST. Experience holy interactions & blessings."
      }
    ]
  },
  {
    title: "Pravachan (Discourses)",
    description: "Deep spiritual insights, vows, and teachings from Acharya Shri Mahashraman.",
    icon: "Mic2",
    playlistUrl: "https://www.youtube.com/@terapanth/playlists",
    videos: [
      {
        id: "v1",
        title: "The Ultimate Guide to Samayik Performance in Busy Secular Life",
        url: "https://www.youtube.com/watch?v=sadhana_samayik_guide",
        thumbnail: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=800",
        type: "pravachan",
        date: "2026-05-20",
        duration: "45:30",
        mood: "Peace & Calm",
        prefilledQuote: "Samaayik is the primary doorway to pure equanimity. Spending 48 minutes away from technical alarms restores your primary identity.",
        description: "Acharya Dev explains how equanimity releases deep karmic bondage. Discover practical steps of high-focus meditation."
      },
      {
        id: "v2",
        title: "Navkar Mantra: Mathematical Vibrations & Universal Infinite Energy",
        url: "https://www.youtube.com/watch?v=navkar_vibration_science",
        thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
        type: "pravachan",
        date: "2026-04-15",
        duration: "32:20",
        mood: "Devotion & Bhakti",
        prefilledQuote: "Namokar Mantra is not for individual personal boons, but a structural surrender to pure spiritual excellence. It elevates cellular vibrations.",
        description: "An intensive breakdown of the 5 supreme lines of Namokar. Learn the sound science behind high-alert chanting."
      },
      {
        id: "v3",
        title: "How to Conquer Fear, Anxiety, and Insecurities with Anuvrat Code",
        url: "https://www.youtube.com/watch?v=anuvrat_overcoming_anxiety",
        thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=800",
        type: "pravachan",
        date: "2026-03-10",
        duration: "25:40",
        mood: "Peace & Calm",
        prefilledQuote: "Small vows (Anuvrats) prevent massive moral failures and structural stresses of life. Limiting desires is the best therapy.",
        description: "A sermon delivered on self-restraint and modern anxiety. Learn why mental boundaries lead to immense inner freedom."
      },
      {
        id: "v4",
        title: "Jain Karma Physics: The Real Dynamics of Cause and Effect",
        url: "https://www.youtube.com/watch?v=karma_physics_laws",
        thumbnail: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&q=80&w=800",
        type: "pravachan",
        date: "2026-02-18",
        duration: "52:15",
        mood: "Spiritual Wisdom",
        prefilledQuote: "Karma is not an emotional fate, but precise energetic physics. Every volition triggers atomic attraction. Free your soul with clean intentions.",
        description: "An exquisite intellectual exposition of early metaphysics. Explore how the 9 Tattvas operate in our daily interactions."
      }
    ]
  },
  {
    title: "Ahimsa Yatra Highlights",
    description: "Documenting the historic barefoot migration for humanity, peace, and absolute morality.",
    icon: "Map",
    playlistUrl: "https://www.youtube.com/@terapanth/playlists",
    videos: [
      {
        id: "y1",
        title: "Ahimsa Yatra barefoot march across critical rural districts of India",
        url: "https://www.youtube.com/watch?v=yatra_highlights_rural",
        thumbnail: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
        type: "yatra",
        date: "2025-11-10",
        duration: "18:45",
        mood: "Ahimsa & Travel",
        prefilledQuote: "Marching without vehicles, with no digital dependencies, Muni Dev spreads message of sobriety, de-addiction, and deep truth.",
        description: "Footage of historical movement. Hundreds of villages taking oaths to abandon alcohol, domestic harm, and direct violence."
      }
    ]
  },
  {
    title: "Bhajans & Devotional Songs",
    description: "Soul-stirring hymns, rhythmic chants, and prayers of the Terapanth order.",
    icon: "Music",
    videos: [
      {
        id: "b1",
        title: "Om Bhikshu Supreme Chant (Dhyan and Concentrative Chords)",
        url: "https://www.youtube.com/watch?v=bhikshu_chant_ambient",
        thumbnail: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=800",
        type: "bhajan",
        duration: "15:00",
        mood: "Devotion & Bhakti",
        prefilledQuote: "Om Bhikshu chant vibrates with direct resolution and spiritual focus. Let your breathing system synchronize with the mantra.",
        description: "Sustained peaceful audio chords coupled with traditional spiritual syllables of the holy founder Acharya Bhikshu."
      }
    ]
  },
  {
    title: "Instagram Shorts & Reels",
    description: "Bite-sized daily wisdom, pravachans, moral lessons, and visual stories from our vibrant Instagram feed.",
    icon: "Instagram",
    playlistUrl: "https://www.instagram.com/terapanth",
    videos: [
      {
        id: "ig-pravachan-1",
        title: "Acharya Mahashraman Ji on the Art of Speaking Mild Words (Mriduta)",
        url: "https://www.instagram.com/reel/C8_example_1/",
        thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
        type: "pravachan",
        date: "2026-05-30",
        duration: "01:30",
        mood: "Peace & Calm",
        prefilledQuote: "Soft words turn away wrath. Mriduta (mildness/gentleness) is the ornament of a truly strong soul.",
        description: "A highly dynamic short discourse explaining why gentle language keeps homes peaceful and cuts off aggressive karmic inflow."
      },
      {
        id: "ig-pravachan-2",
        title: "The Physics of Desires: Breaking Modern Anxiety with Aparigraha",
        url: "https://www.instagram.com/reel/C8_example_2/",
        thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
        type: "pravachan",
        date: "2026-05-28",
        duration: "02:00",
        mood: "Discipline & Penance (Tap)",
        prefilledQuote: "Limiting your material needs preserves your spiritual energy. Non-attachment is the master key to modern mental wellness.",
        description: "How small self-restraint goals act as psychological boundaries against the relentless rush of contemporary consumer stress."
      },
      {
        id: "ig-pravachan-3",
        title: "Resounding Echo of Navkar Mantra in Ambient Raga Chords",
        url: "https://www.instagram.com/reel/C8_example_3/",
        thumbnail: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=800",
        type: "bhajan",
        date: "2026-05-25",
        duration: "01:00",
        mood: "Devotion & Bhakti",
        prefilledQuote: "Vibrate with the sacred syllables of five supreme beings. Clean energy, stress relief, and sound healing for everyone.",
        description: "A short acoustic meditation combining the holy verses of Navkar with therapeutic ambient sitar and pad sounds."
      }
    ]
  }
];

export const SERIES_REGISTRY: DiscourseSeries[] = [
  {
    id: "vairagya-series",
    title: "Path of Vairagya (Spiritual detachment)",
    description: "A sequential study on the core science of detachment, desire redirection, and absolute mindfulness.",
    icon: "Compass",
    coverImage: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=800",
    videos: [
      {
        id: "vairagya-1",
        title: "Understading Real Detachment vs Escapism - Ep 1",
        url: "https://www.youtube.com/watch?v=vairagya_ep1",
        type: "pravachan",
        date: "2026-01-01",
        duration: "45:00",
        seriesId: "vairagya-series",
        episodeNumber: 1,
        mood: "Spiritual Wisdom",
        prefilledQuote: "Vairagya is not hating the materials around you, but loving the ultimate truth so intensely that secondary things fall off naturally.",
        description: "Acharya Dev breaks down misconceptions of spiritual renunciation. Beautiful advice for householders."
      },
      {
        id: "vairagya-2",
        title: "Scientific Ways to Conquer Habits and Addictions - Ep 2",
        url: "https://www.youtube.com/watch?v=vairagya_ep2",
        type: "pravachan",
        date: "2026-01-08",
        duration: "48:15",
        seriesId: "vairagya-series",
        episodeNumber: 2,
        mood: "Discipline & Penance (Tap)",
        prefilledQuote: "The mind always seeks quick neural rewards. Tapas (penance) and vows create a conscious safety net, shielding your soul from automated trap behaviors.",
        description: "Focus on modern behavioral patterns. Learn to use ancient mindfulness to re-program neural addictions."
      },
      {
        id: "vairagya-3",
        title: "The Incredible Ultimate Joy of Spiritual Renunciation - Ep 3",
        url: "https://www.youtube.com/watch?v=vairagya_ep3",
        type: "pravachan",
        date: "2026-01-15",
        duration: "52:00",
        seriesId: "vairagya-series",
        episodeNumber: 3,
        mood: "Peace & Calm",
        prefilledQuote: "Real peace is not the addition of possessions but subtraction of spiritual weight. The lighter the soul, the higher it floats.",
        description: "The concluding episode summarizing Acharya Bhikshu's teachings on absolute contentment."
      }
    ]
  },
  {
    id: "maryada-series",
    title: "Traditions of Maryada Mahotsav",
    description: "Deep dive into the codes of conduct, administration rules, and unity of monastic systems in Terapanth.",
    icon: "Shield",
    coverImage: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&q=80&w=800",
    videos: [
      {
        id: "maryada-1",
        title: "Comprehensive History of Maryada Mahotsav & Acharya Bhikshu's Code - Ep 1",
        url: "https://www.youtube.com/watch?v=maryada_ep1",
        type: "pravachan",
        date: "2026-02-01",
        duration: "35:00",
        seriesId: "maryada-series",
        episodeNumber: 1,
        mood: "Spiritual Wisdom",
        prefilledQuote: "Unity and discipline have kept the Terapanth order pristine and split-free for over two centuries. Our code is our spiritual lungs.",
        description: "Learn how the legendary rules of Acharya Bhikshu are read and renewed annually during Maryada Mahotsav."
      },
      {
        id: "maryada-2",
        title: "Acharya Mahashraman Dev on Voluntary Discipline - Ep 2",
        url: "https://www.youtube.com/watch?v=maryada_ep2",
        type: "pravachan",
        date: "2026-02-05",
        duration: "42:15",
        seriesId: "maryada-series",
        episodeNumber: 2,
        mood: "Discipline & Penance (Tap)",
        prefilledQuote: "External policing is slavery. Self-discipline (Anushasana) is complete spiritual liberty. Live your days with clear spiritual parameters.",
        description: "An evocative sermon outlining why rules are not restrictions, but deep channels to concentrate high psychic currents."
      }
    ]
  }
];

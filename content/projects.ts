// Toàn bộ nội dung dự án. Ô ngoặc vuông là chỗ Demi cần cung cấp, hiện nguyên văn trên site.

export const tabs = ["Video Editor", "VFX & Motion", "Designer"] as const;
export type Tab = (typeof tabs)[number];

export type VideoAsset = {
  label: string;
  src: string;
  poster: string;
  width: number;
  height: number;
};

export type ImageAsset = { label: string; src: string; width: number; height: number };

export type Project = {
  slug: string;
  title: string;
  event: string;
  year: string;
  tags: string[];
  role: string;
  /** Tab ở Selected Work. Không có thì dự án không nằm trong list. */
  tab?: Tab;
  /** A: Flagship, B: Project, C: Snapshot */
  level: "A" | "B" | "C";
  hidden?: boolean;
  /** Dự án thuộc case study khác thì link về đó, không có trang riêng. */
  partOf?: string;
  /** Giây, chỉ dự án có video. */
  duration?: number;
  preview?: string;
  poster: string;
  video?: VideoAsset;
  videos?: VideoAsset[];
  images?: ImageAsset[];
  note?: string;
  summary?: string;
  learned?: string;
  tools?: string;
  related?: string[];
};

const work = (slug: string) => `/media/work/${slug}`;

const workVideo = (slug: string, label: string, width: number, height: number): VideoAsset => ({
  label,
  src: `${work(slug)}/full.mp4`,
  poster: `${work(slug)}/poster.jpg`,
  width,
  height,
});

const image = (path: string, label: string, width = 1500, height = 1500): ImageAsset => ({
  label,
  src: `/media/${path}`,
  width,
  height,
});

const MA26 = "marketing-arena-2026";
const CONCEPT_NOTE = "Concept edit. Footage belongs to its original owners.";

export const projects: Project[] = [
  {
    slug: "top-4-reveal-film",
    title: "Top 4 Reveal Film",
    event: "Marketing Arena 2026",
    year: "2026",
    tags: ["Video"],
    role: "Director & Video Editor",
    tab: "Video Editor",
    level: "A",
    partOf: MA26,
    duration: 77,
    preview: `${work("top-4-reveal-film")}/preview.mp4`,
    poster: `${work("top-4-reveal-film")}/poster.jpg`,
    video: workVideo("top-4-reveal-film", "Top 4 Reveal Film", 1920, 804),
  },
  {
    slug: "official-cinematic-trailer",
    title: "Official Cinematic Trailer",
    event: "Marketing Arena 2025",
    year: "2025",
    tags: ["Video", "Concept edit"],
    role: "Video Editor",
    tab: "Video Editor",
    level: "B",
    duration: 90,
    preview: `${work("official-cinematic-trailer")}/preview.mp4`,
    poster: `${work("official-cinematic-trailer")}/poster.jpg`,
    video: workVideo("official-cinematic-trailer", "Official Cinematic Trailer", 1920, 802),
    note: CONCEPT_NOTE,
    summary:
      "Edited the official trailer for Marketing Arena 2025, translating the creative brief into a visual story aligned with the event's space-themed branding.",
    learned: "[One line on what I learned, Demi to provide]",
    tools: "[Confirm tools]",
    related: ["vfx-teaser"],
  },
  {
    slug: "nguyen-hue-ooh-spot",
    title: "Nguyen Hue OOH Spot",
    event: "Marketing Arena 2026",
    year: "2026",
    tags: ["VFX", "Motion"],
    role: "VFX & Motion Artist",
    tab: "VFX & Motion",
    level: "A",
    partOf: MA26,
    duration: 30,
    preview: `${work("nguyen-hue-ooh-spot")}/preview.mp4`,
    poster: `${work("nguyen-hue-ooh-spot")}/poster.jpg`,
    video: workVideo("nguyen-hue-ooh-spot", "VFX · Nguyen Hue OOH Spot (vertical)", 1080, 1836),
  },
  {
    slug: "vfx-teaser",
    title: "VFX Teaser",
    event: "Marketing Arena 2025",
    year: "2025",
    tags: ["VFX", "Motion"],
    role: "VFX & Motion Artist",
    tab: "VFX & Motion",
    level: "B",
    duration: 39,
    preview: `${work("vfx-teaser")}/preview.mp4`,
    poster: `${work("vfx-teaser")}/poster.jpg`,
    video: workVideo("vfx-teaser", "VFX Teaser", 1920, 952),
    summary:
      "Built the teaser for Marketing Arena 2025, translating the creative brief into a visual story aligned with the event's space-themed branding.",
    learned: "[One line on what I learned, Demi to provide]",
    tools: "[Confirm tools]",
    related: ["official-cinematic-trailer"],
  },
  {
    slug: "registration-countdown",
    title: "Registration Countdown",
    event: "Marketing Arena 2026",
    year: "2026",
    tags: ["Motion"],
    role: "Motion Designer",
    tab: "VFX & Motion",
    level: "A",
    partOf: MA26,
    duration: 20,
    preview: `${work("registration-countdown")}/preview.mp4`,
    poster: `${work("registration-countdown")}/poster.jpg`,
    video: workVideo("registration-countdown", "Motion · Registration Countdown (vertical)", 1080, 1920),
  },
  {
    slug: "key-visual-system",
    title: "Key Visual System",
    event: "Marketing Arena 2026",
    year: "2026",
    tags: ["Design"],
    role: "Designer",
    tab: "Designer",
    level: "A",
    partOf: MA26,
    poster: "/media/kv/official-kv-ma26.jpg",
  },
  {
    slug: "campaign-social-assets",
    title: "Campaign Social Assets",
    event: "Marketing Arena 2026",
    year: "2026",
    tags: ["Design"],
    role: "Art Director & Designer",
    tab: "Designer",
    level: "A",
    partOf: MA26,
    poster: "/media/social/count-down-48h.jpg",
  },
  {
    slug: "daily-social-content-series",
    title: "Daily Social Content Series",
    event: "Marketing Daily",
    year: "[Project year]",
    tags: ["Design"],
    role: "Designer",
    tab: "Designer",
    level: "C",
    poster: "/media/daily/brand-story.jpg",
    tools: "Photoshop",
    summary:
      "News, Brand Story and G(old) Campaign posts for the Creatio Facebook page, reaching around 2.5K+ people with 140+ engagements per post.",
    images: [
      image("daily/brand-story.jpg", "Brand Story post"),
      image("daily/creative-spot.jpg", "Creative Spot post"),
      image("daily/news.jpg", "News post"),
      image("daily/gc-1.jpg", "G(old) Campaign post"),
      image("daily/gc.jpg", "G(old) Campaign post, landscape", 1800, 1200),
    ],
  },
  {
    slug: "animated-invitations",
    title: "Animated Invitations",
    event: "Internal Projects 2025",
    year: "2025",
    tags: ["Motion"],
    role: "[Confirm role]",
    level: "C",
    poster: "/media/invitations/award-night-invitation.jpg",
    summary: "[One sentence on the project, Demi to provide]",
    videos: [
      {
        label: "Award Night invitation (vertical)",
        src: "/media/invitations/award-night-invitation.mp4",
        poster: "/media/invitations/award-night-invitation.jpg",
        width: 1080,
        height: 1920,
      },
      {
        label: "SO invitation (vertical)",
        src: "/media/invitations/so-invitation.mp4",
        poster: "/media/invitations/so-invitation.jpg",
        width: 1080,
        height: 1920,
      },
    ],
  },
  {
    // Demi tạm ẩn. Nhúng YouTube khi bật lại: https://youtu.be/PitVgj5neCk, https://youtu.be/25ce-jaLdXg
    slug: "ngoc-ho-medicare",
    title: "Ngoc Ho Medicare: Long-form & Shorts",
    event: "Ngoc Ho Medicare",
    year: "2025–2026",
    tags: ["Video"],
    role: "[Confirm role per video]",
    level: "C",
    hidden: true,
    poster: "",
  },
  {
    slug: "seasonal-campaign",
    title: "Seasonal Campaign: Tết & Mid-Autumn",
    event: "[Add later]",
    year: "[Project year]",
    tags: ["Photo"],
    role: "[Confirm role]",
    level: "C",
    hidden: true,
    poster: "",
  },
];

export const visibleProjects = projects.filter((project) => !project.hidden);

export const projectsByTab = (tab: Tab) => visibleProjects.filter((project) => project.tab === tab);

export const getProject = (slug: string) => visibleProjects.find((project) => project.slug === slug);

/** Slug có trang riêng trong /work. */
export const pageSlugs = [MA26, ...visibleProjects.filter((p) => !p.partOf).map((p) => p.slug)];

export const projectHref = (project: Project) =>
  project.partOf ? `/work/${project.partOf}#${project.slug}` : `/work/${project.slug}`;

export const formatDuration = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export const campaign = {
  slug: MA26,
  title: "Marketing Arena 2026",
  caseLabel: "Leader of Creative Communications",
  problem: "[One sentence on the campaign problem, Demi to provide]",
  heroSlug: "top-4-reveal-film",
  glance: [
    {
      label: "Client",
      value:
        "Marketing Arena 2026. Nationwide marketing competition with 3,087 participants, 1,029 teams and representation from 80 universities",
    },
    {
      label: "My role",
      value:
        "Leader of Creative Communications. Led the creative concept, communications plan and audience touchpoints across social, website and event",
    },
    { label: "Team", value: "5" },
    { label: "Format", value: "Social-first campaign, 3 months, Facebook and website" },
    { label: "Tools", value: "Premiere Pro, After Effects, Photoshop" },
    { label: "Year", value: "2026" },
  ],
  brief: "[The brief in 2 or 3 sentences, Demi to provide]",
  decisions: [
    "[Creative decision 1: what was chosen and why, Demi to provide]",
    "[Creative decision 2: what was chosen and why, Demi to provide]",
    "[Creative decision 3: what was chosen and why, Demi to provide]",
  ],
  motionSlugs: ["nguyen-hue-ooh-spot", "registration-countdown"],
  keyVisuals: [
    image("kv/coming-soon.jpg", "Coming Soon", 2000, 2000),
    image("kv/hint-timeline.jpg", "Hint Timeline", 2000, 2000),
    image("kv/official-kv-galanight.jpg", "Gala Night key visual", 1735, 2048),
    image("kv/official-kv-ma26.jpg", "Official key visual", 1638, 2048),
  ],
  // Thứ tự tạm theo ngày in trên post, chờ Demi đối chiếu với fanpage.
  timeline: [
    image("kv/coming-soon.jpg", "Coming Soon (02.05)", 2000, 2000),
    image("kv/hint-timeline.jpg", "Hint Timeline", 2000, 2000),
    image("social/dac-quyen.jpg", "Registration Perks 72H"),
    image("kv/official-kv-ma26.jpg", "Official Key Visual", 1638, 2048),
    image("social/count-down.jpg", "Registration Countdown, 2 Days"),
    image("social/countdown-12h.jpg", "Registration Countdown, 12H", 2048, 2048),
    image("social/cd.jpg", "12H TikTok Challenge"),
    image("social/discover-mentors.jpg", "Discover Mentors"),
    image("social/gt-bcv.jpg", "Advisor introduction", 1000, 1000),
    image("social/gt-bgk.jpg", "Judge introduction"),
    image("social/gt-bgk-1.jpg", "Judge introduction"),
    image("social/official-declaration-round-01.jpg", "Round 1 Announcement", 1080, 1080),
    image("kv/official-kv-galanight.jpg", "Gala Night Key Visual", 1735, 2048),
    image("social/official-sold-out.jpg", "Sold Out"),
    image("social/check-in-photobooth.jpg", "Check-in Photobooth", 2000, 2000),
    image("social/count-down-48h.jpg", "Countdown 48H"),
  ],
  results: [
    { value: "2.4M", label: "Views" },
    { value: "37K+", label: "Interactions" },
    { value: "14.2K", label: "Link clicks" },
    { value: "7K+", label: "Website sessions in 3 months" },
  ],
  resultNote: "Exclusive OOH placement at Nguyen Hue pedestrian square, worth nearly US$1,000.",
  learned: "[First time I..., what I would do differently, Demi to provide]",
  nextSlug: "vfx-teaser",
};

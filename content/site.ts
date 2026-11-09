export const contact = {
  opening: "Open to Creative Video Editor / Creative Assistant roles.",
  email: "trangbr2006@gmail.com",
  linkedin: "https://www.linkedin.com/in/trang-phan-aba4a8319",
  /** Đường dẫn file CV trong public. Chưa có thì hiện ô ngoặc vuông. */
  cv: "",
  details: "Based in Ho Chi Minh City (GMT+7) · Open to remote · Available from Dec 2026",
};

/** Bốn nhịp kể chuyện trên cảnh 3D, mỗi nhịp đi với một chữ D, E, M, I. */
export const story = [
  { lead: "On the journey where the *wildest*\nideas redefine reality,", notes: [] },
  {
    label: "Craving",
    lead: "I create digital experiences where technology and creativity speak the same language.",
    notes: [],
  },
  { label: "Design", lead: "Beauty with a *purpose*.", notes: [], statement: true },
  {
    lead: "Designing, for me, is a chain of problem-solving around creating more value.",
    notes: ["I start with why, then design and build the rest."],
  },
];

/** Section mở ra sau cổng đá. */
export const gateIntro = {
  who: {
    title: "Who am I",
    lead: "I'm a Graphic Designer with skills in animation and AI-powered creative technologies.",
    skills: [
      { name: "Photoshop", mark: "Ps" },
      { name: "After Effects", mark: "Ae" },
      { name: "Premiere", mark: "Pr" },
      { name: "Blender", mark: "Bl" },
      { name: "HTML", mark: "</>" },
      { name: "JavaScript", mark: "JS" },
      { name: "C++", mark: "C++" },
    ],
  },
  what: {
    label: "What I do",
    lead: "I have 2 years of creative experience across visual design, video production, motion design, and interactive media.",
    action: { label: "More about me", href: "/about" },
    list: [
      "Event Campaign Key Visuals",
      "Social Media Campaign Assets",
      "Long-form & Short-form Video Editing",
      "Event Promo Films, Teasers & Trailers",
      "3D Modeling & Visual Effects (VFX)",
      "Motion Design & Animation",
      "AI-assisted Interactive Experiences",
    ],
  },
};

/**
 * TẠM: toàn bộ hình, tên và thông tin dưới đây là của emotion-agency.com, chép theo yêu cầu của Demi để dựng layout.
 * Không phải dự án của Demi. Phải thay hết và xóa public/media/temp-emotion trước khi công khai trang.
 */
const tempMedia = "/media/temp-emotion";
const tempSite = "https://emotion-agency.com/projects";

/** Bộ lọc Emotion của trang gallery, mỗi giá trị kèm màu neon. */
export const tempEmotions = {
  Fascination: "#d946ef",
  Confidence: "#2563eb",
  Excitement: "#f97316",
  Clarity: "#38bdf8",
  Curiosity: "#8b5cf6",
};

const web = (slug: string) => `${tempSite}/${slug}`;

export const tempProjects = [
  { name: "E Promo", video: `${tempMedia}/e-promo.mp4`, href: web("e-promo"), note: "Our vision of modern aesthetics and engineering.", emotion: "Fascination", created: "20.08.2024", type: "Website", scope: ["UI/UX", "Frontend", "WebGL"], stack: ["GSAP", "Nuxt 3", "Three.js"], shelf: true },
  { name: "Sofia Shcherbak", image: `${tempMedia}/sofia.webp`, href: web("sofia-shcherbak"), note: "A photographer's eye, translated into fluid motion.", emotion: "Fascination", created: "07.04.2024", type: "Website", scope: ["UI/UX", "Frontend", "WebGL"], stack: ["GSAP", "Nuxt 3", "Three.js", "Storyblok"], shelf: true },
  { name: "Flashform", video: `${tempMedia}/flshfrm.mp4`, href: web("flashform"), note: "A product story told entirely through its headlines.", emotion: "Clarity", created: "23.12.2024", type: "Website", scope: ["UI/UX", "Frontend", "WebGL"], stack: ["GSAP", "Nuxt 3", "Three.js"], shelf: true },
  { name: "Relive by Coco", image: `${tempMedia}/coco.webp`, href: web("relive-by-coco"), note: "An expressive digital storefront for a playful brand.", emotion: "Excitement", created: "20.03.2023", type: "Website", scope: ["UI/UX", "Frontend", "E-commerce"], stack: ["GSAP", "Nuxt 3", "Shopify", "Three.js"], shelf: true },
  { name: "smp fnnc.", image: `${tempMedia}/smp-fnnc.webp`, href: web("smp-fnnc"), note: "Turning financial chaos into a fast, understandable flow.", emotion: "Clarity", created: "18.02.2025", type: "Product", scope: ["UI/UX", "Frontend", "Backend"], stack: ["Nuxt 3", "Express.js"], shelf: true },
  { name: "Ksh Design", image: `${tempMedia}/ksh.webp`, href: web("ksh-design"), note: "An elegant, unhurried showcase for an interior studio.", emotion: "Fascination", created: "10.12.2021", type: "Website", scope: ["Frontend", "CMS"], stack: ["GSAP", "Nuxt 4", "Storyblok"], shelf: true },
  { name: "Techeters", image: `${tempMedia}/techeters.webp`, href: web("techeters"), note: "A premium tech-boutique feel in a crowded US market.", emotion: "Excitement", created: "29.11.2021", type: "Website", scope: ["UI/UX", "Frontend", "CMS"], stack: ["GSAP", "Nuxt 2", "WebGL", "Storyblok"] },
  { name: "Aura", image: `${tempMedia}/aura.webp`, href: web("aura"), note: "Shipping an MVP for a decentralized identity network.", emotion: "Curiosity", created: "20.03.2022", type: "Product", scope: ["Frontend", "Web3"], stack: ["Nuxt 2", "Three.js", "BrightID"], shelf: true },
  { name: "Kairos Capital", image: `${tempMedia}/kairos.webp`, href: web("kairos"), note: "A modern capital fund that truly looks the part.", emotion: "Confidence", created: "13.10.2023", type: "Website", scope: ["UI/UX", "Frontend", "CMS"], stack: ["GSAP", "Nuxt 3", "Storyblok"], shelf: true },
  { name: "AI Tools", image: `${tempMedia}/ai-tools.webp`, href: web("ai-tools"), note: "An early vision of what AI interfaces should feel like.", emotion: "Curiosity", created: "12.06.2023", type: "Website", scope: ["UI/UX", "Frontend"], stack: ["GSAP", "Nuxt 3"] },
  { name: "LuxStamp", image: `${tempMedia}/luxstamp.webp`, href: web("luxstamp"), note: "Turning an outdated site into an order-taking machine.", emotion: "Clarity", created: "17.11.2020", type: "Website", scope: ["UI/UX", "Frontend"], stack: ["GSAP", "React.js"] },
  { name: "Gamemarket", image: `${tempMedia}/gamemarket.webp`, href: web("gamemarket"), note: "The automated engine behind an app-aggregator platform.", emotion: "Clarity", created: "23.07.2026", type: "Product", scope: ["UI/UX", "Frontend", "Backend"], stack: ["Nuxt 4", "Express.js", "Nuxt UI"] },
  { name: "TK KTL", image: `${tempMedia}/ktl.webp`, href: web("ktl"), note: "A rail-freight B2B platform rebuilt to drive sales.", emotion: "Confidence", created: "20.07.2020", type: "Website", scope: ["UI/UX", "Frontend", "CMS"], stack: ["GSAP", "Highway.js", "WordPress"] },
  { name: "Safe Haven", image: `${tempMedia}/safe-haven.webp`, href: web("safe-haven"), note: "A financial platform as serious as the money it manages.", emotion: "Confidence", created: "22.06.2021", type: "Website", scope: ["UI/UX", "Frontend"], stack: ["GSAP", "Nuxt 2"] },
  { name: "Leonid Kostetskyi", image: `${tempMedia}/leonid-kostetskyi.webp`, href: web("leonid-kostetskyi"), note: "A masterclass in visual storytelling and independent engineering.", emotion: "Fascination", created: "03.09.2021", type: "Website", scope: ["UI/UX", "Frontend", "WebGL"], stack: ["GSAP", "Nuxt 2", "OGL"] },
  { name: "ICSMT™", image: `${tempMedia}/icsmt.webp`, href: web("icsmt"), note: "Where pastel meets brutalism for a barbering technique.", emotion: "Excitement", created: "26.09.2021", type: "Website", scope: ["UI/UX", "Frontend"], stack: ["GSAP", "Nuxt 2"] },
];

export const shelf = {
  title: ["Some", "Of my", "Projects"],
  note: "A selection of projects where design, technology, and strategy come together",
  action: { label: "View all projects", href: "/projects" },
  projects: tempProjects.filter((project) => project.shelf),
};

export const hero = {
  name: "Demi Phan",
  label: "Creative · Video Editor · Motion",
  intro: "I turn messages into rhythm, then use VFX and motion to push how far video can carry them.",
  /** Từ trong câu intro mà loader zoom xuyên qua. */
  cutWord: "rhythm",
  showreel: "/media/hero/showreel.mp4",
  loop: "/media/hero/loop.mp4",
  poster: "/media/hero/poster.jpg",
  duration: "01:29",
};

export const statement = {
  title: [
    { text: "I'm a creative video editor, 2 years in, working where " },
    { text: "rhythm", mark: "italic" },
    { text: " meets " },
    { text: "<code/>", mark: "code" },
    { text: ". I learn past what I thought I could do, then break each task down until the fastest route is clear." },
  ],
  highlights: [
    { value: "2", label: "Years of experience" },
    { value: "<>", label: "HTML", tool: true },
    { value: "Ae", label: "After Effects", tool: true },
    { value: "Cl", label: "Claude", tool: true },
    { value: "Ps", label: "Photoshop", tool: true },
    { value: "JS", label: "JavaScript", tool: true },
    { value: "Pr", label: "Premiere Pro", tool: true },
  ],
};

export const about = {
  statement: "I think a cut is a decision about what the viewer feels next.",
  bio: [
    "I study International Business Economics at Foreign Trade University in Ho Chi Minh City.",
    "I edit video and build motion and VFX for event campaigns and social content.",
    "[Sentence 3: how economics shapes my editing, Demi to confirm]",
  ],
  portrait: "/media/about/portrait.jpg",
  experience: [
    { when: "11/2024–08/2026", what: "Creatio. Creative Member. Marketing and creative club, 48K+ followers on Facebook" },
    { when: "10/2025–07/2026", what: "Marketing Arena 2026. Leader of Creative Communications" },
    { when: "11/2025–03/2026", what: "Ngoc Ho Medicare. Video Editor, remote, Washington D.C." },
  ],
  awards: [
    { when: "2026", what: "Semi-Finalist, TVCreate. Top 20 among 190+ participants" },
    { when: "2025", what: "Champion, INTERNALATIO hosted by Creatio" },
  ],
  capabilities: [
    { skill: "Video editing", slug: "top-4-reveal-film" },
    { skill: "Motion graphics", slug: "registration-countdown" },
    { skill: "VFX", slug: "nguyen-hue-ooh-spot" },
    { skill: "Visual design", slug: "key-visual-system" },
  ],
  tools: "Premiere Pro, After Effects, Photoshop, HTML, JavaScript, Claude",
  howIWork: "[3 lines: reading the brief, rough cut, taking feedback, Demi to provide]",
  remote: [
    { label: "Time zone", value: "GMT+7" },
    { label: "Available", value: "From Dec 2026" },
    { label: "English", value: "IELTS 7.0" },
  ],
};

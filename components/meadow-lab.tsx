"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gateIntro, shelf, story } from "@/content/site";
import { SERIF, canFollowPointer, gsap, prefersReducedMotion, ScrollTrigger, SplitText } from "@/lib/motion";

const GOLD = "#eaaa00";


/** Monogram chấm halftone, chữ được đục rỗng khỏi nền chấm. */
function SkillMark({ mark, id }: { mark: string; id: number }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-[64%] w-auto text-gold transition-colors duration-200 group-hover:text-[#16060f]">
      <defs>
        <pattern id={`skill-dot-${id}`} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="1.8" fill="currentColor" />
        </pattern>
        <mask id={`skill-cut-${id}`}>
          <rect width="64" height="64" rx="13" fill="#fff" />
          <text x="32" y="33" textAnchor="middle" dominantBaseline="central" fontWeight="700" fontSize={mark.length > 2 ? 27 : 40} fill="#000">
            {mark}
          </text>
        </mask>
      </defs>
      <rect width="64" height="64" fill={`url(#skill-dot-${id})`} mask={`url(#skill-cut-${id})`} />
    </svg>
  );
}

/** Dấu * bọc từ in nghiêng, xuống dòng chỉ áp dụng từ khổ desktop. */
function renderLead(lead: string) {
  return lead.split(/(\*[^*]+\*|\n)/).map((part, i) => {
    if (part === "\n") return <br key={i} className="hidden md:inline" />;
    return part.startsWith("*") ? <em key={i}>{part.slice(1, -1)}</em> : part;
  });
}

/** Mỗi nhịp đứng yên khi chữ đứng yên, nhịp cũ thoát trước rồi nhịp mới vào trong lúc chữ biến đổi. */
function buildStory(root: HTMLElement, ink: string, end: number) {
  const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", root);
  const timeline = gsap.timeline({ defaults: { ease: "none" } });

  beats.forEach((beat, i) => {
    const { chars } = new SplitText(beat.querySelector("[data-lead]"), { type: "words,chars", charsClass: "story-char" });
    const notes = beat.querySelectorAll("[data-note]");
    gsap.set(chars, { transformPerspective: 500, color: ink });

    if (i === 0) {
      // Câu đầu tự chạy khi vào trang, các câu sau chạy theo thanh cuộn.
      gsap.set(beat, { autoAlpha: 1 });
      gsap.from(chars, { yPercent: 110, rotationX: -80, opacity: 0, color: GOLD, duration: 0.9, ease: "expoOut", stagger: 0.016 });
    } else {
      timeline
        .set(beat, { autoAlpha: 1 }, i - 0.5)
        .fromTo(
          chars,
          { yPercent: 110, rotationX: -80, opacity: 0, color: GOLD },
          { yPercent: 0, rotationX: 0, opacity: 1, color: ink, duration: 0.2, stagger: { amount: 0.14 } },
          i - 0.48,
        );
      if (notes.length) timeline.fromTo(notes, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.14 }, i - 0.26);
    }
    if (notes.length) timeline.to(notes, { opacity: 0, duration: 0.06 }, i + 0.2);
    timeline
      .to(
        chars,
        { yPercent: -110, rotationX: 80, opacity: 0, color: GOLD, duration: 0.18, stagger: { amount: 0.1, from: "center" } },
        i + 0.2,
      )
      .set(beat, { autoAlpha: 0 }, i + 0.5);
  });
  // Timeline dài đúng cả hành trình để khớp với thanh cuộn và camera.
  timeline.set({}, {}, end);
  return timeline;
}

/** Chữ gần chuột nóng lên và nghiêng đi; chuột đi rồi thì nguội dần. */
function bindStoryHover(root: HTMLElement) {
  const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", root).map((beat) => ({
    beat,
    chars: gsap.utils.toArray<HTMLElement>(".story-char", beat).map((el) => ({
      el,
      heat: 0,
      skew: gsap.quickSetter(el, "skewX", "deg"),
    })),
  }));
  const mouse = { x: -9999, y: -9999, warm: false };
  const onMove = (event: PointerEvent) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.warm = true;
  };
  const tick = (_time: number, deltaMs: number) => {
    if (!mouse.warm) return;
    const delta = deltaMs / 1000;
    const reach = Math.max(innerWidth * 0.075, 70);
    let warm = false;
    for (const { beat, chars } of beats) {
      if (getComputedStyle(beat).visibility === "hidden") continue;
      for (const char of chars) {
        const box = char.el.getBoundingClientRect();
        const dx = box.left + box.width / 2 - mouse.x;
        const dy = box.top + box.height / 2 - mouse.y;
        const target = Math.exp(-(dx * dx + dy * dy) / (reach * reach));
        char.heat += (target - char.heat) * (1 - Math.exp(-delta * (target > char.heat ? 14 : 2.2)));
        if (char.heat < 0.002 && target < 0.002) char.heat = 0;
        else warm = true;
        char.el.style.setProperty("--heat", char.heat.toFixed(3));
        char.skew(-14 * char.heat);
      }
    }
    mouse.warm = warm || mouse.x > -9999;
  };
  addEventListener("pointermove", onMove, { passive: true });
  gsap.ticker.add(tick);
  return () => {
    removeEventListener("pointermove", onMove);
    gsap.ticker.remove(tick);
  };
}

/** Vừa qua cổng thì tiêu đề chạy ngay, các ô kỹ năng hiện lần lượt theo thứ tự ngẫu nhiên rồi lơ lửng. */
function buildWho(section: HTMLElement, ink: string) {
  const { chars } = new SplitText(section.querySelector("[data-who-title]"), { type: "words,chars" });
  const { words } = new SplitText(section.querySelector("[data-who-lead]"), { type: "words" });
  gsap.set(chars, { transformPerspective: 500 });
  gsap
    .timeline({ scrollTrigger: { trigger: section, start: "top 15%", toggleActions: "play none none reverse" } })
    .fromTo(
      chars,
      { yPercent: 110, rotationX: -80, opacity: 0, color: GOLD },
      { yPercent: 0, rotationX: 0, opacity: 1, color: ink, duration: 0.9, ease: "expoOut", stagger: 0.03 },
      0,
    )
    .fromTo(words, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: "expoOut", stagger: 0.02 }, 0.3)
    .fromTo(
      gsap.utils.toArray<HTMLElement>("[data-skill]", section),
      { autoAlpha: 0, scale: 0.92 },
      { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power2.out", stagger: { each: 0.3, from: "random" } },
      0.6,
    );
  // Hai nhịp lệch nhau theo trục x và y nên mỗi ô trôi một kiểu, không lặp đều.
  const scale = innerWidth < 768 ? 0.45 : 1; // Ô trên điện thoại xếp sát nhau, trôi xa sẽ chạm nhau.
  gsap.utils.toArray<HTMLElement>("[data-float]", section).forEach((tile) => {
    const drift = (axis: "x" | "y", reach: number) =>
      gsap.fromTo(
        tile,
        { [axis]: -reach * scale },
        { [axis]: reach * scale, duration: gsap.utils.random(2.6, 4.6), delay: -gsap.utils.random(0, 3), ease: "sine.inOut", repeat: -1, yoyo: true },
      );
    drift("y", gsap.utils.random(7, 13));
    drift("x", gsap.utils.random(3, 7));
  });
}

/** Kiểu emotion: chữ trái ghim lại, list chạy lên, dòng càng gần giữa càng sáng và ↳ thế chỗ số thứ tự. */
function buildWhat(rail: HTMLElement) {
  const { words } = new SplitText(rail.querySelector("[data-what-lead]"), { type: "words" });
  const list = rail.querySelector<HTMLElement>("ol")!;
  const arrow = rail.querySelector<HTMLElement>("[data-arrow]")!;
  const rows = gsap.utils.toArray<HTMLElement>("li", list);
  const numbers = rows.map((row) => row.firstElementChild as HTMLElement);
  const fill = (end: string) =>
    gsap.fromTo(words, { opacity: 0.16 }, {
      opacity: 1,
      ease: "none",
      stagger: 0.1,
      scrollTrigger: { trigger: rail, start: "top 70%", end, scrub: 0.4 },
    });

  const media = gsap.matchMedia();
  media.add("(min-width: 768px)", () => {
    rail.classList.add("is-rail");
    fill("top -45%");
    const step = () => rows[1].offsetTop - rows[0].offsetTop;
    const paint = () => {
      const y = Number(gsap.getProperty(list, "y"));
      const gap = step();
      const reach = innerHeight * 0.36;
      let nearest = 1;
      rows.forEach((row, i) => {
        const distance = Math.abs(y + i * gap) / reach;
        nearest = Math.min(nearest, distance);
        row.style.opacity = String(Math.max(0, 1 - distance) ** 1.2);
        numbers[i].style.opacity = String(gsap.utils.clamp(0, 1, (distance - 0.06) / 0.1));
      });
      arrow.style.opacity = String(gsap.utils.clamp(0, 1, 1 - (nearest - 0.08) / 0.1));
    };
    gsap.fromTo(
      list,
      { y: () => innerHeight * 0.56 },
      {
        y: () => -step() * (rows.length - 1),
        ease: "none",
        onUpdate: paint,
        scrollTrigger: { trigger: rail, start: "top top", end: "bottom bottom", scrub: 0.4, invalidateOnRefresh: true },
      },
    );
    paint();
    return () => {
      rail.classList.remove("is-rail");
      gsap.set([...rows, ...numbers], { clearProps: "opacity" });
    };
  });
  media.add("(max-width: 767px)", () => {
    fill("top 25%");
    gsap.fromTo(rows, { opacity: 0, y: 16 }, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "expoOut",
      stagger: 0.07,
      scrollTrigger: { trigger: list, start: "top 85%", toggleActions: "play none none reverse" },
    });
  });
  return () => media.revert();
}

/** Giữ section lại và đổi cuộn dọc thành chạy ngang. Không có class is-shelf thì dải vẫn tự vuốt ngang được. */
function buildShelf(section: HTMLElement) {
  const panel = section.querySelector<HTMLElement>("[data-shelf-panel]")!;
  const track = section.querySelector<HTMLElement>("[data-shelf-track]")!;
  const setBar = gsap.quickSetter(section.querySelector("[data-shelf-bar]"), "scaleX");
  section.classList.add("is-shelf");
  const distance = () => track.scrollWidth - innerWidth;

  const context = gsap.context(() => {
    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      onUpdate() {
        setBar(this.progress());
      },
      scrollTrigger: { trigger: panel, pin: true, start: "top top", end: () => `+=${distance()}`, scrub: 0.4, invalidateOnRefresh: true },
    });
    setBar(0);

    gsap.utils.toArray<HTMLElement>("[data-shelf-card]", track).forEach((card) => {
      gsap.fromTo(card.querySelector("[data-shelf-frame]"), { clipPath: "inset(100% 0% 0% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.9,
        ease: "expoOut",
        // Ô đã nằm sẵn trong màn hình lúc bắt đầu thì dải chưa chạy, nên phải kích hoạt theo cuộn dọc.
        scrollTrigger: card.offsetLeft < innerWidth * 0.92
          ? { trigger: panel, start: "top 55%", toggleActions: "play none none reverse" }
          : { trigger: card, containerAnimation: slide, start: "left 92%", toggleActions: "play none none reverse" },
      });
      // Ảnh trôi chậm hơn khung một chút để có chiều sâu khi chạy ngang.
      gsap.fromTo(card.querySelector("[data-shelf-media]"), { xPercent: -5 }, {
        xPercent: 5,
        ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: slide, start: "left right", end: "right left", scrub: true },
      });
    });

    gsap.utils.toArray<HTMLVideoElement>("video", track).forEach((video) => {
      ScrollTrigger.create({
        trigger: video,
        containerAnimation: slide,
        start: "left right",
        end: "right left",
        onToggle: ({ isActive }) => void (isActive ? video.play().catch(() => {}) : video.pause()),
      });
    });
  });

  // overflow: clip nên trình duyệt không tự cuộn tới link đang focus, phải đưa nó vào màn hình bằng cuộn dọc.
  const onFocus = (event: FocusEvent) => {
    const trigger = ScrollTrigger.getAll().find((item) => item.pin === panel);
    const card = (event.target as HTMLElement).closest<HTMLElement>("[data-shelf-card]");
    if (!trigger || !card) return;
    const x = card.offsetLeft - (innerWidth - card.offsetWidth) / 2;
    scrollTo(0, trigger.start + gsap.utils.clamp(0, trigger.end - trigger.start, x));
  };
  track.addEventListener("focusin", onFocus);

  return () => {
    track.removeEventListener("focusin", onFocus);
    context.revert();
    section.classList.remove("is-shelf");
  };
}

export function MeadowLab() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const after = useRef<HTMLElement>(null);
  const who = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const shelfRoot = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let dispose = () => {};
    let cancelled = false;

    Promise.all([import("@/lib/meadow-scene"), document.fonts.ready])
      .then(([{ autoQuality, createMeadow, JOURNEY_END }]) => {
        if (cancelled || !canvas.current || !root.current || !after.current || !who.current || !rail.current || !shelfRoot.current) return;
        const params = new URLSearchParams(location.search);
        const asked = params.get("q");
        const quality = asked === "low" || asked === "high" ? asked : autoQuality();
        const look = params.get("look") === "paper" ? "paper" : "night";
        const ink = look === "paper" ? "#16060f" : "#e5e4e2";
        const still = prefersReducedMotion();
        root.current.style.color = ink;
        // Nền section trùng màu lõi cổng nên không có vết cắt.
        if (look === "paper") {
          after.current.style.setProperty("--gate-bg", "#e5e4e2");
          after.current.style.setProperty("--gate-accent", "#3a0f34"); // Vàng chữ nhỏ không đọc được trên nền sáng.
          after.current.style.color = ink;
        }

        const meadow = createMeadow(canvas.current, quality, !still, look);
        const context = gsap.context(() => {
          const beats = gsap.utils.toArray<HTMLElement>("[data-beat]");
          if (still) gsap.set(beats[0], { autoAlpha: 1 });
          ScrollTrigger.create({
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
            animation: still ? undefined : buildStory(root.current!, ink, JOURNEY_END),
            onUpdate: ({ progress }) => {
              meadow.setJourney(progress * JOURNEY_END);
              if (still) beats.forEach((beat, i) => gsap.set(beat, { autoAlpha: Number(i === Math.round(progress * JOURNEY_END)) }));
            },
          });
          if (!still) buildWho(who.current!, ink);
        }, root);
        const unbindWhat = still ? () => {} : buildWhat(rail.current);
        // Tạo sau cùng để ScrollTrigger tính khoảng ghim theo đúng thứ tự trên trang.
        const unbindShelf = still ? () => {} : buildShelf(shelfRoot.current);
        const unbindHover = !still && canFollowPointer() ? bindStoryHover(root.current) : () => {};
        dispose = () => {
          unbindHover();
          unbindShelf();
          unbindWhat();
          context.revert();
          meadow.dispose();
        };
      })
      .catch(() => setFailed(true)); // Không có WebGL thì giữ nền màu tĩnh, chữ vẫn đọc được.

    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  return (
    <>
    {/* Mỗi đơn vị hành trình dài khoảng 133vh, cộng 100vh của màn hình. */}
    <div ref={root} className="relative h-[927vh] text-[#e5e4e2]">
      <div className="fixed inset-0 -z-10 bg-[#3a0f34]">
        {!failed && <canvas ref={canvas} aria-hidden="true" className="block h-full w-full" />}
      </div>
      {story.map((beat, i) => {
        const Heading = i ? "h2" : "h1";
        return (
        <section
          key={beat.lead}
          data-beat
          className={`pointer-events-none fixed inset-x-0 top-20 z-10 px-6 md:px-12 ${
            i ? "md:top-0 md:flex md:h-[62vh] md:flex-col md:justify-center" : "md:top-auto md:bottom-10"
          } ${i === 1 ? "md:items-end md:text-right" : ""} ${i || !failed ? "invisible" : ""}`}
        >
          {beat.label && <p data-note className="mb-3 font-mono text-xs uppercase tracking-widest">{beat.label}</p>}
          <Heading
            data-lead
            className={`${SERIF} ${
              !i
                ? "text-[clamp(2.7rem,6.4vw,7.5rem)] leading-[.98]"
                : beat.statement
                  ? "max-w-[10ch] text-[clamp(3.2rem,6.4vw,7.5rem)] leading-[.98]"
                  : "max-w-[17ch] text-[clamp(2.1rem,3.7vw,4.2rem)] leading-[1.04] md:max-w-[27vw]"
            }`}
          >
            {renderLead(beat.lead)}
          </Heading>
          {beat.notes.map((note) => (
            <p key={note} data-note className="mt-4 max-w-[38ch] font-mono text-sm leading-relaxed">
              {note}
            </p>
          ))}
        </section>
        );
      })}
    </div>
    {/* Đè lên 100vh cuối của hành trình và để trong suốt, nên khi lõi cổng phủ kín thì phần này đã nằm đúng giữa màn hình. */}
    <section ref={after} className="relative z-20 -mt-[100vh] text-[#e5e4e2] [--gate-accent:#eaaa00] [--gate-bg:#16060f] motion-reduce:mt-0 motion-reduce:bg-[var(--gate-bg)]">
      <div ref={who} className="md:h-[170vh]">
        <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-28 text-center md:sticky md:top-0 md:h-screen md:py-0">
          <h2 data-who-title className={`${SERIF} text-[clamp(3.2rem,6.4vw,7.5rem)] leading-[.98]`}>{gateIntro.who.title}</h2>
          <p data-who-lead className={`${SERIF} mt-6 max-w-[26ch] text-[clamp(1.5rem,2.4vw,2.7rem)] leading-[1.14] md:max-w-[38vw]`}>
            {gateIntro.who.lead}
          </p>
          <ul aria-label="Tools" className="skill-board mt-12 flex w-full flex-wrap justify-center gap-4 md:mt-0">
            {gateIntro.who.skills.map((skill, i) => (
              <li key={skill.name} data-skill className="skill-slot">
                <div data-float className="skill-tile group">
                  <span className="relative text-right font-mono text-[clamp(.58rem,.82vw,.78rem)] font-medium uppercase leading-[1.15] tracking-widest">
                    {skill.name}
                  </span>
                  <SkillMark mark={skill.mark} id={i} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div ref={rail} className="relative bg-[var(--gate-bg)]">
        <div data-rail-panel className="grid min-h-screen gap-16 px-6 py-28 md:grid-cols-2 md:px-12">
          <div>
            <h2 className="mb-6 font-mono text-xs font-normal uppercase leading-normal tracking-widest text-[var(--gate-accent)]">{gateIntro.what.label}</h2>
            <p data-what-lead className={`${SERIF} max-w-[24ch] text-[clamp(2.1rem,3.7vw,4.2rem)] leading-[1.06]`}>{gateIntro.what.lead}</p>
            <Link href={gateIntro.what.action.href} className="mt-10 inline-block font-mono text-sm uppercase tracking-widest underline underline-offset-4">
              {gateIntro.what.action.label}
            </Link>
          </div>
          <div data-rail-list className="relative self-end text-[clamp(1.1rem,1.9vw,1.9rem)] leading-[1.9]">
            <span data-arrow aria-hidden="true" className="absolute left-0 top-0 hidden font-mono text-[var(--gate-accent)]">↳</span>
            <ol>
              {gateIntro.what.list.map((item, i) => (
                <li key={item} className="flex items-baseline justify-between gap-6 text-right">
                  <span className="font-mono text-xs">({String(i + 1).padStart(3, "0")})</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <div ref={shelfRoot} className="relative bg-[var(--gate-bg)]">
        <div data-shelf-panel className="shelf-panel relative">
          <ul data-shelf-track className="shelf-track">
            <li className="shelf-intro">
              <h2 className={`${SERIF} text-[min(11vw,21vh)] uppercase leading-[.96] max-md:text-[min(19vw,17vh)]`}>
                {shelf.title[0]}
                <span className="block normal-case italic">
                  {shelf.title[1]} <span aria-hidden="true" className="shelf-arrow">⟶</span>
                </span>
                {shelf.title[2]}
              </h2>
              <p className="mt-8 max-w-[34ch] font-mono text-xs font-medium uppercase leading-snug">{shelf.note}</p>
            </li>
            {shelf.projects.map((project, i) => (
              <li key={project.name} data-shelf-card className="shelf-card">
                <a href={project.href} target="_blank" rel="noreferrer" className="group block">
                  <div data-shelf-frame className="shelf-frame">
                    <div data-shelf-media className="absolute inset-y-0 -left-[6%] w-[112%] transition-transform duration-500 group-hover:scale-105">
                      {project.video ? (
                        <video src={project.video} muted loop playsInline preload="metadata" aria-hidden="true" className="h-full w-full object-cover" />
                      ) : (
                        <Image src={project.image!} alt="" fill sizes="(max-width: 767px) 78vw, 40vw" className="object-cover" />
                      )}
                    </div>
                    <dl className="shelf-spec">
                      <div><dt>Prjct</dt><dd>/{String(i + 1).padStart(2, "0")}</dd></div>
                      <div><dt>Created at</dt><dd>{project.created}</dd></div>
                      <div><dt>Name</dt><dd>{project.name}</dd></div>
                      <div><dt>Type</dt><dd>{project.type}</dd></div>
                      <div><dt>Scope</dt><dd>{project.scope.join(", ")}</dd></div>
                      <div><dt>Stack</dt><dd>{project.stack.join(", ")}</dd></div>
                    </dl>
                  </div>
                  <p className="mt-3 font-mono text-[.68rem] font-medium uppercase tracking-wide">{project.scope.join(" / ")}</p>
                  <h3 className={`${SERIF} mt-1 text-[clamp(1.5rem,2.2vw,2.2rem)] leading-[1.1]`}>
                    <span aria-hidden="true" className="mr-2 inline-block max-w-0 overflow-hidden align-bottom text-[var(--gate-accent)] transition-[max-width] duration-300 group-hover:max-w-8 group-focus-visible:max-w-8">↳</span>
                    {project.name}
                  </h3>
                </a>
              </li>
            ))}
            <li className="shelf-end">
              <Link href={shelf.action.href} className={`${SERIF} text-[clamp(2.1rem,3.7vw,4.2rem)] leading-[1.06] underline decoration-1 underline-offset-8`}>
                {shelf.action.label}
              </Link>
            </li>
          </ul>
          <div aria-hidden="true" className="absolute inset-x-6 bottom-6 hidden h-px bg-current/20 md:inset-x-12 in-[.is-shelf]:block">
            <div data-shelf-bar className="h-full origin-left bg-[var(--gate-accent)]" />
          </div>
        </div>
      </div>
    </section>
    </>
  );
}

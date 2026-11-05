"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gateIntro, story } from "@/content/site";
import { canFollowPointer, gsap, prefersReducedMotion, ScrollTrigger, SplitText } from "@/lib/motion";

const GOLD = "#eaaa00";

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

export function MeadowLab() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const after = useRef<HTMLElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let dispose = () => {};
    let cancelled = false;

    Promise.all([import("@/lib/meadow-scene"), document.fonts.ready])
      .then(([{ autoQuality, createMeadow, JOURNEY_END }]) => {
        if (cancelled || !canvas.current || !root.current || !after.current) return;
        const params = new URLSearchParams(location.search);
        const asked = params.get("q");
        const quality = asked === "low" || asked === "high" ? asked : autoQuality();
        const look = params.get("look") === "paper" ? "paper" : "night";
        const ink = look === "paper" ? "#16060f" : "#e5e4e2";
        const still = prefersReducedMotion();
        root.current.style.color = ink;
        // Nền section trùng màu lõi cổng nên không có vết cắt.
        if (look === "paper") {
          after.current.style.background = "#e5e4e2";
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
          if (!still) {
            const { words } = new SplitText(after.current!.querySelector("[data-reveal]"), { type: "words" });
            gsap.fromTo(words, { opacity: 0.16 }, {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              scrollTrigger: { trigger: after.current, start: "top 75%", end: "top 15%", scrub: 0.4 },
            });
          }
        }, root);
        const unbindHover = !still && canFollowPointer() ? bindStoryHover(root.current) : () => {};
        dispose = () => {
          unbindHover();
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
      <div className="fixed inset-0 bg-[#3a0f34]">
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
            className={`font-[family-name:var(--font-instrument-serif)] ${
              i
                ? "max-w-[17ch] text-[clamp(2.1rem,3.7vw,4.2rem)] leading-[1.04] md:max-w-[27vw]"
                : "text-[clamp(2.7rem,6.4vw,7.5rem)] leading-[.98] tracking-[-0.02em]"
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
    <section ref={after} className="relative z-20 grid min-h-screen gap-16 bg-[#16060f] px-6 py-28 text-[#e5e4e2] md:grid-cols-2 md:px-12">
      <div>
        <p className="mb-6 font-mono text-xs uppercase tracking-widest text-gold">{gateIntro.label}</p>
        <h2 data-reveal className="max-w-[24ch] font-[family-name:var(--font-instrument-serif)] text-[clamp(2.1rem,3.7vw,4.2rem)] leading-[1.06]">
          {gateIntro.lead}
        </h2>
        <Link href={gateIntro.action.href} className="mt-10 inline-block font-mono text-sm uppercase tracking-widest underline underline-offset-4">
          {gateIntro.action.label}
        </Link>
      </div>
      <ol className="self-end text-right text-[clamp(1.1rem,1.7vw,1.6rem)] leading-[1.9]">
        {gateIntro.list.map((item, i) => (
          <li key={item} className="flex items-baseline justify-between gap-6">
            <span className="font-mono text-xs">{String(i + 1).padStart(3, "0")}</span>
            {item}
          </li>
        ))}
      </ol>
    </section>
    </>
  );
}

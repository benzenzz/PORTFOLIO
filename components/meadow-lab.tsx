"use client";

import { useEffect, useRef, useState } from "react";
import { story } from "@/content/site";
import { gsap, prefersReducedMotion, ScrollTrigger, SplitText } from "@/lib/motion";

const GOLD = "#eaaa00";
const SHUTTER = "blur(7px)";

/** Mỗi nhịp đứng yên khi chữ đứng yên, nhịp cũ thoát trước rồi nhịp mới vào trong lúc chữ biến đổi. */
function buildStory(root: HTMLElement, ink: string) {
  const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", root);
  const timeline = gsap.timeline({ defaults: { ease: "none" } });

  beats.forEach((beat, i) => {
    const { chars } = new SplitText(beat.querySelector("[data-lead]"), { type: "words,chars" });
    const notes = beat.querySelectorAll("[data-note]");
    gsap.set(chars, { transformPerspective: 500, color: ink });

    if (i > 0) {
      timeline
        .set(beat, { autoAlpha: 1 }, i - 0.5)
        .fromTo(beat, { filter: SHUTTER }, { filter: "blur(0px)", duration: 0.3 }, i - 0.48)
        .fromTo(
          chars,
          { yPercent: 110, rotationX: -80, opacity: 0, color: GOLD },
          { yPercent: 0, rotationX: 0, opacity: 1, color: ink, duration: 0.2, stagger: { amount: 0.14 } },
          i - 0.48,
        )
        .fromTo(notes, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.14 }, i - 0.26);
    }
    if (i < beats.length - 1) {
      timeline
        .to(notes, { opacity: 0, duration: 0.06 }, i + 0.2)
        .to(beat, { filter: SHUTTER, duration: 0.2 }, i + 0.22)
        .to(
          chars,
          { yPercent: -110, rotationX: 80, opacity: 0, color: GOLD, duration: 0.18, stagger: { amount: 0.1, from: "center" } },
          i + 0.2,
        )
        .set(beat, { autoAlpha: 0 }, i + 0.5);
    }
  });
  // Giữ độ dài đúng 3 đơn vị để timeline khớp với thanh cuộn và chữ cube.
  timeline.set({}, {}, 3);
  return timeline;
}

export function MeadowLab() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let dispose = () => {};
    let cancelled = false;

    Promise.all([import("@/lib/meadow-scene"), document.fonts.ready])
      .then(([{ autoQuality, createMeadow }]) => {
        if (cancelled || !canvas.current || !root.current) return;
        const params = new URLSearchParams(location.search);
        const asked = params.get("q");
        const quality = asked === "low" || asked === "high" ? asked : autoQuality();
        const look = params.get("look") === "paper" ? "paper" : "night";
        const ink = look === "paper" ? "#16060f" : "#e5e4e2";
        const still = prefersReducedMotion();
        root.current.style.color = ink;

        const meadow = createMeadow(canvas.current, quality, !still, look);
        const context = gsap.context(() => {
          const beats = gsap.utils.toArray<HTMLElement>("[data-beat]");
          ScrollTrigger.create({
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
            animation: still ? undefined : buildStory(root.current!, ink),
            onUpdate: ({ progress }) => {
              meadow.setMorph(progress * 3);
              if (still) beats.forEach((beat, i) => gsap.set(beat, { autoAlpha: Number(i === Math.round(progress * 3)) }));
            },
          });
        }, root);
        dispose = () => {
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
    <div ref={root} className="relative h-[500vh] text-[#e5e4e2]">
      <div className="fixed inset-0 bg-[#3a0f34]">
        {!failed && <canvas ref={canvas} aria-hidden="true" className="block h-full w-full" />}
      </div>
      {story.map((beat, i) => (
        <section
          key={beat.lead}
          data-beat
          className={`pointer-events-none fixed inset-x-0 top-20 z-10 px-6 md:top-0 md:flex md:h-[62vh] md:flex-col md:justify-center md:px-12 ${
            i % 2 ? "md:items-end md:text-right" : ""
          } ${i ? "invisible" : ""}`}
        >
          {beat.label && <p className="mb-3 font-mono text-xs uppercase tracking-widest">{beat.label}</p>}
          <h2
            data-lead
            className="max-w-[17ch] font-[family-name:var(--font-instrument-serif)] text-[clamp(2.1rem,3.7vw,4.2rem)] leading-[1.04] md:max-w-[27vw]"
          >
            {beat.lead}
          </h2>
          {beat.notes.map((note) => (
            <p key={note} data-note className="mt-4 max-w-[38ch] font-mono text-sm leading-relaxed">
              {note}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}

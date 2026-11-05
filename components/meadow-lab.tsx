"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion, ScrollTrigger } from "@/lib/motion";

const STOPS = [
  { letter: "D", word: "Design" },
  { letter: "E", word: "Emotion" },
  { letter: "M", word: "Multi" },
  { letter: "I", word: "Me" },
];

export function MeadowLab() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const [stop, setStop] = useState(0);

  useEffect(() => {
    let dispose = () => {};
    let cancelled = false;

    import("@/lib/meadow-scene")
      .then(({ autoQuality, createMeadow }) => {
        if (cancelled || !canvas.current) return;
        const params = new URLSearchParams(location.search);
        const asked = params.get("q");
        const quality = asked === "low" || asked === "high" ? asked : autoQuality();
        const look = params.get("look") === "night" ? "night" : "paper";
        const meadow = createMeadow(canvas.current, quality, !prefersReducedMotion(), look);
        const trigger = ScrollTrigger.create({
          trigger: "#meadow-lab",
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: ({ progress }) => {
            meadow.setMorph(progress * 3);
            setStop(Math.round(progress * 3));
          },
        });
        dispose = () => {
          trigger.kill();
          meadow.dispose();
        };
      })
      .catch(() => setFailed(true)); // Không có WebGL thì giữ nền màu tĩnh.

    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  return (
    <div id="meadow-lab" className="relative h-[500vh]">
      <div className="fixed inset-0 bg-[linear-gradient(#12040f,#3a0f34_62%,#7a5fa8)]">
        {!failed && <canvas ref={canvas} aria-hidden="true" className="block h-full w-full" />}
      </div>
      <p className="fixed bottom-6 left-6 z-10 font-mono text-sm text-[#e5e4e2] mix-blend-difference">
        {STOPS[stop].letter} — {STOPS[stop].word}
      </p>
    </div>
  );
}

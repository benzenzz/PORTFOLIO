"use client";

import Image from "next/image";
import { useRef } from "react";
import { hero } from "@/content/site";
import {
  addWipe,
  canFollowPointer,
  gsap,
  prefersReducedMotion,
  scramble,
  ScrollTrigger,
  splitWipe,
  SplitText,
  useGSAP,
  wipeSingle,
} from "@/lib/motion";

const corners = [
  { className: "top-0 left-0 border-t border-l", x: 24, y: 24 },
  { className: "top-0 right-0 border-t border-r", x: -24, y: 24 },
  { className: "bottom-0 left-0 border-b border-l", x: 24, y: -24 },
  { className: "bottom-0 right-0 border-b border-r", x: -24, y: -24 },
];

const PARALLAX_SCALE = 1.12;
const LETTER_SHIFT = 6; // px, chữ to 9rem nên nhích hơn mức 4px của AUGE mới thấy.
const LETTER_FOLLOW = 0.86;

/** Chữ né con trỏ: lực giảm dần theo cos trong bán kính bằng 2.4 lần bề ngang ký tự. */
function letterPush(chars: HTMLElement[]) {
  let centers: { x: number; y: number }[] = [];
  let radius = 0;
  const current = chars.map(() => 0);
  const target = chars.map(() => 0);
  let ticking = false;

  const measure = () => {
    centers = chars.map((char) => {
      const rect = char.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    const total = chars.reduce((sum, char) => sum + char.offsetWidth, 0);
    radius = (total / chars.length) * 2.4;
  };

  const tick = () => {
    const ease = 1 - LETTER_FOLLOW ** gsap.ticker.deltaRatio(60);
    let moving = false;
    chars.forEach((char, index) => {
      const gap = target[index] - current[index];
      current[index] = Math.abs(gap) < 0.05 ? target[index] : current[index] + gap * ease;
      moving ||= Math.abs(gap) >= 0.05;
      char.style.transform = `translate3d(${current[index].toFixed(2)}px, 0, 0)`;
    });
    if (!moving) {
      gsap.ticker.remove(tick);
      ticking = false;
    }
  };

  const wake = () => {
    if (ticking) return;
    ticking = true;
    gsap.ticker.add(tick);
  };

  const onMove = (event: PointerEvent) => {
    if (!centers.length) measure();
    centers.forEach(({ x, y }, index) => {
      const dx = x - event.clientX;
      const dy = y - event.clientY;
      const distance = Math.hypot(dx, dy);
      target[index] =
        distance >= radius || distance === 0
          ? 0
          : LETTER_SHIFT * 0.5 * (1 + Math.cos((Math.PI * distance) / radius)) * (dx / distance);
    });
    wake();
  };
  const onResize = () => {
    centers = [];
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("resize", onResize);
    gsap.ticker.remove(tick);
  };
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const loop = useRef<HTMLVideoElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const reel = useRef<HTMLVideoElement>(null);
  const name = useRef<HTMLHeadingElement>(null);
  const nameMask = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const labelBox = useRef<HTMLParagraphElement>(null);
  const intro = useRef<HTMLParagraphElement>(null);
  const card = useRef<HTMLButtonElement>(null);
  const cardLabel = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const html = document.documentElement;
      const video = loop.current;
      if (prefersReducedMotion() || !video) return;

      const play = () => video.play().catch(() => {}); // Bị chặn tự chạy thì poster vẫn hiện.

      const nameSplit = name.current
        ? new SplitText(name.current, { type: "chars", charsClass: "inline-block" })
        : null;
      const chars = (nameSplit?.chars ?? []) as HTMLElement[];

      const introWipe = intro.current ? splitWipe(intro.current) : null;
      const labelLine = labelBox.current ? wipeSingle(labelBox.current) : null;

      const reveal = gsap.timeline({
        paused: true,
        onComplete: () => introWipe?.split.revert(),
      });
      reveal.fromTo(
        ".hero-corner",
        { x: (index) => corners[index].x, y: (index) => corners[index].y, autoAlpha: 0 },
        { x: 0, y: 0, autoAlpha: 1, duration: 0.7, ease: "expoOut" },
        0,
      );
      reveal.fromTo(chars, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.34);
      if (nameMask.current) {
        reveal
          .fromTo(
            nameMask.current,
            { scaleX: 0 },
            { scaleX: 1, transformOrigin: "right center", duration: 0.34, ease: "wipeFill" },
            0,
          )
          .to(nameMask.current, { scaleX: 0, transformOrigin: "left center", duration: 0.46, ease: "wipeReveal" }, 0.34);
      }
      if (labelLine) addWipe(reveal, [labelLine], 0.25, { fill: 0.24, reveal: 0.28, stagger: 0 });
      if (introWipe) addWipe(reveal, introWipe.lines, 0.3, { fill: 0.24, reveal: 0.28, stagger: 0.05 });
      reveal.call(() => label.current && scramble(label.current, 0), undefined, 0.5);
      reveal.fromTo(card.current, { yPercent: 120 }, { yPercent: 0, duration: 1.1, ease: "panelSlide" }, 0.35);
      reveal.fromTo(".hero-tick", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "expoOut" }, 0.2);

      html.classList.remove("hero-pending");

      const waitingForIntro = html.classList.contains("intro-pending");
      if (waitingForIntro) {
        document.addEventListener("intro-exit", play, { once: true });
        document.addEventListener("intro-reveal", () => reveal.play(), { once: true });
      } else {
        play();
        reveal.play();
      }

      // Work trượt đè lên hero thì video không cần chạy nữa.
      const work = document.getElementById("work");
      const covered = work
        ? ScrollTrigger.create({
            trigger: work,
            start: "top top",
            onEnter: () => video.pause(),
            onLeaveBack: () => play(),
          })
        : null;

      let cleanupPointer = () => {};
      if (canFollowPointer()) {
        gsap.set(video, { scale: PARALLAX_SCALE });
        const moveX = gsap.quickTo(video, "x", { duration: 0.66, ease: "power2.out" });
        const moveY = gsap.quickTo(video, "y", { duration: 0.66, ease: "power2.out" });
        const onMove = (event: PointerEvent) => {
          const { innerWidth: width, innerHeight: height } = window;
          moveX(((event.clientX / width) * 2 - 1) * Math.min(72, width * 0.05));
          moveY(((event.clientY / height) * 2 - 1) * Math.min(48, height * 0.05));
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        const stopPush = letterPush(chars);
        cleanupPointer = () => {
          window.removeEventListener("pointermove", onMove);
          stopPush();
        };
      }

      return () => {
        document.removeEventListener("intro-exit", play);
        covered?.kill();
        cleanupPointer();
      };
    },
    { scope: root },
  );

  function openReel() {
    dialog.current?.showModal();
    reel.current?.play().catch(() => {});
  }

  return (
    <section
      ref={root}
      aria-label="Introduction"
      className="surface-dark sticky top-0 isolate h-svh overflow-hidden"
    >
      <video
        ref={loop}
        src={hero.loop}
        poster={hero.poster}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      {/* Tối đều 30% để video không rơi vào vùng xám giữa, nơi chữ difference mất tương phản. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/30" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-ink/70 to-transparent" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-transparent to-transparent md:bg-gradient-to-tr md:from-ink/75"
      />

      <div className="absolute inset-0 flex items-center justify-center px-4 mix-blend-difference">
        <div className="relative px-[clamp(1.5rem,4vw,3rem)] py-[clamp(2rem,6vw,4rem)] text-white">
          {corners.map((corner) => (
            <span
              key={corner.className}
              aria-hidden="true"
              className={`hero-corner hero-reveal absolute size-3.5 ${corner.className}`}
            />
          ))}
          <div className="relative">
            <h1 ref={name} className="display-xl text-center whitespace-nowrap">
              {hero.name}
            </h1>
            <span ref={nameMask} aria-hidden="true" className="absolute inset-0 scale-x-0 bg-white" />
          </div>
        </div>
      </div>

      <span aria-hidden="true" className="hero-tick absolute top-1/2 left-4 h-px w-3.5 origin-left bg-white mix-blend-difference md:left-8" />
      <span aria-hidden="true" className="hero-tick absolute top-1/2 right-4 h-px w-3.5 origin-right bg-white mix-blend-difference md:right-8" />

      <div className="shell absolute inset-x-0 bottom-0 flex flex-col gap-3 pb-4 md:flex-row md:items-end md:justify-between md:gap-8 md:pb-8">
        <div className="max-w-md">
          <p ref={labelBox} className="hero-reveal label w-fit">
            <span aria-hidden="true" className="text-red">■ </span>
            <span ref={label}>{hero.label}</span>
          </p>
          <p ref={intro} className="hero-reveal mt-2 font-mono text-sm">
            {hero.intro}
          </p>
        </div>

        <button
          ref={card}
          type="button"
          onClick={openReel}
          onPointerEnter={() => cardLabel.current && scramble(cardLabel.current)}
          data-cursor="Play"
          className="showreel-card hero-reveal flex shrink-0 items-center gap-3 bg-ink p-1.5 pr-5 text-left transition-colors duration-[var(--dur-fast)] hover:bg-paper hover:text-ink"
        >
          <span className="relative block aspect-video w-24 overflow-hidden md:w-28">
            <Image src={hero.poster} alt="" fill sizes="7rem" className="showreel-thumb object-cover" />
            <span aria-hidden="true" className="showreel-grid absolute inset-0" />
          </span>
          <span>
            <span ref={cardLabel} className="label block">
              Play showreel
            </span>
            <span className="label-sm mt-1 block opacity-80">{hero.duration} · Sound on</span>
          </span>
        </button>
      </div>

      <dialog
        ref={dialog}
        aria-label="Showreel"
        onClose={() => reel.current?.pause()}
        className="surface-dark m-auto w-full max-w-6xl bg-ink backdrop:bg-ink/90"
      >
        <div className="flex justify-end p-2">
          <button type="button" onClick={() => dialog.current?.close()} className="label px-2 py-2" autoFocus>
            <span aria-hidden="true">■ </span>Close
          </button>
        </div>
        <video
          ref={reel}
          src={hero.showreel}
          poster={hero.poster}
          controls
          playsInline
          preload="none"
          className="aspect-video w-full"
        />
      </dialog>
    </section>
  );
}

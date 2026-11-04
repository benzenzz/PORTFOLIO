"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { hero } from "@/content/site";

const corners = [
  "top-0 left-0 border-t border-l",
  "top-0 right-0 border-t border-r",
  "bottom-0 left-0 border-b border-l",
  "bottom-0 right-0 border-b border-r",
];

export function Hero() {
  const loop = useRef<HTMLVideoElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const reel = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    loop.current?.play().catch(() => {}); // Trình duyệt chặn tự chạy thì poster vẫn hiện.
  }, []);

  function openReel() {
    dialog.current?.showModal();
    reel.current?.play().catch(() => {});
  }

  return (
    <section aria-label="Introduction" className="surface-dark relative isolate h-svh overflow-hidden">
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
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-tr from-ink/75 via-transparent to-transparent"
      />

      <div className="absolute inset-0 flex items-center justify-center px-4 mix-blend-difference">
        <div className="relative px-[clamp(1.5rem,4vw,3rem)] py-[clamp(2rem,6vw,4rem)] text-white">
          {corners.map((corner) => (
            <span key={corner} aria-hidden="true" className={`absolute size-3.5 ${corner}`} />
          ))}
          <h1 className="display-xl text-center whitespace-nowrap">{hero.name}</h1>
        </div>
      </div>

      <span aria-hidden="true" className="absolute top-1/2 left-4 h-px w-3.5 bg-white mix-blend-difference md:left-8" />
      <span aria-hidden="true" className="absolute top-1/2 right-4 h-px w-3.5 bg-white mix-blend-difference md:right-8" />

      <div className="shell absolute inset-x-0 bottom-0 flex flex-col gap-3 pb-4 md:flex-row md:items-end md:justify-between md:gap-8 md:pb-8">
        <div className="max-w-md">
          <p className="label">
            <span aria-hidden="true" className="text-red">■ </span>
            {hero.label}
          </p>
          <p className="mt-2 font-mono text-sm">{hero.intro}</p>
        </div>

        <button
          type="button"
          onClick={openReel}
          className="flex shrink-0 items-center gap-3 bg-ink p-1.5 pr-5 text-left transition-colors duration-[var(--dur-fast)] hover:bg-paper hover:text-ink"
        >
          <span className="relative block aspect-video w-24 overflow-hidden md:w-28">
            <Image src={hero.poster} alt="" fill sizes="7rem" className="object-cover" />
          </span>
          <span>
            <span className="label block">Play showreel</span>
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

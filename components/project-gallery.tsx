"use client";

import Image from "next/image";
import { type KeyboardEvent, type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { tempEmotions, tempProjects } from "@/content/site";
import { canFollowPointer, prefersReducedMotion, ScrollTrigger, SERIF } from "@/lib/motion";

type Project = (typeof tempProjects)[number];
type Filter = { kind: "emotion" | "scope"; value: string } | null;
type Scene = ReturnType<typeof import("@/lib/gallery-scene").createGallery>;

const FILTER_ID = "gallery-filter";
const DRAG_THRESHOLD = 6;
/** Bao nhiêu pixel kéo ngang thì tương đương một project. */
const DRAG_PER_PROJECT = 260;

const accentOf = (project: Project) => tempEmotions[project.emotion as keyof typeof tempEmotions];
const pad = (value: number) => String(value).padStart(2, "0");
const scopes = [...new Set(tempProjects.flatMap((project) => project.scope))];
const matches = (project: Project, filter: Filter) =>
  !filter || (filter.kind === "emotion" ? project.emotion === filter.value : project.scope.includes(filter.value));

/** Cuộn đều nhưng vòng dừng lại một nhịp ở mỗi project thay vì trôi liên tục. */
const settle = (value: number) => {
  const whole = Math.floor(value);
  const t = Math.min(Math.max((value - whole - 0.18) / 0.64, 0), 1);
  return whole + t * t * (3 - 2 * t);
};

function ProjectGrid({ list }: { list: Project[] }) {
  return (
    <ol className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
      {list.map((project) => (
        <li key={project.name}>
          <a href={project.href} target="_blank" rel="noreferrer" className="block">
            <span className="relative block aspect-[640/787] overflow-hidden bg-white/5">
              {project.video ? (
                <video src={project.video} muted playsInline preload="metadata" aria-hidden="true" className="h-full w-full object-cover" />
              ) : (
                <Image src={project.image!} alt="" fill sizes="(max-width: 767px) 50vw, 25vw" className="object-cover" />
              )}
            </span>
            <span className={`${SERIF} mt-3 block text-2xl`}>{project.name}</span>
            <span className="mt-1 block font-mono text-xs uppercase leading-snug">{project.note}</span>
            <span className="mt-2 block font-mono text-xs uppercase text-white/70">
              {project.created} / {project.scope.join(", ")}
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export function ProjectGallery() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const popover = useRef<HTMLDivElement>(null);
  const scene = useRef<Scene>(null);
  const trigger = useRef<ScrollTrigger>(null);
  const drag = useRef<{ x: number; scroll: number; moved: boolean } | null>(null);

  const [mode, setMode] = useState<"pending" | "scene" | "grid">("pending");
  const [filter, setFilter] = useState<Filter>(null);
  const [slot, setSlot] = useState(0);
  const list = useMemo(() => tempProjects.filter((project) => matches(project, filter)), [filter]);
  const active = list[Math.min(slot, list.length - 1)];

  useEffect(() => {
    let cancelled = false;
    let dispose = () => {};
    if (prefersReducedMotion()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- chỉ biết sau khi có window
      setMode("grid");
      return;
    }

    Promise.all([import("@/lib/gallery-scene"), document.fonts.ready])
      .then(([{ createGallery }]) => {
        if (cancelled || !canvas.current || !root.current) return;
        const items = tempProjects.map((project, i) => ({
          name: project.name,
          image: project.image,
          video: project.video,
          accent: accentOf(project),
          info: [
            ["Prjct", [`/${pad(i + 1)}`]],
            ["Created at:", [project.created]],
            ["Name:", [project.name]],
            ["Type:", [project.type]],
            ["Scope:", project.scope],
            ["Stack:", project.stack],
          ] as [string, string[]][],
        }));
        const created = createGallery(canvas.current, items, setSlot);
        scene.current = created;
        const pin = ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          // Đọc số thẻ từ DOM vì bộ lọc đổi list sau khi trigger đã tạo.
          onUpdate: ({ progress }) => created.setPosition(settle(progress * (Number(root.current?.dataset.count) - 1))),
        });
        trigger.current = pin;
        dispose = () => {
          pin.kill();
          created.dispose();
          scene.current = trigger.current = null;
        };
        setMode("scene");
      })
      .catch(() => setMode("grid"));

    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  useEffect(() => {
    const pin = trigger.current;
    if (!pin) return;
    scene.current?.setList(list.map((project) => tempProjects.indexOf(project)));
    ScrollTrigger.refresh();
    scrollTo(0, pin.start);
  }, [list]);

  const go = (index: number) => {
    const pin = trigger.current;
    if (pin) scrollTo(0, pin.start + (index / Math.max(list.length - 1, 1)) * (pin.end - pin.start));
  };

  const choose = (next: Filter) => {
    popover.current?.hidePopover();
    setSlot(0);
    setFilter(next);
  };

  const onTickKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: list.length - 1 }[event.key];
    if (next === undefined || next < 0 || next >= list.length) return;
    event.preventDefault();
    go(next);
    (event.currentTarget.parentElement?.children[next] as HTMLElement).focus({ preventScroll: true });
  };

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, scroll: window.scrollY, moved: false };
  };

  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const pin = trigger.current;
    if (drag.current && pin) {
      const moved = drag.current.x - event.clientX;
      drag.current.moved ||= Math.abs(moved) > DRAG_THRESHOLD;
      const perProject = (pin.end - pin.start) / Math.max(list.length - 1, 1);
      if (drag.current.moved) scrollTo(0, drag.current.scroll + (moved / DRAG_PER_PROJECT) * perProject);
      return;
    }
    if (!canFollowPointer() || !scene.current) return;
    const hit = scene.current.pick(event.clientX, event.clientY);
    scene.current.setHovered(hit === slot);
    event.currentTarget.style.cursor = hit < 0 ? "" : "pointer";
  };

  const onPointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    const moved = drag.current?.moved;
    drag.current = null;
    if (moved || !scene.current) return;
    const hit = scene.current.pick(event.clientX, event.clientY);
    if (hit === slot) window.open(list[hit].href, "_blank", "noreferrer");
    else if (hit >= 0) go(hit);
  };

  const filterMenu = (
    <>
      <button type="button" popoverTarget={FILTER_ID} className="rounded-full border border-white/40 bg-[#3a0f34] px-6 py-2 text-sm font-medium transition-colors duration-200 hover:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        Filter{filter ? `: ${filter.value}` : ""}
      </button>
      <div ref={popover} id={FILTER_ID} popover="auto" className="fixed inset-auto bottom-32 left-1/2 m-0 w-72 -translate-x-1/2 rounded-3xl border border-white/30 bg-[#3a0f34] p-5 text-white">
        <p className="font-mono text-xs uppercase">Emotion</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.keys(tempEmotions).map((value) => (
            <FilterOption key={value} label={value} pressed={filter?.value === value} onClick={() => choose({ kind: "emotion", value })} />
          ))}
        </div>
        <p className="mt-4 font-mono text-xs uppercase">Category</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {scopes.map((value) => (
            <FilterOption key={value} label={value} pressed={filter?.value === value} onClick={() => choose({ kind: "scope", value })} />
          ))}
        </div>
        <button type="button" onClick={() => choose(null)} className="mt-4 text-sm underline underline-offset-4">
          All projects
        </button>
      </div>
    </>
  );

  if (mode === "grid") {
    return (
      <section className="shell bg-[#040206] pb-20 pt-28 text-white">
        <h1 className={`${SERIF} text-[clamp(3rem,8vw,7rem)] leading-none`}>Work</h1>
        <div className="my-8">{filterMenu}</div>
        <ProjectGrid list={list} />
      </section>
    );
  }

  return (
    <section
      ref={root}
      data-count={list.length}
      className="relative bg-[#040206] text-white"
      style={{ height: `calc(100svh + ${list.length - 1} * 50vh)` }}
    >
      <h1 className="sr-only">Work</h1>
      <noscript>
        <div className="shell pt-28">
          <ProjectGrid list={tempProjects} />
        </div>
      </noscript>
      <div className="sticky top-0 h-svh overflow-hidden">
        <canvas
          ref={canvas}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full touch-pan-y"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (drag.current = null)}
          onPointerLeave={() => scene.current?.setHovered(false)}
        />
        <div className={`pointer-events-none absolute inset-x-0 bottom-0 grid gap-5 p-6 transition-opacity duration-500 md:grid-cols-3 md:items-end md:p-10 ${mode === "scene" ? "opacity-100" : "opacity-0"}`}>
          <div key={active.name} className="gallery-headline min-w-0">
            <a href={active.href} target="_blank" rel="noreferrer" className={`${SERIF} pointer-events-auto text-[clamp(2.4rem,5vw,4.6rem)] leading-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white`}>
              <span aria-hidden="true" className="mr-3 font-mono text-[.6em]">↳</span>
              {active.name}
            </a>
            <p className="mt-3 max-w-[34ch] font-mono text-xs font-medium uppercase leading-snug">{active.note}</p>
            <p className="mt-1 font-mono text-xs uppercase text-white/70 md:hidden">
              {active.type} / {active.created} / {active.scope.join(", ")}
            </p>
          </div>
          <div className="pointer-events-auto flex flex-col items-start gap-4 md:items-center">
            {filterMenu}
            <nav aria-label="Projects" className="flex items-center gap-3 font-mono text-xs">
              <span aria-hidden="true">{pad(slot + 1)}</span>
              <div role="toolbar" aria-label="Choose a project" className="flex">
                {list.map((project, i) => (
                  <button
                    key={project.name}
                    type="button"
                    tabIndex={i === slot ? 0 : -1}
                    aria-label={`Project ${i + 1}: ${project.name}`}
                    aria-current={i === slot ? "true" : undefined}
                    onClick={() => go(i)}
                    onKeyDown={(event) => onTickKey(event, i)}
                    style={{ "--tick": accentOf(project) } as React.CSSProperties}
                    className="gallery-tick"
                  />
                ))}
              </div>
              <span aria-hidden="true">{pad(list.length)}</span>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterOption({ label, pressed, onClick }: { label: string; pressed: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="rounded-full border border-white/30 px-3 py-1 text-sm transition-colors duration-200 hover:border-white aria-pressed:bg-white aria-pressed:text-[#3a0f34]"
    >
      {label}
    </button>
  );
}

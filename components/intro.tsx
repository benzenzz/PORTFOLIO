"use client";

import { useRef } from "react";
import { visibleProjects } from "@/content/projects";
import { hero } from "@/content/site";
import { addWipe, gsap, INTRO_SEEN_KEY, splitWipe, useGSAP } from "@/lib/motion";

// Mốc thời gian lấy theo loader của productionportugal.com, tính bằng giây.
const T = {
  listStart: 0.2,
  listDuration: 3.4,
  itemStagger: 0.024,
  headingStart: 0.75,
  listsFade: 2.65,
  cutStart: 3.6,
  handoff: 0.2,
  cutScale: 4.15,
  zoom: 0.9,
  zoomFade: 4.8,
  complete: 5.2,
};

const ROWS_PER_PROJECT = 10; // Đủ dài để cột cao hơn màn hình lớn nhất.
const BASE_COLOR = "#101010";
const TEXT_COLOR = "#f5f4f0";

const titles = visibleProjects.map((project) => project.title);
const rows = Array.from({ length: titles.length * ROWS_PER_PROJECT }, (_, index) => titles[index % titles.length]);

function List({ side, items }: { side: "left" | "right"; items: string[] }) {
  return (
    <ul className={`intro-list intro-list--${side}`}>
      {items.map((title, index) => {
        const count = <span>[{String(items.length - index).padStart(2, "0")}]</span>;
        return (
          <li key={index}>
            {side === "left" ? count : null} {title} {side === "right" ? count : null}
          </li>
        );
      })}
    </ul>
  );
}

/** Vẽ chữ lên canvas để đục xuyên nền rồi zoom qua lỗ chữ, lộ hero bên dưới. */
function createCutScreen(canvas: HTMLCanvasElement, lines: HTMLElement[], word: Range | null, zoomBase: () => number) {
  const context = canvas.getContext("2d");
  const text = document.createElement("canvas");
  const textContext = text.getContext("2d");
  if (!context || !textContext) return null;

  const state = { scale: 1, opening: 0, x: 0, y: 0 };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const draw = () => {
    const { innerWidth: width, innerHeight: height } = window;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
    context.fillStyle = BASE_COLOR;
    context.fillRect(0, 0, width, height);
    context.translate(state.x, state.y);
    context.scale(state.scale, state.scale);
    context.translate(-state.x, -state.y);
    context.drawImage(text, 0, 0, width, height);
    if (state.opening > 0) {
      context.globalCompositeOperation = "destination-out";
      context.globalAlpha = state.opening;
      context.drawImage(text, 0, 0, width, height);
    }
  };

  const sync = () => {
    canvas.width = text.width = Math.ceil(window.innerWidth * dpr);
    canvas.height = text.height = Math.ceil(window.innerHeight * dpr);
    textContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    textContext.textBaseline = "alphabetic";
    textContext.fillStyle = TEXT_COLOR;

    for (const line of lines) {
      const style = getComputedStyle(line);
      textContext.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      textContext.letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
      const rect = line.getBoundingClientRect();
      const raw = line.textContent ?? "";
      const value = style.textTransform === "uppercase" ? raw.toUpperCase() : raw;
      const metrics = textContext.measureText(value);
      const glyphHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
      textContext.fillText(
        value,
        rect.left,
        rect.top + (rect.height - glyphHeight) / 2 + metrics.fontBoundingBoxAscent,
      );
    }

    // Gốc zoom phải nằm trên nét chữ dày nhất, lệch ra ngoài nét thì lỗ không phủ kín màn hình.
    const target = word?.getBoundingClientRect() ?? lines[0].getBoundingClientRect();
    const y = Math.round((target.top + target.height / 2) * dpr);
    const left = Math.max(0, Math.round(target.left * dpr));
    const span = Math.max(1, Math.round(target.width * dpr));
    const alpha = textContext.getImageData(left, y, span, 1).data;
    let best = { start: 0, length: 0 };
    let start = -1;
    for (let x = 0; x <= span; x += 1) {
      const solid = x < span && alpha[x * 4 + 3] > 200;
      if (solid && start < 0) start = x;
      if (!solid && start >= 0) {
        if (x - start > best.length) best = { start, length: x - start };
        start = -1;
      }
    }
    state.x = (left + best.start + best.length / 2) / dpr;
    state.y = y / dpr;
    draw();
  };

  return {
    sync,
    setOpening: (value: number) => {
      state.opening = value;
      draw();
    },
    setZoom: (progress: number) => {
      state.scale = zoomBase() ** progress;
      draw();
    },
  };
}

function wordRange(element: HTMLElement, word: string) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const index = node.data.indexOf(word);
    if (index < 0) continue;
    const range = document.createRange();
    range.setStart(node, index);
    range.setEnd(node, index + word.length);
    return range;
  }
  return null;
}

export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLParagraphElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const html = document.documentElement;
      if (!html.classList.contains("intro-pending") || !contextSafe) return;

      let exited = false;
      let revealed = false;
      let timeline: gsap.core.Timeline | undefined;

      const announceExit = () => {
        if (exited) return;
        exited = true;
        try {
          sessionStorage.setItem(INTRO_SEEN_KEY, "1");
        } catch {
          // Không có sessionStorage thì intro chạy lại ở lần sau, không ảnh hưởng gì khác.
        }
        document.dispatchEvent(new Event("intro-exit"));
      };
      const announceReveal = () => {
        if (revealed) return;
        revealed = true;
        document.dispatchEvent(new Event("intro-reveal"));
      };

      const skipEvents = ["wheel", "touchmove", "keydown", "pointerdown"] as const;
      const finish = () => {
        skipEvents.forEach((name) => window.removeEventListener(name, skip));
        announceExit();
        announceReveal();
        html.classList.remove("intro-pending");
      };
      const skip = contextSafe(() => {
        timeline?.kill();
        announceExit();
        announceReveal();
        gsap.to(root.current, { autoAlpha: 0, duration: 0.3, ease: "power2.out", onComplete: finish });
        skipEvents.forEach((name) => window.removeEventListener(name, skip));
      });
      skipEvents.forEach((name) => window.addEventListener(name, skip, { passive: true }));

      const start = contextSafe(() => {
        if (!heading.current || !canvas.current || !stage.current) return finish();
        const { lines } = splitWipe(heading.current);
        const lineElements = lines.map((line) => line.content);
        const cut = createCutScreen(
          canvas.current,
          lineElements,
          lineElements.map((line) => wordRange(line, hero.cutWord)).find(Boolean) ?? null,
          () => (window.innerWidth < 768 ? 800 : 1200),
        );
        if (!cut) return finish();

        const lists = gsap.utils.toArray<HTMLElement>(".intro-list").filter((list) => list.offsetParent);
        const listEnd = (list: HTMLElement) =>
          -(Math.max(0, list.scrollHeight - window.innerHeight) + window.innerHeight * 0.025);

        gsap.set(lists, { y: window.innerHeight + 24 });
        gsap.set(canvas.current, { autoAlpha: 0 });

        const tl = gsap.timeline({ onComplete: finish });
        timeline = tl;

        lists.forEach((list, index) => {
          tl.to(list, { y: listEnd(list), duration: T.listDuration, ease: "M0,0 C0.42,0 0.3,1 1,1" }, T.listStart + index * 0.05);
          tl.fromTo(
            list.children,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.28, ease: "power1.inOut", stagger: T.itemStagger },
            T.listStart + 0.05 + index * 0.07,
          );
        });

        addWipe(tl, lines, T.headingStart, { fill: 0.46, reveal: 0.4, stagger: 0.065 });
        tl.to(lists, { autoAlpha: 0, duration: 0.95, ease: "power2.out" }, T.listsFade);

        tl.call(announceExit, undefined, T.cutScale - 0.4);
        tl.call(cut.sync, undefined, T.cutStart);
        tl.to(canvas.current, { autoAlpha: 1, duration: T.handoff, ease: "none" }, T.cutStart);
        tl.set(stage.current, { autoAlpha: 0 }, T.cutStart + T.handoff);

        const opening = { value: 0 };
        tl.to(
          opening,
          {
            value: 1,
            duration: T.cutScale - T.cutStart - T.handoff,
            ease: "power2.inOut",
            onUpdate: () => cut.setOpening(opening.value),
          },
          T.cutStart + T.handoff,
        );
        const zoom = { value: 0 };
        tl.to(
          zoom,
          { value: 1, duration: T.zoom, ease: "M0,0 C0.55,0 0.75,0.35 1,1", onUpdate: () => cut.setZoom(zoom.value) },
          T.cutScale,
        );
        tl.call(announceReveal, undefined, T.zoomFade);
        tl.to(canvas.current, { autoAlpha: 0, duration: T.complete - T.zoomFade, ease: "power2.inOut" }, T.zoomFade);
      });

      let started = false;
      const begin = () => {
        if (started || revealed) return;
        started = true;
        start();
      };
      const fontDeadline = window.setTimeout(begin, 600);
      document.fonts?.ready.then(() => {
        window.clearTimeout(fontDeadline);
        begin();
      });

      return () => {
        window.clearTimeout(fontDeadline);
        started = true;
        skipEvents.forEach((name) => window.removeEventListener(name, skip));
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div ref={stage} className="intro-stage surface-dark">
        <List side="left" items={rows} />
        <List side="right" items={[...rows].reverse()} />
        <p ref={heading} className="intro-heading">
          {hero.intro}
        </p>
      </div>
      <canvas ref={canvas} className="intro-canvas" />
    </div>
  );
}

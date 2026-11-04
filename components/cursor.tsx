"use client";

import { useEffect, useRef } from "react";
import { canFollowPointer } from "@/lib/motion";

const INTERACTIVE = "a, button, [role='tab'], summary, label";
const SUPPRESSED = "input, textarea, select, video";

/** Khung ngắm bám con trỏ. Con trỏ thật vẫn giữ nguyên, lớp này chỉ thêm vào. */
export function Cursor() {
  const frame = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = frame.current;
    const text = label.current;
    if (!cursor || !text || !canFollowPointer()) return;

    const pointer = { x: 0, y: 0, labelX: 0, labelY: 0, ready: false };
    let rafId = 0;
    let last = 0;
    let currentLabel = "";

    const render = (time: number) => {
      rafId = 0;
      const elapsed = last ? Math.min(time - last, 64) : 1000 / 60;
      last = time;
      const follow = 1 - 0.9 ** (elapsed / (1000 / 60));
      pointer.labelX += (pointer.x - pointer.labelX) * follow;
      pointer.labelY += (pointer.y - pointer.labelY) * follow;
      cursor.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
      text.style.transform = `translate3d(${pointer.labelX - pointer.x}px, ${pointer.labelY - pointer.y}px, 0)`;
      const settled = Math.abs(pointer.x - pointer.labelX) + Math.abs(pointer.y - pointer.labelY) < 0.05;
      if (settled) last = 0;
      else rafId = requestAnimationFrame(render);
    };

    const setLabel = (value: string) => {
      if (value === currentLabel) return;
      currentLabel = value;
      text.classList.remove("is-revealed");
      text.replaceChildren(
        ...Array.from(value, (character) => {
          const box = document.createElement("span");
          const inner = document.createElement("span");
          box.className = "cursor-char";
          inner.textContent = character;
          box.append(inner);
          return box;
        }),
      );
      // Hai frame để trình duyệt vẽ trạng thái đầu trước khi chạy transition.
      requestAnimationFrame(() => requestAnimationFrame(() => text.classList.add("is-revealed")));
    };

    const update = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      cursor.classList.toggle("is-interactive", Boolean(element?.closest(INTERACTIVE)));
      cursor.classList.toggle("is-suppressed", Boolean(element?.closest(SUPPRESSED)));
      cursor.classList.toggle("is-on-red", Boolean(element?.closest(".surface-red")));
      setLabel(element?.closest("[data-cursor]")?.getAttribute("data-cursor") ?? "");
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!pointer.ready) {
        pointer.labelX = pointer.x;
        pointer.labelY = pointer.y;
        pointer.ready = true;
      }
      cursor.classList.add("is-visible");
      update(event.target);
      if (!rafId) rafId = requestAnimationFrame(render);
    };
    const onDown = () => cursor.classList.add("is-pressed");
    const onUp = () => cursor.classList.remove("is-pressed");
    const hide = () => {
      cursor.classList.remove("is-visible", "is-pressed");
      pointer.ready = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("pointerleave", hide);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("pointerleave", hide);
    };
  }, []);

  return (
    <div ref={frame} className="cursor" aria-hidden="true">
      <div className="cursor-frame">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div ref={label} className="cursor-label" />
    </div>
  );
}

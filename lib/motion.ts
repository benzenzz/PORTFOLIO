import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, CustomEase, ScrambleTextPlugin, ScrollTrigger, SplitText);
  CustomEase.create("wipeFill", "0.76, 0, 0.24, 1");
  CustomEase.create("wipeReveal", "0.16, 1, 0.3, 1");
  CustomEase.create("panelSlide", "0.25, 0.1, 0.04, 1");
  CustomEase.create("expoOut", "0.19, 1, 0.22, 1");
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const INTRO_SEEN_KEY = "demi-intro-seen";

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Chuột thật và cho phép chuyển động. Cảm ứng không chạy các hiệu ứng bám con trỏ. */
export const canFollowPointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)")
    .matches;

export type WipeLine = { content: HTMLElement; mask: HTMLElement };

/** Bọc phần tử có sẵn thành một dòng wipe: khối màu phủ lên, chữ hiện, khối rút đi. */
function wrapLine(line: HTMLElement): WipeLine {
  const content = document.createElement("span");
  content.className = "wipe-content";
  while (line.firstChild) content.appendChild(line.firstChild);
  const mask = document.createElement("span");
  mask.className = "wipe-mask";
  line.classList.add("wipe-line");
  line.append(content, mask);
  gsap.set(content, { autoAlpha: 0 });
  gsap.set(mask, { scaleX: 0 });
  return { content, mask };
}

/** Tách chữ theo dòng hiển thị để wipe. Gọi `split.revert()` xong để chữ tự xuống dòng lại khi resize. */
export function splitWipe(element: HTMLElement) {
  const split = new SplitText(element, { type: "lines", linesClass: "wipe-split" });
  return { split, lines: (split.lines as HTMLElement[]).map(wrapLine) };
}

export const wipeSingle = wrapLine;

type WipeTiming = { fill: number; reveal: number; stagger: number };

export function addWipe(
  timeline: gsap.core.Timeline,
  lines: WipeLine[],
  at: number,
  { fill, reveal, stagger }: WipeTiming,
) {
  const masks = lines.map((line) => line.mask);
  timeline
    .to(masks, { scaleX: 1, transformOrigin: "right center", duration: fill, ease: "wipeFill", stagger }, at)
    .set(lines.map((line) => line.content), { autoAlpha: 1, stagger }, at + fill)
    .to(masks, { scaleX: 0, transformOrigin: "left center", duration: reveal, ease: "wipeReveal", stagger }, at + fill);
}

/** Scramble của AUGE: trễ 0.12s, dài 0.6s. Font mono nên chữ không nhảy bề ngang. */
export function scramble(element: HTMLElement, delay = 0.12) {
  if (prefersReducedMotion() || gsap.isTweening(element)) return;
  const text = element.dataset.text ?? element.textContent ?? "";
  element.dataset.text = text;
  gsap.to(element, {
    duration: 0.6,
    delay,
    ease: "none",
    scrambleText: { text, chars: "upperCase", speed: 0.6 },
  });
}

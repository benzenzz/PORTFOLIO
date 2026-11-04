"use client";

import { useRef } from "react";
import { about, statement } from "@/content/site";
import { addWipe, gsap, prefersReducedMotion, scramble, ScrollTrigger, splitWipe, useGSAP } from "@/lib/motion";

// Thứ tự 6 ô tạo bàn cờ trên lưới 4 cột.
const CHECKER = ["md:col-start-1", "md:col-start-3", "md:col-start-2", "md:col-start-4", "md:col-start-1", "md:col-start-3"];
const NAV_LINE = "48px"; // Giữa thanh menu, nơi menu đổi màu khi đi vào nền đỏ.

export function Statement() {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!title.current || !panel.current) return;

      // Chữ đảo màu trên đỏ ra xanh ngọc, nên menu phải đổi màu kể cả khi tắt chuyển động.
      ScrollTrigger.create({
        trigger: panel.current,
        start: `top ${NAV_LINE}`,
        end: `bottom ${NAV_LINE}`,
        toggleClass: { targets: document.documentElement, className: "on-red" },
      });

      if (prefersReducedMotion()) return;

      const { split, lines } = splitWipe(title.current);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: title.current, start: "top 80%", once: true },
        onComplete: () => split.revert(),
      });
      addWipe(tl, lines, 0, { fill: 0.46, reveal: 0.4, stagger: 0.065 });
      tl.from(".statement-note", { autoAlpha: 0, y: 12, duration: 0.6, ease: "power3.out" }, 0.5);

      gsap.fromTo(
        panel.current,
        { clipPath: "inset(0% 8% 0% 8%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: panel.current, start: "top bottom", end: "top 20%", scrub: true },
        },
      );

      const cards = gsap.utils.toArray<HTMLElement>(".statement-card");
      gsap.from(cards, {
        autoAlpha: 0,
        yPercent: 24,
        duration: 0.7,
        ease: "expoOut",
        stagger: 0.07,
        scrollTrigger: {
          trigger: panel.current,
          start: "top 60%",
          once: true,
          onEnter: () => cards.forEach((card, index) => {
            const label = card.querySelector<HTMLElement>("[data-scramble]");
            if (label) scramble(label, index * 0.07);
          }),
        },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="statement" aria-labelledby="statement-title" className="surface-dark relative z-10">
      <div className="shell py-[clamp(6rem,16vw,12rem)]">
        <h2 ref={title} id="statement-title" className="max-w-[16em] text-[clamp(2.25rem,6.2vw,6rem)] uppercase">
          {statement.title}
        </h2>
        <p className="statement-note mt-6 max-w-xl text-fg-muted md:mt-10">{about.statement}</p>
      </div>

      <div ref={panel} className="surface-red shell py-[clamp(4rem,8vw,6rem)]">
        <ul className="grid grid-cols-2 gap-1 md:grid-cols-4 md:gap-0">
          {statement.highlights.map((item, index) => (
            <li key={item.label} className={`statement-card ${CHECKER[index]}`}>
              <div className="statement-cut flex aspect-[5/4] flex-col-reverse justify-between bg-ink/8 p-3 pl-6 md:p-4 md:pl-7">
                <p
                  aria-hidden={"tool" in item ? true : undefined}
                  className={`font-bold tracking-[-0.03em] ${"tool" in item ? "dot-text" : ""} ${
                    item.value.length > 6 ? "display-item" : "text-[clamp(2.25rem,5.4vw,5rem)] leading-none"
                  }`}
                >
                  {item.value}
                </p>
                <p className="label text-right">
                  <span data-scramble>{item.label}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

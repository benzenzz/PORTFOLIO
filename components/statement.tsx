"use client";

import { useRef } from "react";
import { about, statement } from "@/content/site";
import { gsap, scramble, ScrollTrigger, SplitText, useGSAP } from "@/lib/motion";

// Vị trí 7 ô trên bàn cờ 5 cột, theo thứ tự trong statement.highlights.
const CHECKER = [
  "md:col-start-2 md:row-start-2",
  "md:col-start-1 md:row-start-1",
  "md:col-start-3 md:row-start-1",
  "md:col-start-5 md:row-start-1",
  "md:col-start-4 md:row-start-2",
  "md:col-start-3 md:row-start-3",
  "md:col-start-5 md:row-start-3",
];
const NAV_LINE = 48; // px, giữa thanh menu, nơi menu đổi màu khi đi vào nền đỏ.
const PIN_LENGTH = 1.3; // Quãng ghim, tính theo số lần chiều cao màn hình.
const PIXELS_FROM = 0.45; // Phần đầu quãng ghim để đọc chữ, sau đó khối pixel mới chạy.
const PIXELS_SPAN = 0.35;
const CARDS_AT = 0.6; // Mốc trong hiệu ứng pixel mà các ô bắt đầu trồi lên.

/** Dựng lưới ô vuông trong clipPath. Bỏ một ô là đục một lỗ trên lớp chữ, lộ nền đỏ bên dưới. */
function pixelCover(clip: SVGClipPathElement) {
  const { innerWidth: width, innerHeight: height } = window;
  const cols = width > height ? 16 : 8;
  const rows = Math.round((cols * height) / width);
  const rects = Array.from({ length: cols * rows }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(col / cols));
    rect.setAttribute("y", String(row / rows));
    // Rộng hơn ô một chút để không lộ đường nối giữa hai ô liền nhau.
    rect.setAttribute("width", String(1 / cols + 0.002));
    rect.setAttribute("height", String(1 / rows + 0.002));
    clip.append(rect);
    // Ăn dần từ góc dưới phải, cộng phần ngẫu nhiên để mép vỡ thành khối.
    const fromCorner = 1 - (col / cols + row / rows) / 2;
    return { rect, opensAt: fromCorner * 0.4 + Math.random() * 0.6, open: false };
  });

  return {
    set(progress: number) {
      for (const block of rects) {
        const open = progress >= block.opensAt;
        if (open === block.open) continue;
        block.open = open;
        block.rect.style.display = open ? "none" : "";
      }
    },
    clear: () => clip.replaceChildren(),
  };
}

export function Statement() {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const number = useRef<HTMLParagraphElement>(null);
  const clip = useRef<SVGClipPathElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section || !title.current || !panel.current || !clip.current) return;
      const clipPath = clip.current;
      const toggleRed = { targets: document.documentElement, className: "on-red" };

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        ScrollTrigger.create({
          trigger: panel.current,
          start: `top ${NAV_LINE}px`,
          end: `bottom ${NAV_LINE}px`,
          toggleClass: toggleRed,
        });
      });

      // Hai hướng màn hình để xoay máy thì đo và dựng lại.
      const motion = (orientation: string) => `(prefers-reduced-motion: no-preference) and (orientation: ${orientation})`;
      mm.add({ portrait: motion("portrait"), landscape: motion("landscape") }, () => {
        const cards = gsap.utils.toArray<HTMLElement>(".statement-card");
        const cardsIn = gsap.from(cards, {
          autoAlpha: 0,
          yPercent: 24,
          duration: 0.7,
          ease: "expoOut",
          stagger: 0.07,
          paused: true,
          onStart: () => {
            cards.forEach((card, index) => {
              const label = card.querySelector<HTMLElement>("[data-scramble]");
              if (label) scramble(label, index * 0.07);
            });
            if (number.current) {
              gsap.to(number.current, {
                duration: 0.8,
                ease: "none",
                scrambleText: { text: number.current.textContent ?? "", chars: "0123456789", speed: 0.6 },
              });
            }
          },
        });

        // Chữ tự hiện từ ký tự ngẫu nhiên. Tách theo dòng và khóa dòng để chữ đổi bề ngang không làm nhảy bố cục.
        const split = new SplitText(title.current, { type: "lines" });
        const lines = split.lines as HTMLElement[];
        const texts = lines.map((line) => line.textContent ?? "");
        lines.forEach((line) => {
          gsap.set(line, { minHeight: line.offsetHeight, whiteSpace: "nowrap" });
          line.textContent = "";
        });
        const decode = gsap.timeline({
          scrollTrigger: { trigger: title.current, start: "top 80%", once: true },
          onComplete: () => split.revert(),
        });
        lines.forEach((line, index) => {
          decode.to(
            line,
            { duration: 0.9, ease: "none", scrambleText: { text: texts[index], chars: "upperCase", speed: 0.7 } },
            index * 0.12,
          );
        });
        decode.from(".statement-note", { autoAlpha: 0, y: 12, duration: 0.6, ease: "power3.out" }, 0.5);

        // Lưới chỉ ghim được khi lọt trong màn hình, không thì ô dưới cùng không bao giờ thấy được.
        if (panel.current!.offsetHeight > window.innerHeight) {
          ScrollTrigger.create({
            trigger: panel.current,
            start: `top ${NAV_LINE}px`,
            end: `bottom ${NAV_LINE}px`,
            toggleClass: toggleRed,
          });
          ScrollTrigger.create({ trigger: panel.current, start: "top 60%", once: true, onEnter: () => cardsIn.play() });
          return;
        }

        section.classList.add("is-staged");
        const cover = pixelCover(clipPath);
        const pin = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * PIN_LENGTH}`,
          pin: true,
          onUpdate: ({ progress }) => {
            const pixels = gsap.utils.clamp(0, 1, (progress - PIXELS_FROM) / PIXELS_SPAN);
            cover.set(pixels);
            if (pixels >= CARDS_AT && cardsIn.paused()) cardsIn.play();
          },
        });
        ScrollTrigger.create({
          trigger: section,
          start: () => pin.start + window.innerHeight * PIN_LENGTH * (PIXELS_FROM + PIXELS_SPAN / 2),
          end: () => pin.end + window.innerHeight - NAV_LINE,
          toggleClass: toggleRed,
        });

        return () => {
          section.classList.remove("is-staged");
          cover.clear();
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="statement" aria-labelledby="statement-title" className="surface-dark relative z-10">
      <svg aria-hidden="true" className="absolute size-0">
        <clipPath ref={clip} id="statement-pixels" clipPathUnits="objectBoundingBox" />
      </svg>

      <div className="statement-front shell py-[clamp(6rem,16vw,12rem)]">
        <h2 ref={title} id="statement-title" className="max-w-[16em] text-[clamp(2.25rem,6.2vw,6rem)] uppercase">
          {statement.title}
        </h2>
        <p className="statement-note mt-6 max-w-xl text-fg-muted md:mt-10">{about.statement}</p>
      </div>

      <div ref={panel} className="statement-panel surface-red shell py-[clamp(4rem,8vw,6rem)]">
        <ul className="grid w-full grid-cols-2 gap-1 md:grid-cols-5 md:gap-0">
          {statement.highlights.map((item, index) => (
            <li key={item.label} className={`statement-card ${CHECKER[index]} ${"tool" in item ? "" : "max-md:col-span-2"}`}>
              <div
                className={`statement-cut flex aspect-[5/4] flex-col-reverse justify-between bg-ink/8 p-3 pl-6 text-fg transition-colors duration-[var(--dur-fast)] hover:bg-ink hover:[--fg:var(--color-paper)] md:p-4 md:pl-7 ${"tool" in item ? "" : "max-md:aspect-[5/2]"}`}
              >
                <p
                  ref={"tool" in item ? undefined : number}
                  aria-hidden={"tool" in item ? true : undefined}
                  className={`text-[clamp(2.25rem,5.4vw,5rem)] leading-none font-bold tracking-[-0.03em] ${"tool" in item ? "dot-text" : ""}`}
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

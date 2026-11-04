"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type PointerEvent, useRef } from "react";
import { scramble } from "@/lib/motion";

const links = [
  { label: "Work", href: "/#work", path: "/" },
  { label: "Playground", href: "/playground", path: "/playground" },
  { label: "About", href: "/about", path: "/about" },
];

const contactClass =
  "label pointer-events-auto bg-red px-3 py-2 text-ink transition-opacity duration-[var(--dur-fast)] hover:opacity-80 focus-visible:outline-paper";

const scrambleLabel = (event: PointerEvent<HTMLElement>) => {
  const label = event.currentTarget.querySelector<HTMLElement>("[data-scramble]");
  if (label) scramble(label);
};

export function Nav() {
  const pathname = usePathname();
  const menu = useRef<HTMLDialogElement>(null);

  return (
    <>
      <a
        href="#main"
        className="label fixed top-2 left-2 z-50 -translate-y-16 bg-paper px-3 py-2 text-ink focus-visible:translate-y-0"
      >
        Skip to content
      </a>

      {/* Lớp blend phải tách khỏi nút CONTACT: chữ đảo màu theo nền, nút thì không */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 mix-blend-difference">
        <nav aria-label="Main" className="shell flex items-center justify-between py-4 text-white">
          <Link href="/" className="pointer-events-auto text-sm font-bold uppercase">
            Demi Phan
          </Link>

          <div className="flex items-center gap-6">
            <ul className="hidden items-center gap-6 md:flex">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.path ? "page" : undefined}
                    onPointerEnter={scrambleLabel}
                    className="label pointer-events-auto underline-offset-4 hover:underline aria-[current=page]:underline"
                  >
                    <span aria-hidden="true">■ </span>
                    <span data-scramble>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => menu.current?.showModal()}
              className="label pointer-events-auto md:hidden"
            >
              <span aria-hidden="true">■ </span>Menu
            </button>
            {/* Giữ chỗ đúng bằng nút CONTACT ở lớp bên dưới */}
            <span aria-hidden="true" className="label invisible px-3 py-2">
              Contact
            </span>
          </div>
        </nav>
      </header>

      <div className="shell pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-end py-4">
        <a href="#contact" className={contactClass}>
          Contact
        </a>
      </div>

      <dialog
        ref={menu}
        aria-label="Menu"
        className="surface-dark m-0 h-dvh max-h-none w-full max-w-none"
      >
        <div className="shell flex h-full flex-col py-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => menu.current?.close()}
              className="label py-2"
              autoFocus
            >
              <span aria-hidden="true">■ </span>Close
            </button>
          </div>
          <ul className="mt-auto mb-auto flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => menu.current?.close()}
                  aria-current={pathname === link.path ? "page" : undefined}
                  className="display-xl block font-bold tracking-[-0.03em]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                onClick={() => menu.current?.close()}
                className="display-xl block font-bold tracking-[-0.03em] text-red"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </dialog>
    </>
  );
}

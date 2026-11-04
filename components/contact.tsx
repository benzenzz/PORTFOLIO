"use client";

import { useEffect, useRef, useState } from "react";
import { contact } from "@/content/site";

const button =
  "label border border-line px-3 py-2 transition-colors duration-[var(--dur-fast)] hover:border-fg";

export function Contact() {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const reset = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(reset.current), []);

  async function copyEmail() {
    window.clearTimeout(reset.current);
    try {
      await navigator.clipboard.writeText(contact.email);
      setStatus("copied");
    } catch {
      // Clipboard API bị chặn hoặc không có HTTPS: email vẫn là link mailto ở trên.
      setStatus("failed");
    }
    reset.current = window.setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <footer id="contact" className="surface-dark">
      <div className="shell flex min-h-[70svh] flex-col justify-center gap-8 py-24">
        <p>{contact.opening}</p>

        <a
          href={`mailto:${contact.email}`}
          className="display-email font-bold tracking-[-0.03em] [overflow-wrap:anywhere] underline-offset-8 hover:underline"
        >
          {contact.email}
        </a>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyEmail}
            className="label bg-accent px-3 py-2 text-on-accent transition-opacity duration-[var(--dur-fast)] hover:opacity-80 focus-visible:outline-paper"
          >
            {status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : "Copy email"}
          </button>
          <a href={contact.linkedin} target="_blank" rel="noreferrer" className={button}>
            LinkedIn
          </a>
          {contact.cv ? (
            <a href={contact.cv} download className={button}>
              Download CV
            </a>
          ) : (
            <span className="label px-3 py-2 text-fg-muted">[CV file, Demi to provide]</span>
          )}
          <span role="status" aria-live="polite" className="sr-only">
            {status === "copied" ? "Email copied" : status === "failed" ? "Could not copy email" : ""}
          </span>
        </div>

        <p className="label-sm text-fg-muted">{contact.details}</p>
      </div>
    </footer>
  );
}

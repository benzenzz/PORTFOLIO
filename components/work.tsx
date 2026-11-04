"use client";

import Image from "next/image";
import Link from "next/link";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  campaign,
  formatDuration,
  type Project,
  projectHref,
  projectsByTab,
  type Tab,
  tabs,
} from "@/content/projects";

const tabId = (tab: Tab) => `work-tab-${tabs.indexOf(tab)}`;
const PANEL_ID = "work-panel";

function metaLine(project: Project) {
  return project.tags.includes("Concept edit")
    ? `${project.role} · Concept edit`
    : project.role;
}

function Preview({ project }: { project: Project }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const canPlay = window.matchMedia(
      "(hover: hover) and (min-width: 768px) and (prefers-reduced-motion: no-preference)",
    ).matches;
    if (canPlay) video.current?.play().catch(() => {});
  }, [project.slug]);

  return (
    <figure>
      <div className="relative aspect-[4/3] overflow-hidden bg-fg">
        {project.preview ? (
          <video
            key={project.slug}
            ref={video}
            src={project.preview}
            poster={project.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        ) : (
          <Image src={project.poster} alt="" fill sizes="25vw" className="object-cover" />
        )}
      </div>
      <figcaption className="label-sm mt-2 text-fg-muted">
        {project.title}
        {project.duration ? ` · ${formatDuration(project.duration)}` : ""}
      </figcaption>
    </figure>
  );
}

export function Work() {
  const [tab, setTab] = useState<Tab>(tabs[0]);
  const [activeSlug, setActiveSlug] = useState<string>();
  const list = projectsByTab(tab);
  const active = list.find((project) => project.slug === activeSlug) ?? list[0];

  function choose(next: Tab, focus = false) {
    setTab(next);
    setActiveSlug(undefined);
    if (focus) document.getElementById(tabId(next))?.focus();
  }

  function onTabKey(event: KeyboardEvent) {
    const index = tabs.indexOf(tab);
    const target = {
      ArrowRight: tabs[(index + 1) % tabs.length],
      ArrowDown: tabs[(index + 1) % tabs.length],
      ArrowLeft: tabs[(index - 1 + tabs.length) % tabs.length],
      ArrowUp: tabs[(index - 1 + tabs.length) % tabs.length],
      Home: tabs[0],
      End: tabs[tabs.length - 1],
    }[event.key];
    if (!target) return;
    event.preventDefault();
    choose(target, true);
  }

  return (
    <section id="work" aria-labelledby="work-title" className="surface-light">
      <div className="shell grid gap-8 py-24 md:min-h-svh md:grid-cols-[minmax(11rem,20%)_1fr_minmax(12rem,22%)] md:items-center md:gap-6">
        <div>
          <h2 id="work-title" className="text-4xl uppercase md:text-[clamp(1.75rem,2.6vw,2.5rem)]">
            Selected work
          </h2>

          <div
            role="tablist"
            aria-label="Filter by discipline"
            onKeyDown={onTabKey}
            className="mt-6 flex flex-wrap gap-x-4 gap-y-1 md:flex-col md:items-start"
          >
            {tabs.map((item) => (
              <button
                key={item}
                id={tabId(item)}
                type="button"
                role="tab"
                aria-selected={item === tab}
                aria-controls={PANEL_ID}
                tabIndex={item === tab ? 0 : -1}
                onClick={() => choose(item)}
                className="label px-1 py-1 aria-selected:bg-selected aria-selected:text-on-selected"
              >
                <span aria-hidden="true">■ </span>
                {item}
              </button>
            ))}
          </div>

          <Link
            href={`/work/${campaign.slug}`}
            className="mt-6 block bg-fg p-3 text-surface transition-opacity duration-[var(--dur-fast)] hover:opacity-85"
          >
            <span className="label block">{campaign.caseLabel}</span>
            <span className="label mt-3 block">
              View case study <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>

        <ul role="tabpanel" id={PANEL_ID} aria-labelledby={tabId(tab)} className="min-w-0">
          {list.map((project) => {
            const selected = project.slug === active.slug;
            return (
              <li key={project.slug}>
                <Link
                  href={projectHref(project)}
                  onPointerEnter={() => setActiveSlug(project.slug)}
                  onFocus={() => setActiveSlug(project.slug)}
                  className="grid grid-cols-[5.5rem_1fr] items-center gap-3 border-b border-line py-3 md:grid-cols-[1fr_auto] md:gap-6 md:border-0 md:py-1"
                >
                  <span className="relative aspect-[4/3] overflow-hidden md:hidden">
                    <Image src={project.poster} alt="" fill sizes="6rem" className="object-cover" />
                  </span>
                  <span className="min-w-0 md:contents">
                    <span
                      data-selected={selected}
                      className="display-item block font-bold tracking-[-0.03em] md:w-fit md:text-fg-dim md:transition-colors md:duration-[var(--dur-fast)] md:data-[selected=true]:bg-selected md:data-[selected=true]:text-on-selected"
                    >
                      {project.title}
                    </span>
                    <span
                      data-selected={selected}
                      className="label-sm mt-1 block text-fg-muted md:mt-0 md:w-44 md:data-[selected=true]:text-fg"
                    >
                      {project.year} · {project.tags[0]}
                      <br />
                      {metaLine(project)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:block">
          <Preview project={active} />
          {active.note ? <p className="label-sm mt-1 text-fg-muted">{active.note}</p> : null}
        </div>
      </div>
    </section>
  );
}

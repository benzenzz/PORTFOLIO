import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  type ImageAsset,
  type Project,
  projectHref,
  type VideoAsset,
} from "@/content/projects";

/** Ô ngoặc vuông là nội dung chờ Demi, làm mờ để không nhầm với chữ thật. */
export function Copy({ text, className = "" }: { text: string; className?: string }) {
  const pending = text.startsWith("[");
  return <span className={`${className} ${pending ? "text-fg-muted" : ""}`}>{text}</span>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="label font-medium tracking-[0.02em] text-fg-muted">{children}</h2>;
}

export function Video({ video, className = "" }: { video: VideoAsset; className?: string }) {
  return (
    <figure className={className}>
      <video
        src={video.src}
        poster={video.poster}
        width={video.width}
        height={video.height}
        controls
        playsInline
        preload="none"
        aria-label={video.label}
        className="h-auto w-full bg-black"
      />
      <figcaption className="label-sm mt-2 text-fg-muted">{video.label}</figcaption>
    </figure>
  );
}

export function Picture({ image, sizes }: { image: ImageAsset; sizes: string }) {
  return (
    <figure>
      <Image
        src={image.src}
        alt={image.label}
        width={image.width}
        height={image.height}
        sizes={sizes}
        className="h-auto w-full"
      />
      <figcaption className="label-sm mt-2 text-fg-muted">{image.label}</figcaption>
    </figure>
  );
}

export function Glance({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <section aria-labelledby="glance" className="max-w-3xl">
      <h2 id="glance" className="label tracking-[0.02em] text-fg-muted">
        At a glance
      </h2>
      <dl className="mt-3">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[6rem_1fr] gap-4 border-t border-line py-3">
            <dt className="label-sm pt-1 text-fg-muted">{row.label}</dt>
            <dd>
              <Copy text={row.value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function NextProject({ project }: { project: Project }) {
  return (
    <nav aria-label="Next project" className="flex items-end justify-between gap-6 border-t border-line pt-6">
      <span className="label text-fg-muted">Next project</span>
      <Link
        href={projectHref(project)}
        className="display-item text-right font-bold tracking-[-0.03em] text-accent underline-offset-4 hover:underline"
      >
        {project.title} <span aria-hidden="true">→</span>
      </Link>
    </nav>
  );
}

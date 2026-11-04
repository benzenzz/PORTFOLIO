import type { Metadata } from "next";
import Link from "next/link";
import { getProject, projectHref } from "@/content/projects";
import { playground, type PlaygroundItem } from "@/content/playground";

export const metadata: Metadata = { title: "Playground" };

function Item({ item }: { item: PlaygroundItem }) {
  const project = item.projectSlug ? getProject(item.projectSlug) : undefined;
  const video = project?.videos?.[0];

  return (
    <article>
      {item.placeholders ? (
        <ul className="grid grid-cols-3 gap-1" aria-label={`${item.title} photos, not added yet`}>
          {Array.from({ length: item.placeholders }, (_, index) => (
            <li
              key={index}
              className="label-sm flex aspect-square items-center justify-center border border-line p-1 text-center text-fg-muted"
            >
              [Add photo]
            </li>
          ))}
        </ul>
      ) : null}

      {video ? (
        <video
          src={video.src}
          poster={video.poster}
          controls
          playsInline
          preload="none"
          aria-label={video.label}
          className="aspect-square w-full bg-black object-contain"
        />
      ) : null}

      <h2 className="mt-3 text-xl leading-tight">
        {project ? (
          <Link href={projectHref(project)} className="underline-offset-4 hover:underline">
            {item.title}
          </Link>
        ) : (
          item.title
        )}
      </h2>
      <p className="label-sm mt-1 text-fg-muted">
        Trying: {item.trying}
        {item.detail ? ` · ${item.detail}` : ""}
      </p>
    </article>
  );
}

export default function PlaygroundPage() {
  const [first, ...rest] = playground.items;

  return (
    <div className="surface-light">
      <div className="shell pt-24 pb-24">
        <h1 className="display-xl uppercase">{playground.title}</h1>
        <p className="mt-6">{playground.intro}</p>

        <div className="mt-8 grid gap-10 md:grid-cols-[1.35fr_1fr] md:gap-6">
          <Item item={first} />
          <div className="flex flex-col gap-6">
            <p className="label-sm text-fg-muted">{playground.more}</p>
            {rest.map((item) => (
              <Item key={item.title} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

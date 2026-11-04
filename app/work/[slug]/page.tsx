import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  campaign,
  getProject,
  pageSlugs,
  type Project,
  projects,
} from "@/content/projects";
import { Copy, Glance, NextProject, Picture, SectionLabel, Video } from "./parts";

export const dynamicParams = false;

export const generateStaticParams = () => pageSlugs.map((slug) => ({ slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug === campaign.slug ? campaign.title : getProject(slug)?.title };
}

const need = (slug: string) => {
  const project = projects.find((item) => item.slug === slug);
  if (!project) throw new Error(`Thiếu dự án ${slug} trong content/projects.ts`);
  return project;
};

function Campaign() {
  const film = need(campaign.heroSlug);
  const motion = campaign.motionSlugs.map(need);

  return (
    <article className="flex flex-col gap-24 pb-24">
      <div id={film.slug} className="bg-black pt-16">
        {film.video ? (
          <video
            src={film.video.src}
            poster={film.video.poster}
            controls
            playsInline
            preload="none"
            aria-label={film.video.label}
            className="max-h-[calc(100svh-4rem)] w-full"
          />
        ) : null}
      </div>

      <div className="shell flex flex-col gap-24">
        <header>
          <h1 className="display-xl uppercase">{campaign.title}</h1>
          <p className="mt-6 max-w-2xl">
            <Copy text={campaign.problem} />
          </p>
        </header>

        <Glance rows={campaign.glance} />

        <section aria-labelledby="brief">
          <h2 id="brief" className="label tracking-[0.02em] text-fg-muted">
            Brief &amp; creative decisions
          </h2>
          <p className="mt-3 max-w-3xl text-2xl font-bold tracking-[-0.03em]">
            <Copy text={campaign.brief} />
          </p>
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {campaign.decisions.map((decision) => (
              <li key={decision}>
                <Copy text={decision} />
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <SectionLabel>Video · VFX · Motion</SectionLabel>
          <div className="grid gap-4 md:grid-cols-2">
            {motion.map((project) =>
              project.video ? (
                <div key={project.slug} id={project.slug}>
                  <Video video={project.video} />
                  <p className="label-sm mt-1 text-fg-muted">{project.role}</p>
                </div>
              ) : null,
            )}
          </div>
        </section>

        <section id="key-visual-system" className="flex flex-col gap-3">
          <SectionLabel>Key Visual System · {need("key-visual-system").role}</SectionLabel>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {campaign.keyVisuals.map((image) => (
              <Picture key={image.src} image={image} sizes="(min-width: 768px) 25vw, 50vw" />
            ))}
          </div>
        </section>

        <section id="campaign-social-assets" className="flex flex-col gap-3">
          <SectionLabel>
            Campaign Social Assets · {need("campaign-social-assets").role} · In posting order
          </SectionLabel>
          <div
            role="region"
            aria-label="Campaign posts in posting order, scrollable"
            tabIndex={0}
            className="-mx-4 overflow-x-auto px-4 pb-3 md:-mx-8 md:px-8"
          >
            <ol className="flex w-max gap-4">
              {campaign.timeline.map((image) => (
                <li key={`${image.src}`} className="w-56 md:w-64">
                  <Picture image={image} sizes="16rem" />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel>Result</SectionLabel>
          <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {campaign.results.map((result) => (
              <div key={result.label} className="flex flex-col-reverse gap-2">
                <dt className="label-sm text-fg-muted">{result.label}</dt>
                <dd className="text-5xl font-bold tracking-[-0.03em]">{result.value}</dd>
              </div>
            ))}
          </dl>
          <p>{campaign.resultNote}</p>
        </section>

        <section className="flex flex-col gap-3">
          <SectionLabel>What I learned</SectionLabel>
          <p className="max-w-3xl text-2xl font-bold tracking-[-0.03em]">
            <Copy text={campaign.learned} />
          </p>
        </section>

        <NextProject project={need(campaign.nextSlug)} />
      </div>
    </article>
  );
}

function ProjectPage({ project }: { project: Project }) {
  const related = project.related?.map(need) ?? [];
  const rows = [
    { label: "Project", value: project.event },
    { label: "My role", value: project.role },
    ...(project.tools ? [{ label: "Tools", value: project.tools }] : []),
    { label: "Year", value: project.year },
  ];
  const vertical = project.videos?.every((video) => video.height > video.width);

  return (
    <article className="shell flex flex-col gap-16 pt-24 pb-24">
      {project.video ? <Video video={project.video} /> : null}

      <header>
        <h1 className="display-xl">{project.title}</h1>
        {project.note ? <p className="label mt-4 text-fg-muted">{project.note}</p> : null}
        {project.summary ? (
          <p className="mt-6 max-w-2xl">
            <Copy text={project.summary} />
          </p>
        ) : null}
      </header>

      {project.videos ? (
        <div className={`grid gap-4 ${vertical ? "max-w-3xl md:grid-cols-2" : ""}`}>
          {project.videos.map((video) => (
            <Video key={video.src} video={video} />
          ))}
        </div>
      ) : null}

      {project.images ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {project.images.map((image) => (
            <Picture key={image.src} image={image} sizes="(min-width: 768px) 33vw, 50vw" />
          ))}
        </div>
      ) : null}

      <Glance rows={rows} />

      {project.learned ? (
        <section className="flex flex-col gap-3">
          <SectionLabel>What I learned</SectionLabel>
          <p className="max-w-3xl text-2xl font-bold tracking-[-0.03em]">
            <Copy text={project.learned} />
          </p>
        </section>
      ) : null}

      {related.map((item) => (
        <NextProject key={item.slug} project={item} />
      ))}
    </article>
  );
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (slug !== campaign.slug && (!project || project.partOf)) notFound();

  return (
    <div className="surface-dark">
      {slug === campaign.slug ? <Campaign /> : <ProjectPage project={project as Project} />}
    </div>
  );
}

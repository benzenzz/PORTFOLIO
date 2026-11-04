import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getProject, projectHref } from "@/content/projects";
import { about } from "@/content/site";

export const metadata: Metadata = { title: "About" };

const pending = (text: string) => (text.startsWith("[") ? "text-fg-muted" : "");

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="label border-b border-line pb-1 tracking-[0.02em] text-fg-muted">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-4 border-b border-line py-3">
      <dt className="label-sm pt-1 text-fg-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="surface-dark">
      <div className="shell grid gap-10 pt-24 pb-24 md:grid-cols-[2fr_3fr] md:gap-8">
        <div className="md:sticky md:top-24 md:self-start">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={about.portrait}
              alt="Portrait of Demi Phan"
              fill
              priority
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover object-[62%_50%]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-12">
          <header>
            <h1 className={`text-[clamp(1.75rem,3.4vw,3rem)] leading-tight ${pending(about.statement)}`}>
              {about.statement}
            </h1>
            <div className="mt-6 flex flex-col gap-1">
              {about.bio.map((line) => (
                <p key={line} className={pending(line)}>
                  {line}
                </p>
              ))}
            </div>
          </header>

          <Block title="Experience">
            <dl>
              {about.experience.map((item) => (
                <Row key={item.what} label={item.when}>
                  {item.what}
                </Row>
              ))}
            </dl>
          </Block>

          <Block title="Awards">
            <dl>
              {about.awards.map((item) => (
                <Row key={item.what} label={item.when}>
                  {item.what}
                </Row>
              ))}
            </dl>
          </Block>

          <Block title="Capabilities">
            <dl>
              {about.capabilities.map((item) => {
                const project = getProject(item.slug);
                return project ? (
                  <Row key={item.skill} label={item.skill}>
                    Proof:{" "}
                    <Link href={projectHref(project)} className="underline underline-offset-4 hover:text-accent">
                      {project.title}
                    </Link>
                  </Row>
                ) : null;
              })}
            </dl>
          </Block>

          <Block title="Tools">
            <p className="pt-3">{about.tools}</p>
          </Block>

          <Block title="How I work">
            <p className={`pt-3 ${pending(about.howIWork)}`}>{about.howIWork}</p>
          </Block>

          <Block title="Remote info">
            <dl>
              {about.remote.map((item) => (
                <Row key={item.label} label={item.label}>
                  {item.value}
                </Row>
              ))}
            </dl>
          </Block>
        </div>
      </div>
    </div>
  );
}

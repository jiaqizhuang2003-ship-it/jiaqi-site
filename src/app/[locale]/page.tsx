import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { HeroTitle } from "@/components/HeroTitle";
import { ProjectRow } from "@/components/ProjectRow";
import { Reveal } from "@/components/Reveal";
import { WritingRow } from "@/components/WritingRow";
import { getAllProjects, getAllWriting } from "@/lib/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const home = await getTranslations("home");
  const common = await getTranslations("common");
  const projects = getAllProjects().slice(0, 3);
  const posts = getAllWriting().slice(0, 3);

  return (
    <div className="space-y-24">
      <section className="space-y-6">
        <Reveal>
          <HeroTitle text={home("description")} />
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-2xl text-[14px] leading-7 text-secondary">
            {home("intro")}
          </p>
        </Reveal>
      </section>

      <Reveal delay={0.14}>
        <section aria-labelledby="selected-work" className="space-y-5">
          <div className="flex items-center justify-between">
            <h2
              id="selected-work"
              className="font-mono text-[11px] uppercase leading-5 tracking-[0.08em] text-muted"
            >
              {common("selectedWork")}
            </h2>
            <Link href="/projects" className="inline-link text-[12px]">
              {common("allProjects")}
            </Link>
          </div>
          <div className="space-y-1">
            {projects.map((project) => (
              <ProjectRow key={project.slug} project={project} />
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.2}>
        <section aria-labelledby="recent-writing" className="space-y-5">
          <div className="flex items-center justify-between">
            <h2
              id="recent-writing"
              className="font-mono text-[11px] uppercase leading-5 tracking-[0.08em] text-muted"
            >
              {common("recentWriting")}
            </h2>
            <Link href="/writing" className="inline-link text-[12px]">
              {common("allWriting")}
            </Link>
          </div>
          <div className="space-y-1">
            {posts.map((post) => (
              <WritingRow key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.26}>
        <section aria-labelledby="now" className="space-y-3">
          <h2
            id="now"
            className="font-mono text-[11px] uppercase leading-5 tracking-[0.08em] text-muted"
          >
            {common("now")}
          </h2>
          <p className="text-[13px] leading-7 text-secondary">{home("now")}</p>
        </section>
      </Reveal>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { MdxContent } from "@/components/MdxContent";
import { getAllProjects, getProject } from "@/lib/content";

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const common = await getTranslations("common");

  return (
    <article className="space-y-12">
      <header className="space-y-6">
        <Link href="/projects" className="inline-link text-[12px]">
          {common("backProjects")}
        </Link>
        <div className="space-y-3">
          <p className="font-mono text-[11px] leading-5 text-muted">
            {project.year} / {project.status}
          </p>
          <h1 className="text-[19px] font-medium leading-8 tracking-[-0.015em] text-primary">
            {project.title}
          </h1>
          <p className="max-w-2xl text-[14px] leading-7 text-secondary">
            {project.summary}
          </p>
        </div>
        <dl className="grid gap-3 border-y py-5 text-[12px] sm:grid-cols-3">
          <div>
            <dt className="font-mono text-[11px] text-muted">Role</dt>
            <dd className="mt-1 text-secondary">{project.role}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] text-muted">Stack</dt>
            <dd className="mt-1 text-secondary">{project.stack.join(", ")}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] text-muted">Status</dt>
            <dd className="mt-1 text-secondary">{project.status}</dd>
          </div>
        </dl>
      </header>
      <MdxContent source={project.content} />
      {project.links ? (
        <section className="space-y-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
            {common("links")}
          </h2>
          <div className="flex flex-wrap gap-3 text-[13px]">
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-link"
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

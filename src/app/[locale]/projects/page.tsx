import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Carousel } from "@/components/Carousel";
import { Link } from "@/i18n/routing";
import { getAllProjects } from "@/lib/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("projects");
  const common = await getTranslations("common");
  const projects = getAllProjects();

  return (
    <Carousel ariaLabel={t("deckLabel")} hint={common("carouselHint")}>
      {projects.map((project) => (
        <Link
          key={project.slug}
          href={`/projects/${project.slug}`}
          className="deck-card deck-card-link"
        >
          <span className="deck-card-kicker">{project.year}</span>
          <span className="deck-card-title">{project.title}</span>
          <span className="deck-card-summary">{project.summary}</span>
          <span className="deck-card-meta">
            {project.role} / {project.status}
          </span>
          <span className="deck-card-arrow" aria-hidden="true">
            -&gt;
          </span>
        </Link>
      ))}
    </Carousel>
  );
}

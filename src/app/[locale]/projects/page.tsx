import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectRow } from "@/components/ProjectRow";
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
  const projects = getAllProjects();

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="text-[17px] font-medium leading-8 tracking-[-0.015em] text-primary">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-[14px] leading-7 text-secondary">
          {t("intro")}
        </p>
      </header>
      <div className="space-y-1">
        {projects.map((project) => (
          <ProjectRow key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeSheet, type HomeSheetContent } from "@/components/HomeSheet";

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
  const nav = await getTranslations("nav");
  const projects = await getTranslations("projects");

  const content: HomeSheetContent = {
    srTitle: home("sheet.srTitle"),
    introSubtitle: home("sheet.introSubtitle"),
    introLines: [
      { text: home("sheet.intro1") },
      { text: home("sheet.intro2"), offset: true },
      { text: home("sheet.intro3") },
      { text: home("sheet.intro4"), offset: true },
    ],
    frames: [
      {
        kind: "slide",
        title: nav("work"),
        label: home("sheet.workLabel"),
        href: "/work",
        icon: "work",
      },
      {
        kind: "slide",
        title: projects("title"),
        label: home("sheet.projectsLabel"),
        href: "/projects",
        icon: "projects",
      },
      {
        kind: "slide",
        title: nav("writing"),
        label: home("sheet.writingLabel"),
        href: "/writing",
        icon: "writing",
      },
      {
        kind: "slide",
        title: nav("about"),
        label: home("sheet.aboutLabel"),
        href: "/about",
        icon: "about",
      },
      {
        kind: "contact",
        label: home("sheet.contactLabel"),
        email: home("sheet.email"),
        copied: home("sheet.copied"),
        copyAnnouncement: home("sheet.copyAnnouncement"),
        links: {
          twitter: home("sheet.twitter"),
          yearCurrent: "2026",
          yearPrevious: "2025",
          github: home("sheet.github"),
        },
      },
    ],
  };

  return <HomeSheet content={content} />;
}

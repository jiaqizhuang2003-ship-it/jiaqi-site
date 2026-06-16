import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("about");

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="text-[17px] font-medium leading-8 tracking-[-0.015em] text-primary">
          {t("title")}
        </h1>
      </header>
      <div className="grid gap-10 sm:grid-cols-[160px_1fr]">
        <div>
          {/* TODO: replace with portrait at /portrait.png */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/portrait.png"
            alt={t("portraitAlt")}
            className="aspect-square w-40 border object-cover"
          />
        </div>
        <div className="space-y-5 text-[14px] leading-7 text-secondary">
          <p>{t("intro1")}</p>
          <p>{t("intro2")}</p>
          <p>{t("intro3")}</p>
        </div>
      </div>
    </div>
  );
}

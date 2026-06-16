import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

const links = [
  { key: "email", href: "mailto:jiaqi@example.com", label: "jiaqi@example.com" },
  { key: "github", href: "https://github.com/jiaqizhuang", label: "github.com/jiaqizhuang" },
  { key: "twitter", href: "https://x.com/jiaqizhuang", label: "x.com/jiaqizhuang" },
  {
    key: "linkedin",
    href: "https://www.linkedin.com/in/jiaqizhuang",
    label: "linkedin.com/in/jiaqizhuang",
  },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");

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
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.key} className="grid gap-1 text-[13px] sm:grid-cols-[90px_1fr]">
            <span className="font-mono text-[11px] leading-6 text-muted">
              {t(link.key)}
            </span>
            <a href={link.href} className="inline-link leading-6">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

export function LangSwitch() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const nextLocale = locale === "en" ? "zh" : "en";

  return (
    <Link
      href={pathname}
      locale={nextLocale}
      className="nav-control tabular-nums"
      aria-label={t("languageSwitch")}
    >
      {nextLocale.toUpperCase()}
    </Link>
  );
}

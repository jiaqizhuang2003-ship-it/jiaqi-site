"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { LangSwitch } from "./LangSwitch";

export function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-7 sm:px-8">
      <Link
        href="/"
        className="text-[13px] font-medium tracking-[-0.01em] text-primary transition-colors hover:text-accent focus-visible:focus-ring"
      >
        Jiaqi Zhuang
      </Link>
      <nav
        className="flex items-center gap-1.5 text-[12px] text-tertiary"
        aria-label={t("primary")}
      >
        {!isHome ? (
          <>
            <Link href="/work" className="nav-link">
              {t("work")}
            </Link>
            <Link href="/writing" className="nav-link">
              {t("writing")}
            </Link>
            <Link href="/about" className="nav-link">
              {t("about")}
            </Link>
            <Link href="/contact" className="nav-link">
              {t("contact")}
            </Link>
          </>
        ) : null}
        <LangSwitch />
      </nav>
    </header>
  );
}

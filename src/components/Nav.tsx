import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LangSwitch } from "./LangSwitch";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  const t = useTranslations("nav");

  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-7 sm:px-8">
      <Link
        href="/"
        className="text-[13px] font-medium tracking-[-0.01em] text-primary transition-colors hover:text-secondary focus-visible:focus-ring"
      >
        Jiaqi Zhuang
      </Link>
      <nav
        className="flex items-center gap-1.5 text-[12px] text-tertiary"
        aria-label={t("primary")}
      >
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
        <LangSwitch />
        <ThemeToggle />
      </nav>
    </header>
  );
}

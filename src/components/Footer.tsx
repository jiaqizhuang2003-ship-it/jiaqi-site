import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="mx-auto w-full max-w-3xl px-5 pb-10 pt-20 sm:px-8">
      <p className="font-mono text-[11px] leading-5 text-muted">
        {t("line", { year: new Date().getFullYear() })}
      </p>
    </footer>
  );
}

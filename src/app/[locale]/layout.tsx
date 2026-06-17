import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Footer } from "@/components/Footer";
import { FilmGrain } from "@/components/FilmGrain";
import { MagneticCursor } from "@/components/MagneticCursor";
import { Nav } from "@/components/Nav";
import { PageTransition } from "@/components/PageTransition";
import { routing, type Locale } from "@/i18n/routing";
import "../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    metadataBase: new URL("https://jiaqi.example.com"),
    title: {
      default: t("title"),
      template: "%s | Jiaqi Zhuang",
    },
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url:
        locale === "zh"
          ? "https://jiaqi.example.com/zh"
          : "https://jiaqi.example.com",
      siteName: "Jiaqi Zhuang",
      type: "website",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const common = messages.common as { skip: string };

  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale as Locale} messages={messages}>
          <FilmGrain />
          <MagneticCursor />
          <a href="#main" className="skip-link">
            {common.skip}
          </a>
          <div className="flex min-h-screen flex-col">
            <Nav />
            <main
              id="main"
              className="mx-auto w-full max-w-3xl flex-1 px-5 pt-14 sm:px-8 sm:pt-20"
            >
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

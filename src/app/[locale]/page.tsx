import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Carousel } from "@/components/Carousel";
import { Link } from "@/i18n/routing";

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
  const common = await getTranslations("common");
  const work = await getTranslations("work");
  const projects = await getTranslations("projects");
  const writing = await getTranslations("writing");
  const about = await getTranslations("about");
  const contact = await getTranslations("contact");

  const cards = [
    {
      title: home("introCard"),
      description: home("description"),
      body: home("intro"),
      href: null,
    },
    {
      title: nav("work"),
      description: work("description"),
      href: "/work",
    },
    {
      title: projects("title"),
      description: projects("description"),
      href: "/projects",
    },
    {
      title: writing("title"),
      description: writing("description"),
      href: "/writing",
    },
    {
      title: nav("about"),
      description: about("description"),
      href: "/about",
    },
    {
      title: nav("contact"),
      description: contact("intro"),
      href: "/contact",
    },
  ] as const;

  return (
    <Carousel ariaLabel={home("deckLabel")} hint={common("carouselHint")}>
      {cards.map((card) =>
        card.href ? (
          <Link key={card.title} href={card.href} className="deck-card deck-card-link">
            <span className="deck-card-kicker">{common("enter")}</span>
            <span className="deck-card-title">{card.title}</span>
            <span className="deck-card-summary">{card.description}</span>
            <span className="deck-card-arrow" aria-hidden="true">
              -&gt;
            </span>
          </Link>
        ) : (
          <article key={card.title} className="deck-card" tabIndex={0}>
            <span className="deck-card-kicker">{card.title}</span>
            <h1 className="deck-card-title">{card.description}</h1>
            <p className="deck-card-summary">{card.body}</p>
          </article>
        ),
      )}
    </Carousel>
  );
}

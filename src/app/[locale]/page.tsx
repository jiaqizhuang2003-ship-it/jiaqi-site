import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Carousel } from "@/components/Carousel";
import { HomeCardWidget } from "@/components/HomeCardWidget";
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
  const widgetLabels = {
    available: home("widgets.available"),
    localTime: home("widgets.localTime"),
    agents: home("widgets.agents"),
    workflows: home("widgets.workflows"),
    latestNote: home("widgets.latestNote"),
    reveal: home("widgets.reveal"),
    skills: [
      home("widgets.skills.0"),
      home("widgets.skills.1"),
      home("widgets.skills.2"),
    ],
    copied: home("widgets.copied"),
    copyEmail: home("widgets.copyEmail"),
    email: home("widgets.email"),
    github: home("widgets.github"),
    twitter: home("widgets.twitter"),
    linkedin: home("widgets.linkedin"),
  };

  const cards = [
    {
      kind: "intro",
      title: home("introCard"),
      description: home("description"),
      body: home("intro"),
      href: null,
    },
    {
      kind: "work",
      title: nav("work"),
      description: work("description"),
      href: "/work",
    },
    {
      kind: "projects",
      title: projects("title"),
      description: projects("description"),
      href: "/projects",
    },
    {
      kind: "writing",
      title: writing("title"),
      description: writing("description"),
      href: "/writing",
    },
    {
      kind: "about",
      title: nav("about"),
      description: about("description"),
      href: "/about",
    },
    {
      kind: "contact",
      title: nav("contact"),
      description: contact("intro"),
      href: "/contact",
    },
  ] as const;

  return (
    <Carousel ariaLabel={home("deckLabel")} hint={common("carouselHint")}>
      {cards.map((card) =>
        card.href ? (
          <article key={card.title} className="deck-card deck-card-link" tabIndex={0}>
            <span className="deck-card-kicker">{common("enter")}</span>
            <span className="deck-card-title">{card.title}</span>
            <span className="deck-card-summary">{card.description}</span>
            <HomeCardWidget kind={card.kind} labels={widgetLabels} />
            <Link href={card.href} className="deck-card-cta" data-cursor>
              {common("enter")}
            </Link>
            <span className="deck-card-arrow" aria-hidden="true">
              -&gt;
            </span>
          </article>
        ) : (
          <article key={card.title} className="deck-card" tabIndex={0}>
            <span className="deck-card-kicker">{card.title}</span>
            <h1 className="deck-card-title">{card.description}</h1>
            <p className="deck-card-summary">{card.body}</p>
            <HomeCardWidget kind={card.kind} labels={widgetLabels} />
          </article>
        ),
      )}
    </Carousel>
  );
}

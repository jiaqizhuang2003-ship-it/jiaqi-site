import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Carousel } from "@/components/Carousel";
import { Link } from "@/i18n/routing";
import { getAllWriting } from "@/lib/content";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "writing" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function WritingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("writing");
  const common = await getTranslations("common");
  const posts = getAllWriting();

  return (
    <Carousel ariaLabel={t("deckLabel")} hint={common("carouselHint")}>
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/writing/${post.slug}`}
          className="deck-card deck-card-link"
        >
          <time className="deck-card-kicker" dateTime={post.date}>
            {dateFormatter.format(new Date(`${post.date}T00:00:00Z`))}
          </time>
          <span className="deck-card-title">{post.title}</span>
          <span className="deck-card-summary">{post.summary}</span>
          <span className="deck-card-meta">{post.tags.join(" / ")}</span>
          <span className="deck-card-arrow" aria-hidden="true">
            -&gt;
          </span>
        </Link>
      ))}
    </Carousel>
  );
}

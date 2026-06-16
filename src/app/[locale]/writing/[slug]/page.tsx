import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { MdxContent } from "@/components/MdxContent";
import { getAllWriting, getPost } from "@/lib/content";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function generateStaticParams() {
  return getAllWriting().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function WritingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const common = await getTranslations("common");

  return (
    <article className="space-y-12">
      <header className="space-y-6">
        <Link href="/writing" className="inline-link text-[12px]">
          {common("backWriting")}
        </Link>
        <div className="space-y-3">
          <time className="font-mono text-[11px] leading-5 text-muted" dateTime={post.date}>
            {dateFormatter.format(new Date(`${post.date}T00:00:00Z`))}
          </time>
          <h1 className="text-[19px] font-medium leading-8 tracking-[-0.015em] text-primary">
            {post.title}
          </h1>
          <p className="max-w-2xl text-[14px] leading-7 text-secondary">
            {post.summary}
          </p>
        </div>
      </header>
      <MdxContent source={post.content} />
    </article>
  );
}

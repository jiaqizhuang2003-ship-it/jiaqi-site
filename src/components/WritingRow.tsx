import type { Post } from "@/lib/content";
import { Link } from "@/i18n/routing";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function WritingRow({ post }: { post: Post }) {
  return (
    <Link href={`/writing/${post.slug}`} className="group list-row">
      <time className="row-meta" dateTime={post.date}>
        {dateFormatter.format(new Date(`${post.date}T00:00:00Z`))}
      </time>
      <span className="min-w-0 flex-1">
        <span className="list-row-title block text-[14px] font-medium leading-6 tracking-[-0.01em] text-primary">
          {post.title}
        </span>
        <span className="mt-1 block text-[13px] leading-6 text-secondary">
          {post.summary}
        </span>
      </span>
      <span className="row-arrow" aria-hidden="true">
        -&gt;
      </span>
    </Link>
  );
}

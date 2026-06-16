import type { Project } from "@/lib/content";
import { Link } from "@/i18n/routing";

export function ProjectRow({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group list-row">
      <span className="row-meta">{project.year}</span>
      <span className="min-w-0 flex-1">
        <span className="list-row-title block text-[14px] font-medium leading-6 tracking-[-0.01em] text-primary">
          {project.title}
        </span>
        <span className="mt-1 block text-[13px] leading-6 text-secondary">
          {project.summary}
        </span>
        <span className="mt-2 block font-mono text-[11px] leading-5 text-muted">
          {project.role} / {project.status} / {project.stack.join(", ")}
        </span>
      </span>
      <span className="row-arrow" aria-hidden="true">
        -&gt;
      </span>
    </Link>
  );
}

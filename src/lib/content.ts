import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const contentRoot = path.join(process.cwd(), "content");

type RawMatter = Record<string, unknown>;

export type ProjectFrontmatter = {
  title: string;
  year: number;
  role: string;
  stack: string[];
  status: string;
  summary: string;
  links?: {
    label: string;
    href: string;
  }[];
};

export type WritingFrontmatter = {
  title: string;
  date: string;
  tags: string[];
  summary: string;
  draft: boolean;
};

export type Project = ProjectFrontmatter & {
  slug: string;
  content: string;
};

export type Post = WritingFrontmatter & {
  slug: string;
  content: string;
};

function readMdxFiles(directory: string) {
  const fullPath = path.join(contentRoot, directory);

  if (!fs.existsSync(fullPath)) {
    return [];
  }

  return fs
    .readdirSync(fullPath)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const source = fs.readFileSync(path.join(fullPath, file), "utf8");
      const parsed = matter(source);

      return {
        slug: file.replace(/\.mdx$/, ""),
        data: parsed.data,
        content: parsed.content,
      };
    });
}

function stringField(data: RawMatter, key: string): string {
  const value = data[key];

  if (typeof value !== "string") {
    throw new Error(`Missing string frontmatter field: ${key}`);
  }

  return value;
}

function numberField(data: RawMatter, key: string): number {
  const value = data[key];

  if (typeof value !== "number") {
    throw new Error(`Missing number frontmatter field: ${key}`);
  }

  return value;
}

function stringArrayField(data: RawMatter, key: string): string[] {
  const value = data[key];

  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`Missing string array frontmatter field: ${key}`);
  }

  return value;
}

function booleanField(data: RawMatter, key: string): boolean {
  const value = data[key];

  if (typeof value !== "boolean") {
    throw new Error(`Missing boolean frontmatter field: ${key}`);
  }

  return value;
}

function linksField(data: RawMatter): ProjectFrontmatter["links"] {
  const value = data.links;

  if (value === undefined) {
    return undefined;
  }

  if (
    !Array.isArray(value) ||
    !value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.label === "string" &&
        typeof item.href === "string",
    )
  ) {
    throw new Error("Project links must be an array of {label, href}");
  }

  return value.map((item) => ({
    label: item.label,
    href: item.href,
  }));
}

function toProject({
  slug,
  data,
  content,
}: {
  slug: string;
  data: RawMatter;
  content: string;
}): Project {
  return {
    slug,
    title: stringField(data, "title"),
    year: numberField(data, "year"),
    role: stringField(data, "role"),
    stack: stringArrayField(data, "stack"),
    status: stringField(data, "status"),
    summary: stringField(data, "summary"),
    links: linksField(data),
    content,
  };
}

function toPost({
  slug,
  data,
  content,
}: {
  slug: string;
  data: RawMatter;
  content: string;
}): Post {
  return {
    slug,
    title: stringField(data, "title"),
    date: stringField(data, "date"),
    tags: stringArrayField(data, "tags"),
    summary: stringField(data, "summary"),
    draft: booleanField(data, "draft"),
    content,
  };
}

export function getAllProjects(): Project[] {
  return readMdxFiles("projects")
    .map(toProject)
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

export function getProject(slug: string): Project | undefined {
  return getAllProjects().find((project) => project.slug === slug);
}

export function getAllWriting(): Post[] {
  return readMdxFiles("writing")
    .map(toPost)
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getAllWriting().find((post) => post.slug === slug);
}

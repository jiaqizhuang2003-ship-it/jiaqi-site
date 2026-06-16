import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import type { MDXComponents } from "mdx/types";
import { Prose } from "./Prose";

const components: MDXComponents = {
  wrapper: Prose,
};

export async function MdxContent({ source }: { source: string }) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    baseUrl: import.meta.url,
    useMDXComponents: () => components,
  });

  return <Content />;
}

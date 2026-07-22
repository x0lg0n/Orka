import { compileMDX } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { Callout } from "@/components/docs/Callout";

const mdxComponents = {
  Callout,
  h2: ({ children, ...props }: React.ComponentProps<"h2">) => (
    <h2
      className="display mt-10 mb-4 text-3xl uppercase sm:text-4xl"
      id={typeof children === "string" ? children.toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.ComponentProps<"h3">) => (
    <h3
      className="display mt-8 mb-3 text-2xl uppercase"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }: React.ComponentProps<"p">) => (
    <p className="mb-4 text-[16px] leading-8 text-night/80" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.ComponentProps<"ul">) => (
    <ul className="mb-4 list-disc pl-6 space-y-2 text-[16px] leading-7 text-night/80" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentProps<"ol">) => (
    <ol className="mb-4 list-decimal pl-6 space-y-2 text-[16px] leading-7 text-night/80" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.ComponentProps<"li">) => (
    <li className="font-bold" {...props}>
      {children}
    </li>
  ),
  table: ({ children, ...props }: React.ComponentProps<"table">) => (
    <div className="mb-6 overflow-x-auto rounded-xl border border-night/10">
      <table className="w-full border-collapse text-left text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.ComponentProps<"th">) => (
    <th className="border-b-2 border-night/10 px-4 py-3 text-xs font-black uppercase text-night/60" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.ComponentProps<"td">) => (
    <td className="border-b border-night/5 px-4 py-3 font-bold text-night/80" {...props}>
      {children}
    </td>
  ),
  pre: ({ children, ...props }: React.ComponentProps<"pre">) => (
    <pre
      className="mb-6 overflow-x-auto rounded-xl bg-night p-5 text-sm text-white/90 [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ children, className, ...props }: React.ComponentProps<"code">) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded-md bg-night/8 px-1.5 py-0.5 text-sm font-bold text-violet" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  blockquote: ({ children, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="mb-6 border-l-4 border-violet pl-4 text-night/70 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
};

export async function renderMDX(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        rehypePlugins: [rehypeHighlight, rehypeSlug],
      },
    },
  });
  return content;
}

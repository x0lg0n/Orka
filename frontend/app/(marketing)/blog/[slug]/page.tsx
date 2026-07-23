import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog-data";
import ArticleHeader from "./components/ArticleHeader";
import ArticleContent from "./components/ArticleContent";
import TableOfContents from "./components/TableOfContents";
import ReadingProgress from "./components/ReadingProgress";
import AuthorCard from "./components/AuthorCard";
import LeadCaptureCard from "./components/LeadCaptureCard";
import ResourceCard from "./components/ResourceCard";
import RelatedPosts from "./components/RelatedPosts";
import ArticleFooterCta from "./components/ArticleFooterCta";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const relatedPosts = getRelatedPosts(slug, 3);

  return (
    <>
      {/* Reading Progress */}
      <ReadingProgress />

      {/* 3-column layout */}
      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[22%_1fr_25%]">
          {/* Left sidebar — TOC (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <TableOfContents headings={post.headings} />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0">
            <ArticleHeader post={post} />
            <ArticleContent slug={slug} />
          </main>

          {/* Right sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <AuthorCard author={post.author} />
              <LeadCaptureCard />
              <ResourceCard />
            </div>
          </aside>
        </div>
      </div>

      {/* Related Posts */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <RelatedPosts posts={relatedPosts} />
      </div>

      {/* Bottom CTA */}
      <ArticleFooterCta />
    </>
  );
}

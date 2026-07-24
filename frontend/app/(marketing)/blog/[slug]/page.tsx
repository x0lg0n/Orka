import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getArticle,
  extractToc,
  getRelatedArticles,
  getPrevNext,
} from "@/lib/blogs";
import ArticleHeader from "./components/ArticleHeader";
import ArticleContent from "./components/ArticleContent";
import TableOfContents from "./components/TableOfContents";
import ReadingProgress from "./components/ReadingProgress";
import AuthorCard from "./components/AuthorCard";
import LeadCaptureCard from "./components/LeadCaptureCard";
import ResourceCard from "./components/ResourceCard";
import RelatedPosts from "./components/RelatedPosts";
import ArticleFooterCta from "./components/ArticleFooterCta";
import PrevNextNav from "./components/PrevNextNav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      tags: [article.category],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) notFound();

  const tocItems = extractToc(article);
  const relatedPosts = getRelatedArticles(slug, 3);
  const { prev, next } = getPrevNext(slug);

  return (
    <>
      {/* Reading Progress */}
      <ReadingProgress />

      {/* 3-column layout */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[22%_1fr_25%]">
          {/* Left sidebar — TOC (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <TableOfContents items={tocItems} />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0">
            <ArticleHeader post={article} />
            <ArticleContent sections={article.sections} />
            <PrevNextNav prev={prev} next={next} />
          </main>

          {/* Right sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <AuthorCard author={article.author} />
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

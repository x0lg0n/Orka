import type { BlogArticle, BlogPostMeta, TocItem } from "./types";

import { article as agenciesLoseRevenue } from "./content/agencies-lose-revenue";
import { article as aiWritesBetterProposals } from "./content/ai-writes-better-proposals";
import { article as escrowFuture } from "./content/escrow-future";
import { article as freelancerContracts } from "./content/freelancer-contracts";
import { article as agencyOnboardingChecklist } from "./content/agency-onboarding-checklist";
import { article as managingMultipleProjects } from "./content/managing-multiple-projects";
import { article as proposalVsContract } from "./content/proposal-vs-contract";
import { article as milestonePayments } from "./content/milestone-payments";
import { article as freelancerToAgency } from "./content/freelancer-to-agency";
import { article as aiHelpsAgencies } from "./content/ai-helps-agencies";
import { article as pricingStrategies } from "./content/pricing-strategies";
import { article as clientPortal } from "./content/client-portal";

export type { BlogArticle, BlogPostMeta, TocItem, SectionContent, ContentSection, ContentBlock } from "./types";

const articles: BlogArticle[] = [
  agenciesLoseRevenue,
  aiWritesBetterProposals,
  escrowFuture,
  freelancerContracts,
  agencyOnboardingChecklist,
  managingMultipleProjects,
  proposalVsContract,
  milestonePayments,
  freelancerToAgency,
  aiHelpsAgencies,
  pricingStrategies,
  clientPortal,
];

const articleMap = new Map(articles.map((a) => [a.slug, a]));

export function getArticle(slug: string): BlogArticle | undefined {
  return articleMap.get(slug);
}

export function getAllArticles(): BlogArticle[] {
  return articles;
}

export function getAllSlugs(): string[] {
  return articles.map((a) => a.slug);
}

export function getArticleMeta(slug: string): BlogPostMeta | undefined {
  const a = articleMap.get(slug);
  if (!a) return undefined;
  return {
    id: a.slug,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    coverGradient: a.coverGradient,
    category: a.category,
    author: a.author,
    readingTime: a.readingTime,
    publishedAt: a.publishedAt,
    featured: a.featured,
  };
}

export function getAllArticleMeta(): BlogPostMeta[] {
  return articles.map((a) => ({
    id: a.slug,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    coverGradient: a.coverGradient,
    category: a.category,
    author: a.author,
    readingTime: a.readingTime,
    publishedAt: a.publishedAt,
    featured: a.featured,
  }));
}

export function extractToc(article: BlogArticle): TocItem[] {
  return article.sections
    .filter((s): s is import("./types").ContentSection => "id" in s)
    .map((s) => ({
      id: s.id,
      title: s.heading,
      level: s.level,
    }));
}

export function getRelatedArticles(slug: string, limit = 3): BlogPostMeta[] {
  const current = articleMap.get(slug);
  if (!current) return [];

  const scored = articles
    .filter((a) => a.slug !== slug)
    .map((a) => {
      let score = 0;
      if (a.category === current.category) score += 10;
      if (a.featured) score += 5;
      const dateDiff =
        new Date(a.publishedAt).getTime() -
        new Date(current.publishedAt).getTime();
      score -= Math.abs(dateDiff) / (1000 * 60 * 60 * 24 * 365);
      return { meta: toMeta(a), score };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.meta);
}

export function getPrevNext(slug: string): {
  prev: BlogPostMeta | null;
  next: BlogPostMeta | null;
} {
  const idx = articles.findIndex((a) => a.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? toMeta(articles[idx - 1]) : null,
    next: idx < articles.length - 1 ? toMeta(articles[idx + 1]) : null,
  };
}

function toMeta(a: BlogArticle): BlogPostMeta {
  return {
    id: a.slug,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    coverGradient: a.coverGradient,
    category: a.category,
    author: a.author,
    readingTime: a.readingTime,
    publishedAt: a.publishedAt,
    featured: a.featured,
  };
}

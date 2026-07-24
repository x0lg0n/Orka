import type { BlogArticle, BlogPostMeta, TocItem } from "./types";

import { article as aiProposalsBetter } from "./content/ai-proposals-better";
import { article as escrowFuturePayments } from "./content/escrow-future-payments";
import { article as freelancerContractsProtect } from "./content/freelancer-contracts-protect";
import { article as managingMultipleProjects } from "./content/managing-multiple-projects";
import { article as proposalVsContractVsInvoice } from "./content/proposal-vs-contract-vs-invoice";
import { article as milestonePaymentsTrust } from "./content/milestone-payments-trust";
import { article as freelancerToAgency } from "./content/freelancer-to-agency";
import { article as aiHelpsWinClients } from "./content/ai-helps-win-clients";
import { article as clientManagementMistakes } from "./content/client-management-mistakes";
import { article as agencyOnboardingChecklist } from "./content/agency-onboarding-checklist";
import { article as pricingServices } from "./content/pricing-services";
import { article as clientPortalBenefits } from "./content/client-portal-benefits";
import { article as getPaidFaster } from "./content/get-paid-faster";
import { article as latePayments } from "./content/late-payments";
import { article as invoicingPractices } from "./content/invoicing-practices";
import { article as milestoneVsHourly } from "./content/milestone-vs-hourly";
import { article as escrowVsUpfront } from "./content/escrow-vs-upfront";
import { article as crossBorderPayments } from "./content/cross-border-payments";
import { article as invoiceInternational } from "./content/invoice-international";
import { article as bestAiTools } from "./content/best-ai-tools";
import { article as aiSavesHours } from "./content/ai-saves-hours";
import { article as betterProposalsAi } from "./content/better-proposals-ai";
import { article as aiVsManualProposals } from "./content/ai-vs-manual-proposals";
import { article as scaleAgency } from "./content/scale-agency";
import { article as clientRelationships } from "./content/client-relationships";
import { article as difficultClients } from "./content/difficult-clients";
import { article as clientCommunication } from "./content/client-communication";
import { article as reduceScopeCreep } from "./content/reduce-scope-creep";

export type { BlogArticle, BlogPostMeta, TocItem, SectionContent, ContentSection, ContentBlock } from "./types";

const articles: BlogArticle[] = [
  aiProposalsBetter,
  escrowFuturePayments,
  freelancerContractsProtect,
  managingMultipleProjects,
  proposalVsContractVsInvoice,
  milestonePaymentsTrust,
  freelancerToAgency,
  aiHelpsWinClients,
  clientManagementMistakes,
  agencyOnboardingChecklist,
  pricingServices,
  clientPortalBenefits,
  getPaidFaster,
  latePayments,
  invoicingPractices,
  milestoneVsHourly,
  escrowVsUpfront,
  crossBorderPayments,
  invoiceInternational,
  bestAiTools,
  aiSavesHours,
  betterProposalsAi,
  aiVsManualProposals,
  scaleAgency,
  clientRelationships,
  difficultClients,
  clientCommunication,
  reduceScopeCreep,
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
    image: a.image,
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
    image: a.image,
    category: a.category,
    author: a.author,
    readingTime: a.readingTime,
    publishedAt: a.publishedAt,
    featured: a.featured,
  };
}

export interface BlogAuthor {
  name: string;
  initials: string;
  role: string;
}

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "callout"; variant: "insight" | "best-practice" | "tip" | "warning" | "example"; text: string }
  | { type: "quote"; text: string };

export interface ContentSection {
  id: string;
  heading: string;
  level: 2 | 3;
  blocks: ContentBlock[];
}

export type SectionContent = ContentBlock | ContentSection;

export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  category: string;
  author: BlogAuthor;
  readingTime: string;
  publishedAt: string;
  coverGradient: string;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  sections: SectionContent[];
}

export interface TocItem {
  id: string;
  title: string;
  level: 2 | 3;
}

export interface BlogPostMeta {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverGradient: string;
  category: string;
  author: BlogAuthor;
  readingTime: string;
  publishedAt: string;
  featured: boolean;
}

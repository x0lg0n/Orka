export interface BlogAuthor {
  name: string;
  initials: string;
  role: string;
}

export interface BlogPost {
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

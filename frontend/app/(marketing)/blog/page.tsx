"use client";

import { useState, useMemo } from "react";
import BlogHero from "./components/BlogHero";
import BlogGrid from "./components/BlogGrid";
import BlogSidebar from "./components/BlogSidebar";
import Pagination from "./components/Pagination";
import BlogCta from "./components/BlogCta";
import SortDropdown, { type SortValue } from "./components/SortDropdown";
import {
  getPostsByCategory,
} from "@/lib/blog-data";

const POSTS_PER_PAGE = 9;

function sortPosts(posts: ReturnType<typeof getPostsByCategory>, sort: SortValue) {
  const sorted = [...posts];
  switch (sort) {
    case "oldest":
      return sorted.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    case "popular":
      return sorted.sort((a, b) => (a.featured ? -1 : 1) - (b.featured ? -1 : 1));
    case "reading-time":
      return sorted.sort((a, b) => parseInt(a.readingTime) - parseInt(b.readingTime));
    case "latest":
    default:
      return sorted.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("latest");

  const filtered = useMemo(() => {
    const posts = getPostsByCategory(activeCategory);
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [activeCategory, searchQuery]);

  const sorted = useMemo(() => sortPosts(filtered, sort), [filtered, sort]);

  const totalPages = Math.ceil(sorted.length / POSTS_PER_PAGE);
  const paginated = sorted.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-paper">
      <BlogHero />

      {/* Two-column layout: Sidebar + Content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <BlogSidebar
            activeCategory={activeCategory}
            onCategoryChange={(cat) => {
              setActiveCategory(cat);
              setCurrentPage(1);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Above-grid bar: count + sort */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-bold text-night/50">
                Showing {filtered.length} {filtered.length === 1 ? "article" : "articles"}
              </p>
              <SortDropdown value={sort} onChange={setSort} />
            </div>

            {/* Blog Grid */}
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-night/10 bg-white p-12 text-center">
                <p className="text-md font-bold text-night/50">
                  No articles found matching &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="mt-3 text-base font-bold text-violet hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                <BlogGrid posts={paginated} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </section>

      <BlogCta />
    </main>
  );
}

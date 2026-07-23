"use client";

import { useState, useMemo } from "react";
import BlogHero from "./components/BlogHero";
import CategoryFilter from "./components/CategoryFilter";
import FeaturedCard from "./components/FeaturedCard";
import BlogGrid from "./components/BlogGrid";
import BlogSidebar from "./components/BlogSidebar";
import Pagination from "./components/Pagination";
import BlogCta from "./components/BlogCta";
import BlogSearch from "./components/BlogSearch";
import {
  getFeaturedPost,
  getPostsByCategory,
} from "@/lib/blog-data";

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const featured = getFeaturedPost();

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

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-paper">
      <BlogHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <FeaturedCard post={featured} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <BlogSearch value={searchQuery} onChange={setSearchQuery} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={(cat) => {
            setActiveCategory(cat);
            setCurrentPage(1);
          }}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
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
          <BlogSidebar />
        </div>
      </section>

      <BlogCta />
    </main>
  );
}

"use client";

import { useState } from "react";
import { BlogHero } from "./components/BlogHero";
import { CategoryFilter } from "./components/CategoryFilter";
import { FeaturedCard } from "./components/FeaturedCard";
import { BlogGrid } from "./components/BlogGrid";
import { BlogSidebar } from "./components/BlogSidebar";
import { Pagination } from "./components/Pagination";
import { BlogCta } from "./components/BlogCta";
import {
  categories,
  getFeaturedPost,
  getPostsByCategory,
} from "@/lib/blog-data";

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const featured = getFeaturedPost();
  const filtered = getPostsByCategory(activeCategory);
  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-paper">
      <BlogHero />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <FeaturedCard post={featured} />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <CategoryFilter
          categories={[...categories]}
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
            <BlogGrid posts={paginated} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
          <BlogSidebar />
        </div>
      </section>

      <BlogCta />
    </main>
  );
}

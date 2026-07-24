import type { BlogPost } from "./types";
import BlogCard from "./BlogCard";

export default function BlogGrid({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-night/10 bg-white p-12 text-center">
        <p className="text-sm font-bold text-night/40">
          No articles found in this category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}

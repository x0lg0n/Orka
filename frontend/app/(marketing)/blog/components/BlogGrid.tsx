import type { BlogPost } from "./types";
import BlogCard from "./BlogCard";

export default function BlogGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}

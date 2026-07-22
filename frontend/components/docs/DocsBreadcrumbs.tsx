import Link from "next/link";
import { getDocBySlug, getSectionForDoc } from "@/lib/docs/config";

interface DocsBreadcrumbsProps {
  slug: string;
}

export default function DocsBreadcrumbs({ slug }: DocsBreadcrumbsProps) {
  const doc = getDocBySlug(slug);
  const section = getSectionForDoc(slug);
  const parts = slug.split("/");

  const items: { label: string; href?: string }[] = [
    { label: "Home", href: "/docs" },
  ];

  if (section) {
    const parentItem = section.items.find((item) => item.slug === parts[0]);
    if (parentItem) {
      items.push({
        label: parentItem.title,
        href: `/docs/${parentItem.slug}`,
      });
    }
  }

  if (doc) {
    items.push({ label: doc.title });
  }

  return (
    <nav className="mb-6 flex items-center text-sm text-night/50">
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          {index > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-night/80 hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-night/70">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

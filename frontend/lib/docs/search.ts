import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface SearchEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  url: string;
}

export function generateSearchIndex(): SearchEntry[] {
  const docsDir = path.join(process.cwd(), "content/docs");
  
  function readMdxFiles(dir: string, category: string = ""): SearchEntry[] {
    const entries: SearchEntry[] = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Recurse into subdirectory
        const subCategory = category ? `${category}/${item}` : item;
        entries.push(...readMdxFiles(itemPath, subCategory));
      } else if (item.endsWith(".mdx")) {
        const slug = path.relative(docsDir, itemPath).replace(/\.mdx$/, "").replace(/\\/g, "/");
        const raw = fs.readFileSync(itemPath, "utf-8");
        const { data, content } = matter(raw);

        const plainText = content
          .replace(/```[\s\S]*?```/g, "")
          .replace(/<[^>]+>/g, "")
          .replace(/[#*_`~\[\]]/g, "")
          .replace(/\n+/g, " ")
          .trim()
          .slice(0, 300);

        entries.push({
          id: slug,
          title: data.title || slug,
          category: data.category || category || "Uncategorized",
          description: data.description || "",
          content: plainText,
          url: `/docs/${slug}`,
        });
      }
    }
    
    return entries;
  }
  
  return readMdxFiles(docsDir);
}

export function writeSearchIndex(): void {
  const entries = generateSearchIndex();
  const outDir = path.join(process.cwd(), "public");
  const outPath = path.join(outDir, "search-index.json");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outPath, JSON.stringify(entries, null, 2));
  console.log(`Search index written: ${entries.length} entries → ${outPath}`);
}

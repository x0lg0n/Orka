import DocsSidebar from "@/components/docs/DocsSidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-7xl px-4 py-8 md:px-8 lg:px-12">
      <DocsSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

import DocsNavbar from "@/components/docs/DocsNavbar";
import Footer from "@/components/Footer";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <DocsNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

import { Card } from "@/components/ui/card";

export default function WorkspaceBillingPage() {
  return (
    <main className="flex-1 px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[760px]">
        <h1 className="text-[26px] font-extrabold tracking-[-0.03em]">Billing</h1>
        <Card className="mt-6 border-border bg-panel p-8 text-center">
          <p className="text-sm font-bold text-white/50">Billing is coming soon.</p>
        </Card>
      </div>
    </main>
  );
}

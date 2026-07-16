"use client";

import { use, useState } from "react";
import { Plus } from "lucide-react";
import HeroBanner from "./components/HeroBanner";
import QuickActions from "./components/QuickActions";
import RecentConversations from "./components/RecentConversations";
import AskOrka from "./components/AskOrka";
import AIInsights from "./components/AIInsights";
import PopularPrompts from "./components/PopularPrompts";

export default function AiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: _slug } = use(params);
  const [userName] = useState("Siddhartha");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">AI Copilot</h1>
          <span className="rounded-full bg-[#7c3aed]/10 px-2 py-0.5 text-[10px] font-semibold text-[#7c3aed]">
            Beta
          </span>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white hover:bg-[#6d28d9]">
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>
      <p className="text-sm text-gray-500">
        Your AI partner for smarter project and business management.
      </p>

      <HeroBanner userName={userName} />

      <QuickActions />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RecentConversations />
          <AskOrka />
        </div>
        <div className="space-y-6">
          <AIInsights />
          <PopularPrompts />
        </div>
      </div>
    </div>
  );
}

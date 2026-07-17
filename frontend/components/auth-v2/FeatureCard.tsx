"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#9474ff]/15 text-[#9474ff]">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-white">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-white/50">{description}</p>
      </div>
    </motion.div>
  );
}

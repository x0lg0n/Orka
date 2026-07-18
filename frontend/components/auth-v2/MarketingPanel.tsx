"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Shield, Bot, CreditCard, FolderKanban, Quote } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Proposals",
    description: "Create winning proposals in seconds with AI Copilot.",
  },
  {
    icon: CreditCard,
    title: "Secure Escrow Payments",
    description: "Built on Stellar. Funds are safe until milestones are approved.",
  },
  {
    icon: FolderKanban,
    title: "Smart Project Management",
    description: "Everything you need to deliver projects and grow your business.",
  },
];

export function MarketingPanel() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#030914] p-6 lg:p-8">
      {/* ORKA Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5"
      >
        <Image src="/Logo/LOGO.svg" alt="ORKA" width={32} height={32} className="size-8" />
        <span className="display text-2xl tracking-wide text-white">ORKA</span>
      </motion.div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1"
      >
        <Sparkles size={12} className="text-[#9474ff]" />
        <span className="text-[11px] font-semibold text-white/70">Built for modern service businesses</span>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-5"
      >
        <h1 className="text-[28px] font-bold leading-[1.15] text-white lg:text-[32px]">
          Manage projects.
          <br />
          Close deals.
          <br />
          <span className="text-[#9474ff]">Get paid securely.</span>
        </h1>
        <p className="mt-3 max-w-[320px] text-[13px] leading-relaxed text-white/50">
          Orka helps freelancers and agencies deliver exceptional work and get paid on time, every time.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-5 flex flex-col gap-2"
      >
        {features.map((f) => (
          <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
        ))}
      </motion.div>

      {/* Testimonial */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
      >
        <Quote size={20} className="mb-2 text-[#9474ff]/40" />
        <p className="text-[12px] leading-relaxed text-white/60 italic">
          &ldquo;Orka has completely transformed how we manage client work and get paid. The escrow feature gives our clients so much confidence.&rdquo;
        </p>
        <div className="mt-3 flex items-center gap-2.5">
          <div className="size-7 rounded-full bg-gradient-to-br from-[#9474ff] to-[#ff8a22]" />
          <div>
            <p className="text-[11px] font-bold text-white">Sarah Chen</p>
            <p className="text-[10px] text-white/40">Founder, PixelCraft</p>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Illustration Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex-1 overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#0a1c2e] to-[#030914] p-4"
      >
        <div className="flex items-center gap-2 text-[11px] text-white/30">
          <div className="size-2 rounded-full bg-[#22bd93]" />
          Dashboard Preview
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/5 p-2.5">
            <p className="text-[9px] text-white/30">Projects</p>
            <p className="text-[14px] font-bold text-white">12</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2.5">
            <p className="text-[9px] text-white/30">Revenue</p>
            <p className="text-[14px] font-bold text-[#22bd93]">$24.5k</p>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-4 flex items-center gap-2 text-[11px] text-white/40"
      >
        <Shield size={12} />
        Trusted by 2,500+ businesses worldwide
      </motion.div>
    </div>
  );
}

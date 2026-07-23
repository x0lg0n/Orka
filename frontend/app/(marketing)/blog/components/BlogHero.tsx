"use client";

import { Search } from "lucide-react";

function FloatingCard({
  label,
  badge,
  badgeColor,
  icon,
  iconColor,
  style,
}: {
  label: string;
  badge: string;
  badgeColor: string;
  icon: string;
  iconColor: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="absolute hidden rounded-xl border border-night/8 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] lg:block"
      style={style}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid size-9 place-items-center rounded-lg ${iconColor}`}
        >
          {icon === "file" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          )}
          {icon === "shield" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          )}
          {icon === "wallet" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 10H2" />
            </svg>
          )}
        </span>
        <div>
          <p className="text-[13px] font-bold text-night">{label}</p>
          <p className={`text-[11px] font-bold ${badgeColor}`}>{badge}</p>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      className="absolute hidden rounded-xl border border-night/8 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] lg:block"
      style={style}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-bold text-night">Q2 Website Redesign</p>
        <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-bold text-teal">
          USDC 9,000
        </span>
      </div>
      <p className="mb-3 text-[11px] font-bold text-night/40">Milestones</p>
      <div className="space-y-2">
        {[
          { name: "Research & Strategy", amount: "USDC 1,500", done: true },
          { name: "Design & Prototyping", amount: "USDC 2,400", done: true },
          { name: "Development", amount: "USDC 3,300", done: false },
          { name: "Testing & Launch", amount: "USDC 1,700", done: false },
        ].map((m) => (
          <div key={m.name} className="flex items-center gap-2">
            <span
              className={`size-4 rounded-full border-2 ${m.done ? "border-teal bg-teal" : "border-night/20"} flex items-center justify-center`}
            >
              {m.done && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span className="flex-1 text-[11px] font-bold text-night/70">
              {m.name}
            </span>
            <span className="text-[10px] font-bold text-night/40">
              {m.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BlogHero({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-b-[42px] bg-night px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
      {/* Background blurs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-violet/8 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-teal/6 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl pt-16 pb-4 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
        {/* Left: Text */}
        <div>
          <span className="inline-block rounded-full border border-violet/30 bg-violet/15 px-4 py-1.5 text-[13px] font-bold text-violet">
            ORKA JOURNAL
          </span>
          <h1 className="display mx-auto mt-6 max-w-xl text-[2.6rem] uppercase leading-[1.05] text-white sm:text-[4rem] md:text-[5rem] lg:mx-0">
            Insights for Modern Service Businesses
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-normal leading-7 text-white/70 sm:text-lg sm:leading-8 lg:mx-0">
            Actionable insights, templates, and strategies to help agencies and
            freelancers run smarter and grow faster.
          </p>
          <div className="mx-auto mt-8 max-w-xl lg:mx-0">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-white/8 py-4 pl-11 pr-4 text-sm text-white placeholder:text-white/40 transition-colors focus:border-violet/50 focus:bg-white/12 focus:outline-none focus:ring-2 focus:ring-violet/30"
              />
            </div>
          </div>
        </div>

        {/* Right: Floating cards */}
        <div className="relative hidden h-[400px] lg:block">
          <FloatingCard
            label="Proposals"
            badge="AI Generated"
            badgeColor="text-violet"
            icon="file"
            iconColor="bg-violet/10 text-violet"
            style={{ top: 20, left: 40 }}
          />
          <FloatingCard
            label="Escrow"
            badge="Secured"
            badgeColor="text-teal"
            icon="shield"
            iconColor="bg-teal/10 text-teal"
            style={{ top: 160, left: 0 }}
          />
          <FloatingCard
            label="Payments"
            badge="On Track"
            badgeColor="text-orange"
            icon="wallet"
            iconColor="bg-orange/10 text-orange"
            style={{ top: 300, left: 60 }}
          />
          <ProjectCard style={{ top: 40, right: 0, width: 280 }} />
        </div>
      </div>
    </section>
  );
}

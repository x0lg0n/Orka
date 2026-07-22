"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  FileText,
  Menu,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type MenuLink = {
  label: string;
  description: string;
  href: string;
  icon: typeof Blocks;
};

type MenuGroup = {
  id: string;
  label: string;
  eyebrow: string;
  heading: string;
  links: MenuLink[];
  featured: { label: string; title: string; copy: string; href: string };
};

const menuGroups: MenuGroup[] = [
  {
    id: "product",
    label: "Product",
    eyebrow: "The operating system",
    heading: "Keep client work and payment records in one flow.",
    links: [
      { label: "Proposals & agreements", description: "Turn an approved scope into a shared source of truth.", href: "/services#proposals", icon: FileText },
      { label: "Milestone workflow", description: "Coordinate delivery, evidence, reviews, and approvals.", href: "/services#milestones", icon: Blocks },
      { label: "Payment records", description: "See every funded, pending, and settled milestone clearly.", href: "/services#payments", icon: WalletCards },
      { label: "ORKA AI", description: "Get help drafting, summarising, and moving work forward.", href: "/services#ai", icon: Sparkles },
    ],
    featured: { label: "See the service model", title: "Work is easier to trust when everyone sees the same next step.", copy: "Explore the services ORKA brings together for global client teams.", href: "/services" },
  },
  {
    id: "solutions",
    label: "Solutions",
    eyebrow: "Built around real roles",
    heading: "A cleaner handoff for everyone involved in a project.",
    links: [
      { label: "Agencies & studios", description: "Run client work with a more dependable operating rhythm.", href: "/services#agencies", icon: BriefcaseBusiness },
      { label: "Independent experts", description: "Make scope, approvals, and payment status easier to follow.", href: "/services#independents", icon: FileText },
      { label: "Clients", description: "Review a project through one clear, shared client portal.", href: "/services#clients", icon: CircleHelp },
    ],
    featured: { label: "Start with ORKA", title: "Bring order to the project before delivery begins.", copy: "Join the early access list for the ORKA workspace.", href: "/#waitlist" },
  },
  {
    id: "resources",
    label: "Resources",
    eyebrow: "Learn and decide",
    heading: "Everything you need to understand the ORKA approach.",
    links: [
      { label: "Documentation", description: "Product notes, setup guidance, and practical references.", href: "/docs", icon: BookOpen },
      { label: "Services", description: "A clear overview of the work ORKA helps coordinate.", href: "/services", icon: Blocks },
      { label: "Terms & conditions", description: "The terms governing access to ORKA.", href: "/terms", icon: FileText },
    ],
    featured: { label: "For early teams", title: "Help shape an operating system for global client work.", copy: "We are inviting teams that care about a calmer, clearer project lifecycle.", href: "/#waitlist" },
  },
];

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuId = useId();

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileSection(null);
  };

  return (
    <header ref={navRef} className="relative z-50 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <nav aria-label="Main navigation" className="flex h-[72px] items-center border-b border-white/12">
        <Link href="/" className="flex items-center gap-2.5 text-white" aria-label="ORKA home">
          <Image src="/Logo/LOGO.svg" alt="" width={32} height={32} className="size-8" priority />
          <span className="text-[1.5rem] font-bold tracking-[-0.04em]">ORKA</span>
        </Link>

        <div className="ml-10 hidden h-full items-center gap-1 lg:flex">
          {menuGroups.map((group) => {
            const isOpen = openMenu === group.id;
            return (
              <button
                key={group.id}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${menuId}-${group.id}`}
                onClick={() => setOpenMenu(isOpen ? null : group.id)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-white/72 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
              >
                {group.label}
                <ChevronDown size={15} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>
            );
          })}
          <Link href="/pricing" className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-white/72 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet">
            Pricing
          </Link>
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Link href="/signin" className="rounded-md px-3 py-2 text-sm font-medium text-white/78 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet">
            Sign in
          </Link>
          <Link href="/#waitlist" className="inline-flex items-center gap-2 rounded-md bg-violet px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#a78cff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Join waitlist <ArrowRight size={15} />
          </Link>
        </div>

        <button type="button" className="ml-auto grid size-10 place-items-center rounded-md text-white lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet" aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}>
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {openMenu && (
        <div id={`${menuId}-${openMenu}`} className="absolute left-4 right-4 top-[72px] hidden border border-white/12 bg-[#061a2b] shadow-[0_22px_60px_rgba(0,0,0,0.28)] lg:block">
          {menuGroups.filter((group) => group.id === openMenu).map((group) => (
            <div key={group.id} className="grid grid-cols-[0.78fr_1.55fr_0.72fr] gap-10 p-8 xl:p-10">
              <div className="border-r border-white/10 pr-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">{group.eyebrow}</p>
                <p className="mt-4 max-w-[16rem] text-xl font-medium leading-7 text-white">{group.heading}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {group.links.map(({ label, description, href, icon: Icon }) => (
                  <Link key={label} href={href} onClick={closeAll} className="group rounded-md p-3 transition-colors hover:bg-white/7 focus-visible:outline-2 focus-visible:outline-violet">
                    <Icon size={18} className="text-violet transition-transform duration-200 group-hover:translate-x-0.5" />
                    <p className="mt-3 text-sm font-semibold text-white">{label}</p>
                    <p className="mt-1 text-sm leading-5 text-white/56">{description}</p>
                  </Link>
                ))}
              </div>
              <Link href={group.featured.href} onClick={closeAll} className="group flex flex-col justify-between bg-white px-5 py-5 text-night transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-violet">{group.featured.label}</p>
                  <p className="mt-4 text-lg font-semibold leading-6">{group.featured.title}</p>
                  <p className="mt-3 text-sm leading-5 text-night/68">{group.featured.copy}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">Explore <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" /></span>
              </Link>
            </div>
          ))}
        </div>
      )}

      {mobileOpen && (
        <div className="absolute left-4 right-4 top-[72px] border border-white/12 bg-[#061a2b] p-3 shadow-[0_22px_60px_rgba(0,0,0,0.3)] lg:hidden">
          {menuGroups.map((group) => {
            const expanded = mobileSection === group.id;
            return (
              <div key={group.id} className="border-b border-white/10 last:border-0">
                <button type="button" onClick={() => setMobileSection(expanded ? null : group.id)} aria-expanded={expanded} className="flex w-full items-center justify-between px-2 py-4 text-left text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-violet">
                  {group.label}<ChevronDown size={17} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                </button>
                {expanded && <div className="space-y-1 pb-3">{group.links.map(({ label, href }) => <Link key={label} href={href} onClick={closeAll} className="block rounded-md px-3 py-2 text-sm text-white/68 hover:bg-white/7 hover:text-white focus-visible:outline-2 focus-visible:outline-violet">{label}</Link>)}</div>}
              </div>
            );
          })}
          <Link href="/pricing" onClick={closeAll} className="block border-b border-white/10 px-2 py-4 text-sm font-semibold text-white">Pricing</Link>
          <div className="grid grid-cols-2 gap-2 pt-4">
            <Link href="/signin" onClick={closeAll} className="rounded-md border border-white/18 px-3 py-2.5 text-center text-sm font-semibold text-white">Sign in</Link>
            <Link href="/#waitlist" onClick={closeAll} className="rounded-md bg-violet px-3 py-2.5 text-center text-sm font-semibold text-white">Join waitlist</Link>
          </div>
        </div>
      )}
    </header>
  );
}

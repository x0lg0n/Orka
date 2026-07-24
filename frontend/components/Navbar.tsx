"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  FileText,
  Mail,
  Menu,
  Rss,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { blogPosts } from "@/lib/blog-data";

type MenuLink = {
  label: string;
  description: string;
  href: string;
  icon: typeof ArrowRight;
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
      { label: "Proposals & agreements", description: "Turn an approved scope into a shared source of truth.", href: "/proposals", icon: FileText },
      { label: "Milestone workflow", description: "Coordinate delivery, evidence, reviews, and approvals.", href: "/milestones", icon: BookOpen },
      { label: "Payment records", description: "See every funded, pending, and settled milestone clearly.", href: "/payments", icon: FileText },
      { label: "ORKA AI", description: "Get help drafting, summarising, and moving work forward.", href: "/ai", icon: FileText },
    ],
    featured: { label: "See the product", title: "Work is easier to trust when everyone sees the same next step.", copy: "Explore what ORKA brings together for global client teams.", href: "/signup" },
  },
  {
    id: "solutions",
    label: "Solutions",
    eyebrow: "Built around real roles",
    heading: "A cleaner handoff for everyone involved in a project.",
    links: [
      { label: "Agencies & studios", description: "Run client work with a more dependable operating rhythm.", href: "/agencies", icon: FileText },
      { label: "Independent experts", description: "Make scope, approvals, and payment status easier to follow.", href: "/independents", icon: FileText },
      { label: "Clients", description: "Review a project through one clear, shared client portal.", href: "/clients", icon: FileText },
    ],
    featured: { label: "Start with ORKA", title: "Bring order to the project before delivery begins.", copy: "Create your ORKA workspace and get started.", href: "/signup" },
  },
  {
    id: "resources",
    label: "Resources",
    eyebrow: "Learn and decide",
    heading: "Everything you need to understand the ORKA approach.",
    links: [
      { label: "Documentation", description: "Product notes, setup guidance, and practical references.", href: "/docs", icon: BookOpen },
      { label: "About", description: "Learn more about ORKA and the team behind it.", href: "/about", icon: User },
      { label: "Blog", description: "Product updates, guides, and industry insights.", href: "/blog", icon: Rss },
      { label: "Contact", description: "Get in touch with the ORKA team.", href: "/contact", icon: Mail },
      { label: "Privacy", description: "How ORKA collects, uses, and protects your data.", href: "/privacy", icon: FileText },
      { label: "Terms & conditions", description: "The terms governing access to ORKA.", href: "/terms", icon: FileText },
    ],
    featured: { label: "For teams", title: "An operating system for global client work.", copy: "ORKA helps teams run client work with a calmer, clearer project lifecycle.", href: "/signup" },
  },
];

const recentPosts = blogPosts.slice(1, 4);

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  const clearCloseTimer = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const startCloseTimer = useCallback(() => {
    clearCloseTimer();
    closeTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 200);
  }, [clearCloseTimer]);

  const handleOpen = useCallback((id: string) => {
    clearCloseTimer();
    setOpenMenu(id);
  }, [clearCloseTimer]);

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

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  const closeAll = () => {
    clearCloseTimer();
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileSection(null);
  };

  return (
    <header
      ref={navRef}
      className="relative z-50 mx-auto max-w-360 px-4 sm:px-6 lg:px-8">
      <nav
        aria-label="Main navigation"
        className="flex h-18 items-center border-b border-white/12">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-white"
          aria-label="ORKA home">
          <Image
            src="/Logo/LOGO.svg"
            alt=""
            width={32}
            height={32}
            className="size-8"
            priority
          />
          <span className="text-[1.5rem] font-bold tracking-[-0.04em]">
            ORKA
          </span>
        </Link>

        <div
          className="ml-10 hidden h-full items-center gap-1 lg:flex"
          onMouseLeave={startCloseTimer}>
          {menuGroups.map((group) => {
            const isOpen = openMenu === group.id;
            return (
              <div
                key={group.id}
                className="relative flex h-full items-center"
                onMouseEnter={() => handleOpen(group.id)}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`${menuId}-${group.id}`}
                  onClick={() => setOpenMenu(isOpen ? null : group.id)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-white/72 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet">
                  {group.label}
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            );
          })}
          <Link
            href="/pricing"
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-white/72 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet">
            Pricing
          </Link>
          <Link
            href="/blog"
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-white/72 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet">
            Blog
          </Link>
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <a
            href="https://github.com/x0lg0n/Orka"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/18 px-3 py-2 text-sm font-medium text-white/78 transition-colors hover:text-white hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Star
          </a>
          <Link
            href="/signin"
            className="rounded-md px-3 py-2 text-sm font-medium text-white/78 transition-colors hover:text-white hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-md bg-violet px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#a78cff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Explore Platform <ArrowRight size={15} />
          </Link>
        </div>

        <button
          type="button"
          className="ml-auto grid size-10 place-items-center rounded-md text-white lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
          aria-label={
            mobileOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((value) => !value)}>
          {mobileOpen ?
            <X size={21} />
          : <Menu size={21} />}
        </button>
      </nav>

      {openMenu && (
        <div
          onMouseEnter={() => handleOpen(openMenu)}
          onMouseLeave={startCloseTimer}
          className="absolute left-4 right-4 top-[78px] hidden rounded-xl border border-white/12 bg-[#061a2b] shadow-[0_22px_60px_rgba(0,0,0,0.28)] lg:block">
          {menuGroups
            .filter((group) => group.id === openMenu)
            .map((group) => (
              <div
                key={group.id}
                className="grid grid-cols-[0.78fr_1.55fr_0.72fr] gap-10 p-8 xl:p-10">
                <div className="border-r border-white/10 pr-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
                    {group.eyebrow}
                  </p>
                  <p className="mt-4 max-w-[16rem] text-xl font-medium leading-7 text-white">
                    {group.heading}
                  </p>
                  {group.id === "resources" && recentPosts.length > 0 && (
                    <div className="mt-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                        Recent from the blog
                      </p>
                      <ul className="mt-3 space-y-3">
                        {recentPosts.map((post) => (
                          <li key={post.slug}>
                            <Link
                              href={`/blog/${post.slug}`}
                              onClick={closeAll}
                              className="group block rounded-md p-2 transition-colors hover:bg-white/7 focus-visible:outline-2 focus-visible:outline-violet">
                              <p className="text-sm font-medium leading-5 text-white transition-colors group-hover:text-violet">
                                {post.title}
                              </p>
                              <p className="mt-0.5 text-xs text-white/40">
                                {post.category} · {post.readingTime}
                              </p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {group.links.map(
                    ({ label, description, href, icon: Icon }) => (
                      <Link
                        key={label}
                        href={href}
                        onClick={closeAll}
                        className="group rounded-md p-3 transition-colors hover:bg-white/7 focus-visible:outline-2 focus-visible:outline-violet">
                        <Icon
                          size={18}
                          className="text-violet transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                        <p className="mt-3 text-sm font-semibold text-white">
                          {label}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-white/56">
                          {description}
                        </p>
                      </Link>
                    ),
                  )}
                </div>
                <Link
                  href={group.featured.href}
                  onClick={closeAll}
                  className="group flex flex-col justify-between rounded-xl border border-white/10 bg-white/6 px-5 py-5 text-white transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-violet">
                      {group.featured.label}
                    </p>
                    <p className="mt-4 text-lg font-semibold leading-6 text-white">
                      {group.featured.title}
                    </p>
                    <p className="mt-3 text-sm leading-5 text-white/60">
                      {group.featured.copy}
                    </p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white/80 group-hover:text-white">
                    Explore{" "}
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </div>
            ))}
        </div>
      )}

      {mobileOpen && (
        <div className="absolute left-4 right-4 top-18 rounded-xl border border-white/12 bg-[#061a2b] p-3 shadow-[0_22px_60px_rgba(0,0,0,0.3)] lg:hidden">
          {menuGroups.map((group) => {
            const expanded = mobileSection === group.id;
            return (
              <div
                key={group.id}
                className="border-b border-white/10 last:border-0">
                <button
                  type="button"
                  onClick={() => setMobileSection(expanded ? null : group.id)}
                  aria-expanded={expanded}
                  className="flex w-full items-center justify-between px-2 py-4 text-left text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-violet">
                  {group.label}
                  <ChevronDown
                    size={17}
                    className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
                {expanded && (
                  <div className="space-y-1 pb-3">
                    {group.links.map(({ label, href }) => (
                      <Link
                        key={label}
                        href={href}
                        onClick={closeAll}
                        className="block rounded-md px-3 py-2 text-sm text-white/68 hover:bg-white/7 hover:text-white focus-visible:outline-2 focus-visible:outline-violet">
                        {label}
                      </Link>
                    ))}
                    {group.id === "resources" && recentPosts.length > 0 && (
                      <div className="mt-2 border-t border-white/10 pt-2">
                        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                          Recent from the blog
                        </p>
                        {recentPosts.map((post) => (
                          <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            onClick={closeAll}
                            className="block rounded-md px-3 py-2 text-sm text-white/68 hover:bg-white/7 hover:text-white focus-visible:outline-2 focus-visible:outline-violet">
                            {post.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex gap-4 border-b border-white/10 px-2 py-4">
            <Link
              href="/pricing"
              onClick={closeAll}
              className="text-sm font-semibold text-white">
              Pricing
            </Link>
            <Link
              href="/blog"
              onClick={closeAll}
              className="text-sm font-semibold text-white">
              Blog
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-4">
            <Link
              href="/signin"
              onClick={closeAll}
              className="rounded-md border border-white/18 px-3 py-2.5 text-center text-sm font-semibold text-white">
              Sign in
            </Link>
            <Link
              href="/signin"
              onClick={closeAll}
              className="rounded-md bg-violet px-3 py-2.5 text-center text-sm font-semibold text-white">
              Explore Platform
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

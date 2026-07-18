"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { companyLinks, productLinks, resourcesLinks } from "../lib/content";
import StaggeredMenu, { type StaggeredMenuItem, type StaggeredMenuSocialItem } from "./ui/staggered-menu";

const GITHUB_URL = "https://github.com/x0lg0n/Orka";

type NavGroup = { id: string; label: string; links: { label: string; href: string }[] };

const desktopGroups: NavGroup[] = [
  { id: "product", label: "Product", links: productLinks },
  { id: "resources", label: "Resources", links: resourcesLinks },
  { id: "company", label: "Company", links: companyLinks },
];

const mobileMenuItems: StaggeredMenuItem[] = [
  ...productLinks.map((l) => ({ label: l.label, ariaLabel: l.label, link: l.href })),
  ...resourcesLinks.map((l) => ({ label: l.label, ariaLabel: l.label, link: l.href })),
  ...companyLinks.map((l) => ({ label: l.label, ariaLabel: l.label, link: l.href })),
  { label: "Sign Up", ariaLabel: "Sign up", link: "/signup" },
];

const mobileSocialItems: StaggeredMenuSocialItem[] = [
  { label: "X", link: "https://x.com/get_orka" },
  { label: "GitHub", link: GITHUB_URL },
  { label: "LinkedIn", link: "https://linkedin.com" },
];

export default function Navbar() {
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-20">
      {/* ── Main bar ── */}
      <nav className="mx-auto flex max-w-7xl items-center gap-16 py-5">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-4"
          aria-label="ORKA home">
          <Image
            src="/Logo/LOGO.svg"
            alt="ORKA"
            width={40}
            height={40}
            className="size-12 object-contain"
          />
          <span className="display text-[40px] text-white">ORKA</span>
        </Link>

        {/* Desktop dropdown groups */}
        <div ref={navRef} className="hidden items-center gap-2 md:flex">
          {desktopGroups.map((group) => (
            <div key={group.id} className="relative">
              <button
                onClick={() => setOpen(open === group.id ? null : group.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-normal uppercase text-white transition-all ${
                  open === group.id ? "bg-orange" : "hover:bg-orange"
                }`}
                aria-expanded={open === group.id}
                aria-haspopup="true">
                {group.label}
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${open === group.id ? "rotate-180" : ""}`}
                />
              </button>

              {open === group.id && (
                <div className="dropdown-panel absolute left-0 top-full mt-2 min-w-[180px] rounded-2xl border border-white/10 bg-night p-2 shadow-hard">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(null)}
                      className="block rounded-full px-4 py-2 text-sm font-normal uppercase text-white transition-all hover:bg-orange">
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA — Sign Up (desktop) */}
        <Link
          href="/signup"
          className="hidden rounded-full px-6 py-3 text-[18px] font-black uppercase text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-4 hover:border-white md:flex">
          Sign Up
        </Link>
        {/* CTA — Star on GitHub (desktop) */}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-4 rounded-full border-4 border-white bg-white px-6 py-3 text-[18px] font-black uppercase text-night transition-all duration-200 hover:-translate-y-0.5 hover:bg-transparent hover:text-white hover:border-white md:flex">
          <Star size={18} fill="current" className="star-wiggle shrink-0" />
          Star
        </a>



        {/* Staggered menu (mobile only) */}
        <div className="md:hidden">
          <StaggeredMenu
            position="right"
            items={mobileMenuItems}
            socialItems={mobileSocialItems}
            displaySocials
            displayItemNumbering
            accentColor="#9474ff"
            colors={["#9474ff", "#5227FF", "#1a1a1a"]}
            menuButtonColor="#ffffff"
            openMenuButtonColor="#ffffff"
            changeMenuColorOnOpen
            isFixed
            onMenuClose={() => {
              document.body.style.overflow = "";
            }}
            onMenuOpen={() => {
              document.body.style.overflow = "hidden";
            }}
          />
        </div>
      </nav>
    </div>
  );
}

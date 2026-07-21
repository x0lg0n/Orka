"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { companyLinks, productLinks, resourcesLinks } from "../lib/content";

const GITHUB_URL = "https://github.com/x0lg0n/Orka";

type NavGroup = { id: string; label: string; links: { label: string; href: string }[] };

const desktopGroups: NavGroup[] = [
  { id: "product", label: "Product", links: productLinks },
  { id: "resources", label: "Resources", links: resourcesLinks },
  { id: "company", label: "Company", links: companyLinks },
];

export default function 
Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);
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

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
        setMobileOpen(null);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function closeMobileMenu() {
    setMenuOpen(false);
    setMobileOpen(null);
  }

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
                <div className="dropdown-panel absolute left-0 top-full mt-2 min-w-45 rounded-2xl border border-white/10 bg-night p-2 shadow-hard">
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

        {/* Hamburger (mobile) */}
        <button
          className="ml-auto flex size-10 items-center justify-center rounded-full text-white transition-all hover:bg-white/10 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}>
          {menuOpen ?
            <X size={22} />
          : <Menu size={22} />}
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="mobile-menu md:hidden">
          <div className="flex flex-col gap-1 px-4 pb-6">
            {/* Group accordions */}
            {desktopGroups.map((group) => (
              <div key={group.id}>
                <button
                  onClick={() =>
                    setMobileOpen(mobileOpen === group.id ? null : group.id)
                  }
                  aria-expanded={mobileOpen === group.id}
                  className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-sm font-black uppercase text-white transition-all ${
                    mobileOpen === group.id ? "bg-orange" : "hover:bg-orange"
                  }`}>
                  {group.label}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${mobileOpen === group.id ? "rotate-180" : ""}`}
                  />
                </button>

                {mobileOpen === group.id && (
                  <div className="submenu flex flex-col gap-1">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMobileMenu}
                        className="block rounded-full px-4 py-2.5 text-sm font-black uppercase text-white/80 transition-all hover:bg-orange hover:text-white">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Log in */}
            <Link
              href="/login"
              onClick={closeMobileMenu}
              className="rounded-full px-4 py-3 text-sm font-black uppercase text-white transition-all hover:bg-orange">
              Log in
            </Link>

            {/* CTA — Sign Up */}
            <Link
              href="/signup"
              onClick={closeMobileMenu}
              className="mt-2 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black uppercase text-white transition-all hover:border-white hover:border-2 hover:text-white">
              Sign Up
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              className="mt-2 flex items-center justify-center gap-2 rounded-full border-2 border-white bg-white px-5 py-3 text-sm font-black uppercase text-night transition-all hover:border-white hover:bg-transparent hover:text-white">
              <Star size={16} className="star-wiggle shrink-0" fill="currentColor" />
              Star on GitHub
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

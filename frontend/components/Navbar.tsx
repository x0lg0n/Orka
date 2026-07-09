"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { productLinks } from "../lib/content";

const GITHUB_URL = "https://github.com/x0lg0n/Orka";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);

  // Close desktop product dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (productRef.current && !productRef.current.contains(e.target as Node)) {
        setProductOpen(false);
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
        setMobileProductOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function closeMobileMenu() {
    setMenuOpen(false);
    setMobileProductOpen(false);
  }

  return (
    <div className="relative z-20">
      {/* ── Main bar ── */}
      <nav className="mx-auto flex max-w-7xl items-center gap-6 py-5">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="ORKA home">
          <Image
            src="/Logo/LOGO.svg"
            alt="ORKA"
            width={48}
            height={48}
            className="size-12 object-contain"
          />
          <span className="display text-3xl text-white">ORKA</span>
        </Link>

        {/* Desktop nav links — left of spacer */}
        <div className="hidden items-center gap-1 md:flex">
          {/* Product dropdown */}
          <div ref={productRef} className="relative">
            <button
              onClick={() => setProductOpen((v) => !v)}
              className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-black uppercase text-white transition-all ${
                productOpen ? "bg-orange" : "hover:bg-orange"
              }`}
              aria-expanded={productOpen}
              aria-haspopup="true"
            >
              Product
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${productOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown panel */}
            {productOpen && (
              <div className="dropdown-panel absolute left-0 top-full mt-2 min-w-[180px] rounded-2xl border border-white/10 bg-ink p-2 shadow-hard">
                {productLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setProductOpen(false)}
                    className="block rounded-full px-4 py-2 text-sm font-black uppercase text-white transition-all hover:bg-orange"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* About */}
          <a
            href="#"
            onClick={() => setProductOpen(false)}
            className="rounded-full px-4 py-2 text-sm font-black uppercase text-white transition-all hover:bg-orange"
          >
            About
          </a>

          {/* Docs */}
          <a
            href="#"
            onClick={() => setProductOpen(false)}
            className="rounded-full px-4 py-2 text-sm font-black uppercase text-white transition-all hover:bg-orange"
          >
            Docs
          </a>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA — Star on GitHub (desktop) */}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-4 rounded-full border-2 border-white bg-white px-8 py-4 text-md font-black uppercase text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange hover:text-white hover:border-orange hover:shadow-[0_8px_20px_rgba(255,138,34,0.35)] md:flex"
        >
          <Star size={16} className="shrink-0" />
          Star on GitHub
        </a>

        {/* Hamburger (mobile) */}
        <button
          className="ml-auto flex size-10 items-center justify-center rounded-full text-white transition-all hover:bg-white/10 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="mobile-menu md:hidden">
          <div className="flex flex-col gap-1 px-4 pb-6">
            {/* Product accordion */}
            <button
              onClick={() => setMobileProductOpen((v) => !v)}
              aria-expanded={mobileProductOpen}
              className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-sm font-black uppercase text-white transition-all ${
                mobileProductOpen ? "bg-orange" : "hover:bg-orange"
              }`}
            >
              Product
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${mobileProductOpen ? "rotate-180" : ""}`}
              />
            </button>

            {mobileProductOpen && (
              <div className="submenu flex flex-col gap-1">
                {productLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="block rounded-full px-4 py-2.5 text-sm font-black uppercase text-white/80 transition-all hover:bg-orange hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* About */}
            <a
              href="#"
              onClick={closeMobileMenu}
              className="rounded-full px-4 py-3 text-sm font-black uppercase text-white transition-all hover:bg-orange"
            >
              About
            </a>

            {/* Docs */}
            <a
              href="#"
              onClick={closeMobileMenu}
              className="rounded-full px-4 py-3 text-sm font-black uppercase text-white transition-all hover:bg-orange"
            >
              Docs
            </a>

            {/* CTA */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              className="mt-2 flex items-center justify-center gap-2 rounded-full border-2 border-white bg-white px-5 py-3 text-sm font-black uppercase text-ink transition-all hover:border-orange hover:bg-orange hover:text-white"
            >
              <Star size={16} className="shrink-0" fill="currentColor" />
              Star on GitHub
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

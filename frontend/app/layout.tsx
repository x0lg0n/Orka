import type { Metadata } from "next";
import { Anton, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-dm-sans",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ORKA",
  description:
    "ORKA automates proposals, escrow, milestone verification, payouts, invoices, and back-office finance for global service businesses.",
  icons: {
    icon: "/Favicon.svg",
    apple: "/Favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${anton.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORKA | Autonomous Financial OS for Global Service Work",
  description:
    "ORKA automates proposals, escrow, milestone verification, payouts, invoices, and back-office finance for global service businesses.",
  icons: {
    icon: "/orka-logo.png",
    apple: "/orka-logo.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

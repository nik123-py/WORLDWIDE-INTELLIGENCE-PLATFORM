import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEGIS Intelligence Platform — Global OSINT Command Center",
  description: "Next-generation global intelligence platform combining geospatial intelligence, satellite tracking, maritime monitoring, cyber threat analysis, and AI-powered predictive analytics.",
  keywords: "OSINT, intelligence, geospatial, satellite, maritime, cyber, analytics, global monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

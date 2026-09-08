import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Experience Letter Extractor",
  description: "Extract structured information from experience letters using AI — supports PDF, DOCX, and images.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

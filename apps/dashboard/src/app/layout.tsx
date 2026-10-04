import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "8Labs Revenue Recovery",
  description:
    "AI revenue recovery infrastructure for service businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

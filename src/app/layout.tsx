import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRMT",
  description: "徒步社群平台 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

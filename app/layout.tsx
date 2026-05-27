import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "流转 Flowcast",
  description: "让创作者把一份内容，流转成多个平台都能发布的版本。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-sm focus:text-paper-0"
        >
          跳到主要内容
        </a>
        {children}
      </body>
    </html>
  );
}

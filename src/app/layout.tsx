// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "炎上.com - 事例から学ぶ、最強のリスクマネジメント",
    template: "%s | 炎上.com"
  },
  description: "企業の炎上・拡散事例をデータベース化。業界別・カテゴリ別の詳細なリスク分析で、自社のリスクを事前に予習・対策できます。",
  keywords: ["炎上", "リスクマネジメント", "PR", "広報", "企業リスク", "SNS炎上", "危機管理", "レピュテーションリスク"],
  authors: [{ name: "Flock Inc." }],
  creator: "Flock Inc.",
  publisher: "Flock Inc.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://enjo.ne.jp",
    title: "炎上.com - 事例から学ぶ、最強のリスクマネジメント",
    description: "企業の炎上・拡散事例をデータベース化。業界別・カテゴリ別の詳細なリスク分析で、自社のリスクを事前に予習・対策できます。",
    siteName: "炎上.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "炎上.com - 事例から学ぶ、最強のリスクマネジメント",
    description: "企業の炎上・拡散事例をデータベース化。業界別・カテゴリ別の詳細なリスク分析で、自社のリスクを事前に予習・対策できます。",
  },
  alternates: {
    canonical: "https://enjo.ne.jp",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}

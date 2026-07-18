import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Lexora AI",
    template: "%s | Lexora AI",
  },
  description:
    "Enterprise AI Legal Platform powered by OpenAI, Gemini, Claude, Grok and DeepSeek.",
  applicationName: "Lexora AI",
  keywords: [
    "AI",
    "Legal AI",
    "Lexora",
    "OpenAI",
    "Gemini",
    "Claude",
    "DeepSeek",
    "Grok",
    "Law",
    "Automation",
  ],
  authors: [
    {
      name: "Lexora AI Team",
    },
  ],
  creator: "Lexora AI",
  publisher: "Lexora AI",
  metadataBase: new URL("https://lexora.ai"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Lexora AI",
    description:
      "Enterprise AI Legal Platform powered by multiple AI providers.",
    url: "https://lexora.ai",
    siteName: "Lexora AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lexora AI",
    description:
      "Enterprise AI Legal Platform powered by multiple AI providers.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lexora AI Platform",
  description: "Enterprise Legal AI Platform",
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

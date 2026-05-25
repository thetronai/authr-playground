import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fira_Code } from "next/font/google";
import "./globals.css";
import { PlaygroundProvider } from "@/store/playground-context";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-display",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuthR Playground - Interactive Identity & Agent Delegation Protocol",
  description: "Explore AuthR (Authorship Representation), a cryptographic protocol proving human authorship and enforcement limits for autonomous AI agent actions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${firaCode.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col font-sans bg-bg-primary text-text-primary selection:bg-accent selection:text-white"
        suppressHydrationWarning
      >
        <PlaygroundProvider>
          {children}
        </PlaygroundProvider>
      </body>
    </html>
  );
}


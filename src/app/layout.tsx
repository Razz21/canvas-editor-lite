import { Inter, Open_Sans } from "next/font/google";

import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { themes } from "@/lib/themes";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const fontMono = Open_Sans({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Canvas",
  description: "Canvas app",
};
const availableThemes = themes.map((theme) => theme.id);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="light" enableColorScheme={false} themes={availableThemes}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

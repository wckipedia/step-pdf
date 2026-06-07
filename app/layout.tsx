import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "step-pdf — Free PDF & File Conversion",
  description:
    "Oh no step-pdf, I'm stuck! Free, fast file conversion tools. Drop a file, pick your escape route, download for free.",
  icons: {
    icon: [{ url: "/step-pdf.png", type: "image/png" }],
    apple: "/step-pdf.png",
    shortcut: "/step-pdf.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col grid-bg">{children}</body>
    </html>
  );
}

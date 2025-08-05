import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "Surfer Dashboard",
  description: "Advanced financial analytics platform for modern investors",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

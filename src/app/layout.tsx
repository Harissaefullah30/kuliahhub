import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Update Metadata Aplikasi
export const metadata: Metadata = {
  title: "KuliahHub | Manajemen Perkuliahan",
  description: "Aplikasi web manajemen perkuliahan pribadi. Fitur: pelacak deadline tugas, jadwal kuliah harian, dan penyimpanan materi.",
  manifest: "/manifest.json", // Memanggil file PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KuliahHub",
  },
};

// 2. Tambahkan Viewport (Penting untuk tema warna di HP)
export const viewport: Viewport = {
  themeColor: "#1E3A5F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id" // 3. Ubah bahasa ke Indonesia
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { ToastContainer } from "@/components/ui/ToastContainer";
import "@/cron/init"; // Initialize cron jobs

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StreamShare",
  description: "Plataforma para gestão colaborativa de assinaturas de streaming",
  authors: [{ name: "StreamShare" }],
  icons: {
    icon: "/assets/favicon.ico",
    shortcut: "/assets/favicon.ico",
  },
  openGraph: {
    title: "StreamShare",
    description: "Plataforma para gestão colaborativa de assinaturas de streaming",
    url: "/",
    siteName: "StreamShare",
    images: [
      {
        url: "/assets/banner-dois.jpg",
        width: 1200,
        height: 630,
        alt: "StreamShare - Gestão colaborativa de assinaturas de streaming",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@streamshare_br",
    title: "StreamShare",
    description: "Plataforma para gestão colaborativa de assinaturas de streaming",
    images: ["/assets/banner-tres.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1.0,
  },
};

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@streamshare/database";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentUser();
  let isSystemAdmin = false;

  if (session) {
    const admin = await prisma.usuarioAdmin.findUnique({
      where: { usuarioId: session.userId, isAtivo: true },
    });
    isSystemAdmin = !!admin;
  }

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased justify-center w-full flex bg-gray-50/50`}>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}


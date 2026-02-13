import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import "@/cron/init"; // Initialize cron jobs

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://streamshare.com.br"),
  title: {
    default: "StreamShare | Gestão de Assinaturas",
    template: "%s | StreamShare",
  },
  description: "Plataforma completa para gestão colaborativa de assinaturas de streaming. Economize compartilhando suas assinaturas com segurança.",
  keywords: ["streaming", "assinaturas", "gestão", "compartilhamento", "netflix", "spotify", "economia"],
  authors: [{ name: "StreamShare Team" }],
  creator: "StreamShare",
  publisher: "StreamShare",
  icons: {
    icon: "/assets/favicon.ico",
    shortcut: "/assets/favicon.ico",
    apple: "/assets/favicon.ico", // Ideally should be a png
  },
  openGraph: {
    title: "StreamShare | Gestão de Assinaturas",
    description: "Plataforma completa para gestão colaborativa de assinaturas de streaming. Economize compartilhando suas assinaturas com segurança.",
    url: "/",
    siteName: "StreamShare",
    images: [
      {
        url: "/assets/banner-dois.jpg",
        width: 1200,
        height: 630,
        alt: "StreamShare Dashboard",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamShare | Gestão de Assinaturas",
    description: "Economize compartilhando suas assinaturas de streaming com segurança.",
    images: ["/assets/banner-dois.jpg"], // Using the same reliable image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  themeColor: "#ffffff", // Optional but good practice
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased justify-center w-full flex bg-gray-50/50`}>
        <ToastProvider>
          <TooltipProvider>
            {children}
            <ToastContainer />
          </TooltipProvider>
        </ToastProvider>
      </body>
    </html>
  );
}


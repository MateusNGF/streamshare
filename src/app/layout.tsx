import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { SupportButton } from "@/components/support/SupportButton";
import "@/cron/init";
import { BetaAnnouncement } from "@/components/layout/BetaAnnouncement";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://streamshare.com.br"),
  title: {
    default: "StreamShare | Economize 80% em Assinaturas",
    template: "%s | StreamShare",
  },
  description: "Pare de pagar caro sozinho. Explore grupos, participe de assinaturas premium e economize até 80% hoje. Netflix, Spotify e mais, com gestão financeira automática.",
  keywords: [
    "compartilhar netflix",
    "dividir spotify",
    "economia colaborativa",
    "gestão de assinaturas",
    "pagar menos streaming",
    "kotas alternativo",
    "finanças pessoais"
  ],
  authors: [{ name: "StreamShare Team" }],
  creator: "StreamShare",
  publisher: "StreamShare",
  icons: {
    icon: "/icon", // Aponta para o arquivo dinâmico gerado abaixo
    shortcut: "/icon",
    apple: "/apple-icon", // Opcional: se quiser criar um apple-icon.tsx similar
  },
  openGraph: {
    title: "Você está pagando até 5x mais caro em seus streamings",
    description: "Explore, Participe e gerencie suas assinaturas economizando até 80%. Junte-se a milhares de usuários que pararam de rasgar dinheiro.",
    url: "/",
    siteName: "StreamShare",
    images: [
      {
        url: "/assets/banner-dois.jpg",
        width: 1200,
        height: 630,
        alt: "StreamShare - Economia Inteligente",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamShare | Pare de pagar o preço cheio",
    description: "Sua conta de streaming está cara? Divida com segurança e economize 80% agora.",
    images: ["/assets/banner-dois.jpg"],
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
  category: "finance",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  themeColor: "#7c3aed", // Cor primária (violet-600) para mobile browsers
};


// ... existing imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased justify-center w-full flex flex-col bg-gray-50/50`}>
        <ToastProvider>
          <TooltipProvider>
            <BetaAnnouncement />
            {children}
            <SupportButton />
            <ToastContainer />
          </TooltipProvider>
        </ToastProvider>
      </body>
    </html>
  );
}


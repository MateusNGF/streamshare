import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { SkipLink } from "@/components/layout/SkipLink";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StreamShare | Gestão de Streamings",
  description: "Gestão de Streamings Compartilhados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased flex flex-col lg:flex-row bg-gray-50/50`}>
        <SkipLink />
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MarcenariaPro",
  description: "Gerenciamento profissional de projetos de marcenaria",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={geist.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

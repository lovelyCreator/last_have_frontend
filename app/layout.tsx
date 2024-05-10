import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ContextProvider } from "@/contexts/ContextProvider";
import { Toaster, toast } from "sonner";

require("@solana/wallet-adapter-react-ui/styles.css");

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Last Haven",
  description: "Last Haven Game Demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Toaster richColors position="bottom-center" />

      <body className={inter.className}>
        <ContextProvider>
          <div className="hidden lg:block">{children}</div>
        </ContextProvider>
      </body>
    </html>
  );
}

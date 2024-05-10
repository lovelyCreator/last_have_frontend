"use client";

import React, { createContext, useContext } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export const WalletContext = createContext<any>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();
  return (
    <WalletContext.Provider value={publicKey ? publicKey.toBase58() : null}>
      {children}
    </WalletContext.Provider>
  );
}

"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { PiArrowLineDownLeftBold } from "react-icons/pi";

interface WalletModalProps {
  open: boolean;
  openPopUp: boolean;
  setOpen: (open: boolean) => void;
  setOpenPopup: (open: boolean) => void;
  setWalletNFTs: (nfts: any) => void;
}

const ManageWalletModal: React.FC<WalletModalProps> = ({
  open,
  setOpen,
  openPopUp,
  setOpenPopup,
  setWalletNFTs,
}) => {
  const [activeTab, setActiveTab] = useState("deposit");
  const wallet = useWallet();

  return (
    <div className="black-glass top-14 absolute left-64 z-[999] rounded-lg w-[200px] p-5 text-md shadow-lg">
      <div className="w-full  flex flex-col gap-3 text-sm">
        {/*
        TO REACTIVATE LATER WHEN KNOW UTILITY
          <button className="bg-[#FCB72A] uppercase font-bold text-black p-2 rounded-lg w-full cursor-pointer hover:opacity-80">
          Sync wallet
        </button>
        */}
        <button
          onClick={() => setOpenPopup(true)}
          className="bg-black uppercase font-bold text-white border-[#555555] border p-2 rounded-lg w-full cursor-pointer hover:opacity-80"
        >
          manage nfts
        </button>
        <div className="h-0.5 w-full bg-[#5555]"></div>
        <button
          onClick={() => wallet.disconnect()}
          className="bg-[#555555] uppercase font-bold text-white border-[#555555] border p-2 rounded-lg w-full cursor-pointer hover:opacity-80"
        >
          disconnect
        </button>
      </div>
    </div>
  );
};

export default ManageWalletModal;

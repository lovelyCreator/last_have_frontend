//@ts-nocheck

"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { PiArrowLineDownLeftBold } from "react-icons/pi";
import { responses } from "@/lib/util/response-util.const";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { mariusApi } from "@/lib/api/marius-api";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import * as anchor from "@project-serum/anchor";
import { DEV } from "@/lib/utils";
import { toast } from "sonner";

interface FundsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onBalanceChange: (open: boolean) => void;
  balance: number;
}

const endpoint = DEV
  ? "https://rpc-devnet.hellomoon.io/15b3c970-4cdc-4718-ac26-3896d5422fb6"
  : "https://rpc.hellomoon.io/2aac76c6-9590-400a-bfbb-1411c9716810";

const FundsModal: React.FC<FundsModalProps> = ({
  open,
  setOpen,
  onBalanceChange,
  balance,
}) => {
  const [activeTab, setActiveTab] = useState("deposit");
  const { publicKey } = useWallet();
  const [loadingDeposit, setLoadingDeposit] = useState(false);
  const wallet = useWallet();
  const [amount, setAmount] = useState("");
  const connection = new anchor.web3.Connection(endpoint);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const deposit = async () => {
    setLoadingDeposit(true);
    setActiveTab("deposit");
    if (!amount) {
      setLoadingDeposit(false);
      toast.error("Amount can't be empty.");
      return;
    }
    try {
      const numericAmount = parseFloat(amount) * Math.pow(10, 9);
      if (isNaN(numericAmount)) {
        toast.error("Invalid amount.");
        setLoadingDeposit(false);
        return;
      }
      const response = await mariusApi.depositEscrow(
        publicKey!.toBase58(),
        numericAmount
      );

      if (response.error) {
        toast.error(`Error from deposit: ${response.error}`);
        setLoadingDeposit(false);
        return;
      }

      if (!responses.isSuccess(response)) {
        toast.error("deposit did not succeed");
        setLoadingDeposit(false);
        return;
      }

      const txn = Transaction.from(Buffer.from(response.data, "base64"));

      let sim1 = await connection.simulateTransaction(txn);
      console.log(sim1);

      try {
        let signedTxn = await wallet.signTransaction!(txn);
        const serializedTx = signedTxn.serialize();

        let signedTx = await connection.sendRawTransaction(serializedTx);
        console.log("tx ", signedTx);
        setLoadingDeposit(false);
        setOpen(false);
        onBalanceChange(true);
        toast.success("Deposit successful.");
        const event = new CustomEvent("level-upgrade");
        window.dispatchEvent(event);
      } catch (signError) {
        console.log(signError);
        return;
      }
    } catch (error) {
      console.error("Deposit error:", error);
    }
  };

  const withdraw = async () => {
    setActiveTab("withdraw");
    setLoadingDeposit(true);

    if (!amount) {
      setLoadingDeposit(false);
      toast.error("Amount can't be empty.");
      return;
    }
    if (Number(amount) > balance) {
      setLoadingDeposit(false);
      toast.error("Amount can't be greater than balance.");
      return;
    }
    try {
      const numericAmount = parseFloat(amount) * Math.pow(10, 9);
      if (isNaN(numericAmount)) {
        toast.error("Invalid amount.");
        setLoadingDeposit(false);
        return;
      }
      const response = await mariusApi.withdrawEscrow(
        publicKey!.toBase58(),
        numericAmount
      );

      if (response.error) {
        toast.error(`Error from deposit: ${response.error}`);
        setLoadingDeposit(false);
        return;
      }

      if (!responses.isSuccess(response)) {
        toast.error("deposit did not succeed");
        setLoadingDeposit(false);
        return;
      }

      const txn = Transaction.from(Buffer.from(response.data, "base64"));

      let sim1 = await connection.simulateTransaction(txn);
      console.log(sim1);

      try {
        let signedTxn = await wallet.signTransaction!(txn);
        const serializedTx = signedTxn.serialize();

        let signedTx = await connection.sendRawTransaction(serializedTx);

        setOpen(false);
        onBalanceChange(true);
        setLoadingDeposit(false);
        toast.success("Withdraw successful.");
        const event = new CustomEvent("level-upgrade");
        window.dispatchEvent(event);
      } catch (signError) {
        console.log(signError);
        return;
      }
    } catch (error) {
      console.error("Deposit error:", error);
    }
  };

  return (
    <div className="black-glass absolute left-64 z-[999] rounded-lg w-[350px] p-5 text-md shadow-lg">
      <div className="w-full flex items-center justify-between gap-5">
        <button
          onClick={() => setActiveTab("deposit")}
          className={`flex-1 flex uppercase py-1.5 cursor-pointer hover:opacity-80 justify-center items-center gap-2 rounded-lg ${
            activeTab === "deposit"
              ? "bg-white text-black"
              : "bg-black text-white border border-[#555555]"
          }`}
        >
          <PiArrowLineDownLeftBold size={20} />
          DEPOSIT
        </button>
        <button
          onClick={() => setActiveTab("withdraw")}
          className={`flex-1 flex uppercase py-1.5 cursor-pointer hover:opacity-80 justify-center items-center gap-2 rounded-lg ${
            activeTab === "withdraw"
              ? "bg-white text-black"
              : "bg-black text-white border border-[#555555]"
          }`}
        >
          <PiArrowLineDownLeftBold size={20} />
          Withdraw
        </button>
      </div>
      {activeTab === "deposit" ? (
        <div className="mt-5 flex flex-col gap-3 items-center justify-center">
          <input
            value={amount}
            onChange={handleAmountChange}
            placeholder="Indicate Amount"
            className="border-[#555555] uppercase placeholder:text-[#555555] px-2 py-1 rounded-lg text-[#555555] border outline-none w-full bg-black"
          />

          {loadingDeposit ? (
            <button className="bg-[#FCB72A] font-bold text-black p-2 rounded-lg w-full cursor-pointer hover:opacity-80">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="inline w-5 h-5 text-black animate-spin fill-white"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            </button>
          ) : (
            <button
              onClick={deposit}
              className="bg-[#FCB72A] font-bold text-black p-2 rounded-lg w-full cursor-pointer hover:opacity-80"
            >
              DEPOSIT
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-col gap-3 items-center justify-center">
            <input
              value={amount}
              onChange={handleAmountChange}
              placeholder="indicate Amount"
              className="border-[#555555] uppercase placeholder:text-[#555555] px-2 py-1 rounded-lg text-[#555555] border outline-none w-full bg-black"
            />

            {loadingDeposit ? (
              <button className="bg-[#FCB72A] font-bold text-black p-2 rounded-lg w-full cursor-pointer hover:opacity-80">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="inline w-5 h-5 text-black animate-spin fill-white"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              </button>
            ) : (
              <button
                onClick={withdraw}
                className="bg-[#FCB72A] font-bold text-black p-2 rounded-lg w-full cursor-pointer hover:opacity-80"
              >
                WITHDRAW
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FundsModal;

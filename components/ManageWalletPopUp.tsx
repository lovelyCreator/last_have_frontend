//@ts-nocheck

import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import NFTItem from "./NFTItem";
import { mariusApi } from "@/lib/api/marius-api";
import { useWallet } from "@solana/wallet-adapter-react";
import { responses } from "@/lib/util/response-util.const";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import * as anchor from "@project-serum/anchor";
import { DEV } from "@/lib/utils";
import { NFT } from "@/lib/interfaces";
import { toast } from "sonner";
import { set } from "@project-serum/anchor/dist/cjs/utils/features";

const endpoint = DEV
  ? "https://rpc-devnet.hellomoon.io/15b3c970-4cdc-4718-ac26-3896d5422fb6"
  : "https://rpc.hellomoon.io/2aac76c6-9590-400a-bfbb-1411c9716810";

export default function ManageWalletPopUp({
  open,
  setOpen,
  walletNFTs,
  gameNFTs,
  setGameNFTs,
  setWalletNFTs,
  handleNftChange,
}: any) {
  const [selectedMintAddresses, setSelectedMintAddresses] = useState([]);
  const { publicKey } = useWallet();
  const wallet = useWallet();
  const [newGameTransfers, setNewGameTransfers] = useState([]);
  const [newWalletTransfers, setNewWalletTransfers] = useState([]);
  const [loadingSave, setLoadingSave] = useState(false);

  const handleSelect = (mintId: any) => {
    setSelectedMintAddresses((prevSelected: any) => {
      if (prevSelected.includes(mintId)) {
        return prevSelected.filter((address: any) => address !== mintId);
      } else {
        return [...prevSelected, mintId];
      }
    });
  };

  const moveToGame = () => {
    const selectedNFTs = walletNFTs.filter((nft: NFT) =>
      selectedMintAddresses.includes(nft.mintId)
    );

    const newGameNFTs = [...gameNFTs, ...selectedNFTs];
    setGameNFTs(newGameNFTs);

    setNewGameTransfers((prevTransfers) => [
      ...prevTransfers,
      ...selectedNFTs.map((nft) => nft.mintId),
    ]);

    const newWalletNFTs = walletNFTs.filter(
      (nft: any) => !selectedMintAddresses.includes(nft.mintId)
    );

    setNewWalletTransfers((prevTransfers) =>
      prevTransfers.filter((mintId) => !selectedMintAddresses.includes(mintId))
    );

    setWalletNFTs(newWalletNFTs);

    setSelectedMintAddresses([]);
  };

  const moveToWallet = () => {
    const selectedNFTs = gameNFTs.filter((nft: NFT) =>
      selectedMintAddresses.includes(nft.mintId)
    );

    // Add to walletNFTs
    const newWalletNFTs = [...walletNFTs, ...selectedNFTs];
    setWalletNFTs(newWalletNFTs);

    // Track newly moved to wallet
    setNewWalletTransfers((prevTransfers) => [
      ...prevTransfers,
      ...selectedNFTs.map((nft) => nft.mintId),
    ]);

    // Remove from gameNFTs
    const newGameNFTs = gameNFTs.filter(
      (nft: NFT) => !selectedMintAddresses.includes(nft.mintId)
    );
    setGameNFTs(newGameNFTs);

    // Remove from newGameTransfers
    setNewGameTransfers((prevTransfers) =>
      prevTransfers.filter((mintId) => !selectedMintAddresses.includes(mintId))
    );

    setSelectedMintAddresses([]);
  };

  const saveMoveToGame = async () => {
    setLoadingSave(true);
    const connection = new anchor.web3.Connection(endpoint);
    try {
      const response = await mariusApi.enterGame(
        publicKey!.toBase58(),
        newGameTransfers
      );

      if (!response || response.length === 0) {
        setLoadingSave(false);
        toast.error("No transactions received from enter game");
        return;
      }

      // Deserialize transactions from base64
      const transactions = response
        .map((encodedTx: any) => {
          try {
            return Transaction.from(Buffer.from(encodedTx, "base64"));
          } catch (error) {
            setLoadingSave(false);
            toast.error("Error entering game");
            return null;
          }
        })
        .filter((tx: any) => tx !== null);

      if (transactions.length === 0) {
        setLoadingSave(false);
        toast.error("No valid transactions to sign");
        return;
      }

      // Sign all transactions
      let signedTransactions;
      try {
        // simulate txs (debug only)
        for (let t of transactions) {
          let sim1 = await connection.simulateTransaction(t);
          console.log(sim1);
        }

        signedTransactions = await wallet.signAllTransactions!(transactions);
      } catch (error) {
        setLoadingSave(false);
        toast.error("Error entering game");
        return;
      }

      // Serialize and encode each transaction to base64
      for (const txn of signedTransactions) {
        const serializedTx = txn.serialize();

        let signedTx = await connection.sendRawTransaction(serializedTx);
      }

      setOpen(false);
      setLoadingSave(false);
      handleNftChange(true);
      setSelectedMintAddresses([]);
      setNewGameTransfers([]);
      setNewWalletTransfers([]);
      toast.success("NFTs transferred to game");
      const event = new CustomEvent("level-upgrade");
      window.dispatchEvent(event);
    } catch (error) {
      setLoadingSave(false);
      toast.error("Error entering game");
    }
  };

  const saveMoveToWallet = async () => {
    setLoadingSave(true);
    const connection = new anchor.web3.Connection(endpoint);
    try {
      const response = await mariusApi.exitGame(
        publicKey!.toBase58(),
        newWalletTransfers
      );

      if (!response || response.length === 0) {
        setLoadingSave(false);
        toast.error("No transactions received from exit game");
        return;
      }

      // Deserialize transactions from base64
      const transactions = response
        .map((encodedTx: any) => {
          try {
            return Transaction.from(Buffer.from(encodedTx, "base64"));
          } catch (error) {
            setLoadingSave(false);
            toast.error("Error exiting game");
            return null;
          }
        })
        .filter((tx: any) => tx !== null);

      if (transactions.length === 0) {
        setLoadingSave(false);
        toast.error("No valid transactions to sign");
        return;
      }

      // Sign all transactions
      let signedTransactions;
      try {
        // simulate txs (debug only)
        for (let t of transactions) {
          let sim1 = await connection.simulateTransaction(t);
          console.log(sim1);
        }

        signedTransactions = await wallet.signAllTransactions!(transactions);
      } catch (error) {
        setLoadingSave(false);
        toast.error("Error exiting game");
        return;
      }

      // Serialize and encode each transaction to base64
      for (const txn of signedTransactions) {
        const serializedTx = txn.serialize();

        let signedTx = await connection.sendRawTransaction(serializedTx);
      }

      setLoadingSave(false);
      setOpen(false);
      handleNftChange(true);
      setSelectedMintAddresses([]);
      setNewGameTransfers([]);
      setNewWalletTransfers([]);
      toast.success("NFTs transferred to wallet");
      const event = new CustomEvent("level-upgrade");
      window.dispatchEvent(event);
    } catch (error) {
      setLoadingSave(false);
      toast.error("Error exiting game");
    }
  };

  const saveNFTsTransfer = () => {
    if (newGameTransfers.length > 0) {
      saveMoveToGame();
      setNewGameTransfers([]);
      setNewWalletTransfers([]);
    } else if (newWalletTransfers.length > 0) {
      saveMoveToWallet();
      setNewGameTransfers([]);
      setNewWalletTransfers([]);
    } else {
      toast.error("No NFTs to transfer");
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[999999]" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 black-glass bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-[60%]   text-white  transform overflow-hidden rounded-lg bg-black p-10 text-left shadow-xl transition-all ">
                <div className="w-full flex items-center flex-col justify-between gap-5">
                  <div className="w-full border border-[#555555] p-5 rounded-lg">
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="bg-white px-4 py-2 rounded-md text-black">
                          IN WALLET
                        </div>
                        <div className="text-white/80">
                          Select nfts {">"} or move all {">>"} nfts to wallet
                        </div>
                      </div>
                      <div className="text-white/80">
                        {" "}
                        Total in wallet: {walletNFTs.length}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 lg:grid-cols-5lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-7 gap-3 my-5 relative max-h-[300px] overflow-y-scroll">
                      {walletNFTs.map((nft: any) => (
                        <NFTItem
                          key={nft.mintId}
                          showUpgrade={false}
                          nft={nft}
                          isOnGame={false}
                          onSelect={handleSelect}
                          isSelected={selectedMintAddresses.includes(
                            nft.mintId
                          )}
                        />
                      ))}
                      <div className="sticky bottom-0 h-10 left-0 right-0 bg-gradient-to-t from-black to-transparent"></div>
                    </div>
                  </div>
                  <div className="w-full flex gap-2 items-center justify-center relative z-30">
                    <div
                      onClick={moveToGame}
                      className="bg-white flex items-center justify-center p-2 cursor-pointer hover:opacity-70 rounded-lg"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="w-7 h-7 text-black rotate-180"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M4.5 15.75l7.5-7.5 7.5 7.5"
                        />
                      </svg>
                    </div>

                    {loadingSave ? (
                      <div className="bg-transparent cursor-pointer hover:opacity-80 border border-[#5555] px-10 rounded-lg py-3 mx-5">
                        <svg
                          aria-hidden="true"
                          role="status"
                          className="inline w-4 h-4 me-3 text-white animate-spin"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="#E5E7EB"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div
                        onClick={() => saveNFTsTransfer()}
                        className="bg-transparent cursor-pointer hover:opacity-80 border border-[#5555] px-10 rounded-lg py-3 mx-5"
                      >
                        SAVE
                      </div>
                    )}
                    <div
                      onClick={moveToWallet}
                      className="bg-[#FCB72A] flex items-center justify-center p-2 cursor-pointer hover:opacity-70 rounded-lg"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="w-7 h-7 text-black "
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M4.5 15.75l7.5-7.5 7.5 7.5"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="w-full border border-[#555555] p-5 rounded-lg">
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="bg-black px-4 py-2 rounded-md text-white border border-[#5555]">
                          IN GAME
                        </div>
                      </div>
                      <div className="text-white/80">
                        {" "}
                        Total in game: {gameNFTs.length}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 lg:grid-cols-5lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-7 gap-3 my-5 relative max-h-[300px] overflow-y-scroll">
                      {gameNFTs.map((nft: any) => (
                        <NFTItem
                          key={nft.mintId}
                          showUpgrade={false}
                          nft={nft}
                          onSelect={handleSelect}
                          isSelected={selectedMintAddresses.includes(
                            nft.mintId
                          )}
                        />
                      ))}
                      <div className="sticky bottom-0 h-10 left-0 right-0 bg-gradient-to-t from-black to-transparent"></div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

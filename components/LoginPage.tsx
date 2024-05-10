
//@ts-nocheck

"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { RiTwitterXLine, RiDiscordFill } from "react-icons/ri";
import { getCookie, setCookie } from "cookies-next";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import axios from "axios";
interface LoginPageProps {
  handleOwnership: () => void;
  messageSigned: boolean;
}

const WalletMultiButtonNoSSR = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const LoginPage: React.FC<LoginPageProps> = ({
  messageSigned,
  handleOwnership,
}) => {
  const { publicKey } = useWallet();

  return (
    <div className="relative flex min-h-screen items-stretch bg-[url('/home-bg.png')] bg-cover flex-col">
      <div className="container mx-auto pt-10">
        <div className="w-full flex items-center justify-between relative z-20">
          <div className="flex items-center gap-4">
            <a href="https://twitter.com/the_lasthaven" target="_blank">
              <div className="rounded-lg cursor-pointer hover:bg-white hover:border-white group w-12 h-12 flex items-center justify-center  border-[#555555] border-2">
                <RiTwitterXLine className="text-white w-5 h-5 group-hover:text-[#FF0046]" />
              </div>
            </a>
            <a href="https://discord.com/invite/thelasthaven" target="_blank">
              <div className="rounded-lg cursor-pointer hover:bg-white hover:border-white group w-12 h-12 flex items-center justify-center  border-[#555555] border-2">
                <RiDiscordFill className="text-white w-5 h-5 group-hover:text-[#FF0046]" />
              </div>
            </a>
            <a href="https://last-haven.gitbook.io/last-haven/" target="_blank">
              <div className="rounded-lg cursor-pointer hover:bg-white hover:border-white group w-12 h-12 flex items-center justify-center  border-[#555555] border-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="19"
                  viewBox="0 0 27 19"
                  fill="none"
                >
                  <path
                    d="M12.5977 15.6976C12.6972 15.6978 12.7956 15.7175 12.8875 15.7557C12.9793 15.7939 13.0627 15.8498 13.133 15.9202C13.2032 15.9907 13.2589 16.0742 13.2968 16.1662C13.3347 16.2581 13.3542 16.3567 13.3541 16.4561C13.3539 16.5556 13.3342 16.6541 13.296 16.7459C13.2578 16.8378 13.2019 16.9212 13.1314 16.9914C13.061 17.0617 12.9774 17.1173 12.8855 17.1553C12.7935 17.1932 12.695 17.2127 12.5955 17.2125C12.3946 17.2122 12.2021 17.1321 12.0602 16.9899C11.9184 16.8476 11.8389 16.6549 11.8392 16.454C11.8394 16.2531 11.9195 16.0606 12.0618 15.9187C12.204 15.7769 12.3968 15.6973 12.5977 15.6976ZM24.4755 11.0139C24.376 11.0139 24.2775 10.9942 24.1857 10.9561C24.0938 10.9179 24.0103 10.8621 23.9401 10.7917C23.8698 10.7213 23.814 10.6378 23.776 10.5459C23.738 10.4539 23.7185 10.3554 23.7186 10.256C23.7187 10.1565 23.7383 10.058 23.7764 9.96613C23.8146 9.87426 23.8704 9.7908 23.9408 9.72051C24.0112 9.65023 24.0947 9.59449 24.1867 9.55649C24.2786 9.51849 24.3771 9.49897 24.4766 9.49904C24.6775 9.49918 24.8701 9.57912 25.012 9.72127C25.154 9.86342 25.2336 10.0561 25.2335 10.257C25.2333 10.4579 25.1534 10.6505 25.0113 10.7925C24.8691 10.9344 24.6764 11.0141 24.4755 11.0139ZM24.4755 7.91519C23.8544 7.91576 23.259 8.16273 22.8198 8.60188C22.3807 9.04104 22.1337 9.6365 22.1331 10.2576C22.1331 10.5086 22.1751 10.7586 22.257 11.0021L14.5199 15.1212C14.3053 14.8097 14.0182 14.555 13.6834 14.3791C13.3485 14.2032 12.9759 14.1114 12.5977 14.1116C11.7045 14.1116 10.891 14.6234 10.4967 15.4218L3.54602 11.7563C2.8112 11.3706 2.2617 10.1617 2.31988 9.06052C2.35005 8.48624 2.5483 8.04017 2.85106 7.86778C3.04285 7.76004 3.27342 7.76865 3.51908 7.89687L3.56433 7.92165C5.40677 8.89136 11.434 12.0666 11.6883 12.184C12.0794 12.3661 12.2971 12.4394 12.9651 12.1226L25.4247 5.64284C25.6079 5.57389 25.8212 5.39826 25.8212 5.13213C25.8212 4.76365 25.4387 4.61819 25.4387 4.61819C24.7298 4.27879 23.6405 3.76916 22.5781 3.27138C20.3068 2.20793 17.7328 1.00334 16.6026 0.410744C15.6264 -0.0999673 14.8409 0.331013 14.7009 0.417209L14.4293 0.55189C9.34162 3.06774 2.53214 6.44016 2.14425 6.67612C1.45145 7.09848 1.02155 7.93997 0.965523 8.98402C0.879327 10.6401 1.72297 12.3672 2.93079 12.9997L10.2812 16.7902C10.3621 17.3469 10.6407 17.856 11.0661 18.2244C11.4914 18.5927 12.035 18.7958 12.5977 18.7964C13.2122 18.7953 13.8017 18.5532 14.2396 18.122C14.6774 17.6908 14.9285 17.105 14.939 16.4906L23.0349 12.1022C23.4444 12.4232 23.954 12.5989 24.4755 12.5989C25.0966 12.5983 25.692 12.3513 26.1312 11.9122C26.5703 11.473 26.8173 10.8776 26.8179 10.2565C26.8173 9.63543 26.5703 9.03996 26.1312 8.60081C25.692 8.16165 25.0966 7.91468 24.4755 7.91411"
                    fill="#fff"
                  />
                </svg>
              </div>
            </a>
          </div>
          <div className="login-wallet">
            {!publicKey && <WalletMultiButtonNoSSR></WalletMultiButtonNoSSR>}
            {!messageSigned && publicKey && (
              <div
                onClick={handleOwnership}
                className="bg-[#FF0046] hover:opacity-80  cursor-pointer  w-[300px] shadow-red-500/30 shadow-lg uppercase text-white font-[TTBold] font-bold flex items-center justify-center py-2 rounded-lg mt-6"
              >
                VERIFY OWNERSHIP
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="container h-full items-stat justify-center flex-1 mx-auto py-10 flex flex-col">
        <h1 className="text-xl uppercase">WELCOME TO THE</h1>
        <img src="/LastHaven.png" alt="logo" className="w-1/2 my-2" />
        <div className="w-full text-lg">A ruthless post-apocalyptic world</div>
        <div className="w-full text-lg">
          where every day is a struggle for survival.
        </div>
        <a href="https://magiceden.io/marketplace/last_haven" target="_blank">
          <div className="bg-[#FF0046] hover:opacity-80  cursor-pointer  w-[300px] shadow-red-500/30 shadow-lg uppercase text-white font-[TTBold] font-bold flex items-center justify-center py-2 rounded-lg mt-6">
            buy a LAST HAVEN
          </div>
        </a>
      </div>
    </div>
  );
};

export default LoginPage;

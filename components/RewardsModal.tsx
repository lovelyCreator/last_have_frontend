//@ts-nocheck

import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import NFTItem from "./NFTItem";
import { mariusApi } from "@/lib/api/marius-api";
import { useWallet } from "@solana/wallet-adapter-react";
import { getCookie } from "cookies-next";
import { responses } from "@/lib/util/response-util.const";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function RewardsModal({ open, setOpen }: any) {
  const [rewards, setRewards] = useState([]);
  const { publicKey } = useWallet();

  const getRewards = async () => {
    try {
      const response = await mariusApi.listRewards(publicKey!.toBase58());

      if (response.error) {
        throw new Error(`Error from getting rewards: ${response.error}`);
      }

      if (!responses.isSuccess(response)) {
        throw new Error("get rewards  did not succeed");
      }

      console.log("rewards", response.data);
      setRewards(response.data);
    } catch (error) {
      console.error("exit game error:", error);
    }
  };

  useEffect(() => {
    getRewards();
  }, []);

  useEffect(() => {
    const handleAction = async (event: any) => {
      getRewards();
    };

    window.addEventListener("refresh-rewards", handleAction);

    return () => {
      window.removeEventListener("refresh-rewards", handleAction);
    };
  }, [publicKey]);

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
              <Dialog.Panel className="relative w-full lg:w-[70%] text-white  transform overflow-hidden rounded-lg bg-black p-10 text-left shadow-xl transition-all ">
                <div className="text-2xl w-full items-center justify-center flex my-5">
                  REWARDS
                </div>
                <div className="w-full flex flex-col gap-5 max-h-[500px] overflow-y-scroll">
                  {rewards.map((reward, index) => (
                    <RewardItem
                      key={index}
                      action={reward.action}
                      zone={reward.zone}
                      reward={reward.reward}
                      mint={reward.mint}
                    />
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

const RewardItem = ({ action, zone, reward, mint }: any) => {
  const { amount, id } = JSON.parse(reward); // Assuming reward is a JSON string that contains an amount

  let outcome = "Token Reward";
  if(id.includes("tokenReward")){
    if(amount === 0){
      outcome = 'None';
    }
  }
  else if(id == "toHospital"){
    outcome = "Hospital";
  }

  return (
    <div className="bg-black flex items-center justify-between gap-5 w-full border border-[#00ff8460] rounded-lg p-3">
      <img
        src={"https://cdn.hellomoon.io/public/marius/" + mint + ".png"}
        className={`rounded-xl cursor-pointer hover:opacity-80 w-20`}
        alt=""
      />
      <div className="flex-1">
        <div className="text-xs text-[#555]">MISSION TYPE</div>
        <div className="uppercase text-md">{action}</div>
      </div>
      <div className="flex-1">
        <div className="text-xs text-[#555]">LOCATION</div>
        <div className="uppercase text-md">
          {zone === "WallStreet"
            ? "WALL STREET"
            : zone === "StateFair"
            ? "STATE FAIR"
            : zone === "toHospital"
            ? "TO HOSPITAL"
            : "N/A"}
        </div>
      </div>
      <div className="w-[1px] h-[56px] bg-[#555]"></div>
      <div className="flex-1">
        <div className="text-xs text-[#555]">REWARD</div>
        <div className="uppercase text-sm">
          {outcome}
        </div>
      </div>

      {amount ? (
        <div className="flex-1">
          <div className="text-xs text-[#555]">AMOUNT</div>
          <div className="uppercase text-md">{amount}</div>
        </div>
      ) : (
        <>
          <div className="flex-1">
            <div className="text-xs text-[#555]">AMOUNT</div>
            <div className="uppercase text-md">N/A</div>
          </div>
        </>
      )}
    </div>
  );
};

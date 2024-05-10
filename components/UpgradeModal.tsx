import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import NFTItem from "./NFTItem";
import { mariusApi } from "@/lib/api/marius-api";
import { useWallet } from "@solana/wallet-adapter-react";
import { getCookie } from "cookies-next";
import { responses } from "@/lib/util/response-util.const";
import { toast } from "sonner";

const upgradeCosts = {
  1: "120,000",
  2: "216,000",
  3: "292,800",
  4: "355,240",
  5: "405,000",
  6: "443,000",
  7: "474,000",
  8: "500,000",
  9: "520,000",
  10: "535,000",
  11: "550,000",
  12: "560,000",
  13: "570,000",
  14: "580,000",
  15: "590,000",
};

export default function UpgradeModal({ open, setOpen, mintId, level }: any) {
  const { publicKey } = useWallet();
  const csrfToken = getCookie("csrf");
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);

  const upgradeLevel = async () => {
    setLoadingUpgrade(true);
    try {
      const response = await mariusApi.buyLevel(
        publicKey!.toBase58(),
        mintId,
        csrfToken!
      );

      if (response.error) {
        setLoadingUpgrade(false);
        toast.error(`Error from upgrading level: Check your balance`);
        return;
      }

      if (!responses.isSuccess(response)) {
        setLoadingUpgrade(false);
        toast.error("Error upgrading level");
        return;
      }

      toast.success("Level upgraded!");
      setLoadingUpgrade(false);
      const event = new CustomEvent("level-upgrade");
      window.dispatchEvent(event);
      setOpen(false);
    } catch (error) {
      console.error("upgrade level error:", error);
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
              <Dialog.Panel className="relative w-full lg:w-1/3 text-white  transform overflow-hidden rounded-lg bg-black p-10 text-left shadow-xl transition-all ">
                <div className="text-2xl w-full items-center justify-center flex my-5">
                  UPGRADE
                </div>
                <div className="w-full flex flex-col gap-10 items-center justify-center">
                  <img
                    src={
                      "https://cdn.hellomoon.io/public/marius/" +
                      mintId +
                      ".png"
                    }
                    className={`rounded-3xl cursor-pointer hover:opacity-80 `}
                    width={150}
                  />
                  <div className="flex items-center justify-center flex-col gap-2">
                    <LevelStats level={Number(level)} />
                  </div>
                  {level < 15 ? (
                    <>
                      {loadingUpgrade ? (
                        <>
                          <button className="bg-[#FCB72A] animate-pulse gap-3 text-black flex items-center justify-center px-3 py-2 rounded-lg">
                            <div className="flex items-center justify-center gap-1 ">
                              <img
                                src="/coin.png"
                                className="w-[25px] animate-spin"
                              />
                            </div>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={upgradeLevel}
                            className="bg-[#FCB72A] gap-3 text-black flex items-center justify-center px-3 py-2 rounded-lg"
                          >
                            <div>UPGRADE LEVEL FOR </div>
                            <div className="flex items-center justify-center gap-1 ">
                              <img src="/coin.png" className="w-[25px]" />{" "}
                              {
                                //@ts-ignore
                                upgradeCosts[Number(level) + 1]
                              }
                            
                            </div>
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button className="bg-[#FCB72A]  gap-3 text-black flex items-center justify-center px-3 py-2 rounded-lg">
                        <div className="flex items-center justify-center gap-1 ">
                          MAX LEVEL IS 15
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

const LevelStats = ({ level }: any) => {
  const lvltosue = Number(level);
  const baseBlueRedValue = 100;
  const baseGreenValue = 150;

  const multiplier = Math.pow(2, lvltosue - 1);

  const blueValue = Math.floor(baseBlueRedValue * multiplier);
  const greenValue = Math.floor(baseGreenValue * multiplier);
  const redValue = Math.floor(baseBlueRedValue * multiplier);

  const currentLevel = level > 15 ? 15 : level;

  return (
    <div className="flex items-center justify-center flex-col gap-2">
      <div className="text-xs uppercase opacity-80">LVL</div>
      <div className="text-[#FCB72A]">{currentLevel}</div>
      <div className="text-xs uppercase opacity-80">UPGRADE TO</div>
      <div className="flex items-center gap-4">
        <div className="text-[#0038FF] flex items-center gap-2 text-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <g filter="url(#filter0_b_174_279)">
              <rect
                x="1"
                y="1"
                width="30"
                height="30"
                rx="15"
                fill="#242424"
                fill-opacity="0.35"
              />
              <rect
                x="0.5"
                y="0.5"
                width="31"
                height="31"
                rx="15.5"
                stroke="#0038FF"
              />
            </g>
            <path
              d="M21.7029 11.6648L16.1199 10.0173C16.0417 9.99423 15.9584 9.99423 15.8802 10.0173L10.2971 11.6648C10.1208 11.7168 10 11.8765 10 12.0576V18.0983C10 18.884 10.3234 19.6883 10.9611 20.4888C11.4482 21.1002 12.1221 21.7142 12.964 22.3136C14.3783 23.3206 15.7711 23.9384 15.8297 23.9642C15.8839 23.9881 15.942 24 16.0001 24C16.0582 24 16.1163 23.9881 16.1704 23.9642C16.229 23.9384 17.6217 23.3206 19.0361 22.3136C19.878 21.7142 20.5518 21.1002 21.0389 20.4888C21.6767 19.6883 22 18.884 22 18.0983V12.0576C22 11.8765 21.8793 11.7168 21.7029 11.6648Z"
              fill="#0038FF"
            />
            <defs>
              <filter
                id="filter0_b_174_279"
                x="-5"
                y="-5"
                width="42"
                height="42"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImageFix" stdDeviation="2.5" />
                <feComposite
                  in2="SourceAlpha"
                  operator="in"
                  result="effect1_backgroundBlur_174_279"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_backgroundBlur_174_279"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
          {blueValue}
        </div>
        <div className="text-[#00FF85] flex items-center gap-2 text-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <g filter="url(#filter0_b_174_285)">
              <rect
                x="1"
                y="1"
                width="30"
                height="30"
                rx="15"
                fill="#242424"
                fill-opacity="0.35"
              />
              <rect
                x="0.5"
                y="0.5"
                width="31"
                height="31"
                rx="15.5"
                stroke="#00FF85"
              />
            </g>
            <path
              d="M21.7931 13.862H18.138V10.2069C18.138 10.152 18.1162 10.0994 18.0774 10.0606C18.0386 10.0218 17.9859 10 17.9311 10H14.0689C14.0141 10 13.9614 10.0218 13.9226 10.0606C13.8838 10.0994 13.862 10.152 13.862 10.2069V13.862H10.2069C10.152 13.862 10.0994 13.8838 10.0606 13.9226C10.0218 13.9614 10 14.0141 10 14.0689V17.9311C10 17.9859 10.0218 18.0386 10.0606 18.0774C10.0994 18.1162 10.152 18.138 10.2069 18.138H13.862V21.7931C13.862 21.848 13.8838 21.9006 13.9226 21.9394C13.9614 21.9782 14.0141 22 14.0689 22H17.9311C17.9859 22 18.0386 21.9782 18.0774 21.9394C18.1162 21.9006 18.138 21.848 18.138 21.7931V18.138H21.7931C21.848 18.138 21.9006 18.1162 21.9394 18.0774C21.9782 18.0386 22 17.9859 22 17.9311V14.0689C22 14.0141 21.9782 13.9614 21.9394 13.9226C21.9006 13.8838 21.848 13.862 21.7931 13.862Z"
              fill="#00FF85"
            />
            <defs>
              <filter
                id="filter0_b_174_285"
                x="-5"
                y="-5"
                width="42"
                height="42"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImageFix" stdDeviation="2.5" />
                <feComposite
                  in2="SourceAlpha"
                  operator="in"
                  result="effect1_backgroundBlur_174_285"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_backgroundBlur_174_285"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
          {greenValue}
        </div>
        <div className="text-red-500 flex items-center gap-2 text-lg">
          <div className="border border-[#FF5C00] p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <g clip-path="url(#clip0_174_292)">
                <path
                  d="M14.9315 1.06321C14.8012 0.938751 14.6234 0.873575 14.4515 0.897265L10.8723 1.2706C10.7182 1.28246 10.5819 1.35357 10.4871 1.46617L4.72336 8.06986L3.77892 7.12542C3.5478 6.8943 3.17446 6.8943 2.94338 7.12542C2.22633 7.83654 2.22633 8.99803 2.94338 9.70911L3.68054 10.4475L1.29002 12.838C0.786222 13.3301 0.749912 14.1823 1.29002 14.7225C1.82494 15.2452 2.65887 15.2264 3.17446 14.7225L5.56335 12.3336L6.38634 13.158C7.12599 13.8852 8.27382 13.8542 8.97004 13.158C9.20116 12.9269 9.20116 12.5477 8.97004 12.3165L7.91893 11.2654L14.5226 5.50172C14.6352 5.40692 14.7063 5.2706 14.7182 5.12245L15.0975 1.54914C15.1212 1.37137 15.056 1.19356 14.9315 1.06321Z"
                  fill="#FF5C00"
                />
              </g>
              <defs>
                <clipPath id="clip0_174_292">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          {redValue}
        </div>
      </div>
    </div>
  );
};

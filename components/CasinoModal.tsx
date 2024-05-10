//@ts-nocheck

import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AiOutlineClose } from "react-icons/ai";
import { mariusApi } from "@/lib/api/marius-api";
import { useWallet } from "@solana/wallet-adapter-react";
import { getCookie } from "cookies-next";
import { responses } from "@/lib/util/response-util.const";
import { amount } from "@metaplex-foundation/js";
import { toast } from "sonner";
import { set } from "@project-serum/anchor/dist/cjs/utils/features";

export default function CasinoModal({
  open,
  setOpen,
  balance,
  handleBalanceChange,
}: any) {
  const [videoSrc, setVideoSrc] = useState("/CasinoVideos/2.webm");
  const [isSpinning, setIsSpinning] = useState(false);
  const [isWin, setIsWin] = useState(null);
  const [openResultModal, setOpenResultModal] = useState(false);
  const videoRef = useRef(null);
  const [counter, setCounter] = useState(1500);
  const { publicKey } = useWallet();
  const csrfToken = getCookie("csrf");
  const [prize, setPrize] = useState(0);
  const [isWinner, setIsWinner] = useState(false);

  const incrementCounter = () => {
    setCounter((prev) => prev + 1);
  };

  const decrementCounter = () => {
    setCounter((prev) => prev - 1);
  };

  const handleSpinClick = async () => {
    setPrize(0);
    setIsWinner(false);
    setIsSpinning(true);
    setIsWin(null);

    if (counter > balance) {
      setIsSpinning(false);

      toast.error("Not enough coins");
      return;
    }

    const response = await mariusApi.spinSlot(
      publicKey!.toBase58(),
      counter,
      csrfToken!
    );

    if (response.error) {
      setIsSpinning(false);
      toast.error(`Error from sending to mission: ${response.error}`);
      return;
    }

    if (!responses.isSuccess(response)) {
      setIsSpinning(false);
      toast.error("Error sending to mission");
      return;
    }

    handleBalanceChange(true);

    setIsWinner(response.data.result);
    setPrize(response.data.prize);
    console.log("prize", response.data.prize);

    const newVideoSrc = response.data.result
      ? "/CasinoVideos/1.webm"
      : "/CasinoVideos/2.webm";
    setVideoSrc(newVideoSrc);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load();

      videoRef.current.addEventListener(
        "loadeddata",
        () => {
          videoRef.current.play();

          setTimeout(() => {
            setOpenResultModal(true);
            setIsWin(response.data.result);
          }, 3500);
        },
        { once: true }
      );
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
    }
  }, [videoSrc]);

  useEffect(() => {
    setIsSpinning(false);
    setIsWin(null);
  }, [open]);

  return (
    <>
      {open && isWin !== null && (
        <div className="absolute flex items-center justify-center left-0 right-0 top-0 bottom-0 black-glass z-[250]">
          {isWinner ? (
            <>
              <div className="circleyellow w-[500px] h-[500px] absolute -left-20 -top-20"></div>
              <div className="circleyellow w-[500px] h-[500px] absolute -right-20 -bottom-20"></div>
            </>
          ) : (
            <>
              <div className="circlered w-[500px] h-[500px] absolute -left-20 -top-20"></div>
              <div className="circlered w-[500px] h-[500px] absolute -right-20 -bottom-20"></div>
            </>
          )}
          <div className="w-[719px] rounded-xl flex items-center justify-center relative bg-black/80 h-[386px]">
            {/*
<div
              onClick={() => setOpenResultModal(false)}
              className="absolute bg-black text-xl cursor-pointer hover:opacity-80 right-10 top-10"
            >
              <AiOutlineClose />
            </div>
              */}
            {isWinner ? (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col items-center justify-center uppercase text-3xl">
                  Congratulations <b className="text-[#FCB72A]">you won</b>
                </div>
                <div className="bg-black flex-1  flex items-center justify-center uppercase  outline-none font-bold text-white border-[#555555] border p-2 rounded-lg w-full ">
                  <div className="flex items-center text-xl justify-center gap-1">
                    <img src="/coin.png" className="w-[35px]" /> {prize}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col items-center gap-5 justify-center uppercase text-3xl">
                  better luck next time{" "}
                  <b className="text-[#FF0046] text-4xl">try again</b>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-[150]" onClose={setOpen}>
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
            <div className="absolute uppercase text-[#FCB72A] right-10 top-10 px-4 py-2 bg-black border border-[#5555] rounded-lg">
              possible gain: x1.5, x2, x5, x10
            </div>
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
                <Dialog.Panel className="relative flex-col flex items-center justify-center w-full bg-black lg:w-[70%] text-white  transform overflow-hidden rounded-lg bg-transparent px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8  sm:p-6">
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    width="500"
                    preload="auto"
                    style={{ display: "block" }}
                    muted
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className=" flex items-center gap-4 w-[350px]">
                    <div className="bg-black flex-1  flex items-center justify-between uppercase  outline-none font-bold text-white border-[#555555] border p-1 rounded-lg w-full ">
                      <div>
                        <svg
                          onClick={decrementCounter}
                          xmlns="http://www.w3.org/2000/svg"
                          width="34"
                          height="34"
                          viewBox="0 0 34 34"
                          fill="none"
                          className="cursor-pointer hover:opacity-80"
                        >
                          <rect
                            x="0.5"
                            y="0.780029"
                            width="32.44"
                            height="32.44"
                            rx="7.1"
                            stroke="white"
                          />
                          <path
                            d="M10.6401 19.0247V15.48H21.7175V19.0247H10.6401Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <img src="/coin.png" className="w-[25px]" />{" "}
                        {Math.floor(counter)}
                      </div>
                      <svg
                        onClick={incrementCounter}
                        xmlns="http://www.w3.org/2000/svg"
                        width="34"
                        height="34"
                        viewBox="0 0 34 34"
                        fill="none"
                        className="cursor-pointer hover:opacity-80"
                      >
                        <rect
                          x="0.5"
                          y="0.780029"
                          width="32.44"
                          height="32.44"
                          rx="7.1"
                          stroke="white"
                        />
                        <path
                          d="M10.6401 19.0433V15.4985H15.0711V10.9199H18.6158V15.4985H23.0467V19.0433H18.6158V23.6219H15.0711V19.0433H10.6401Z"
                          fill="white"
                        />
                      </svg>
                    </div>

                    {isSpinning ? (
                      <>
                        <button
                          className={`bg-[#FF0046] w-[150px] h-[40px] uppercase outline-none font-bold text-white p-2 rounded-lg cursor-pointer hover:opacity-80 animate-pulse`}
                        >
                          SPINNING
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={`bg-[#FF0046] w-[150px] uppercase outline-none font-bold text-white p-2 rounded-lg cursor-pointer hover:opacity-80 ${
                            isSpinning ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          onClick={handleSpinClick}
                          disabled={isSpinning} // Disable the button while spinning
                        >
                          SPIN
                        </button>
                      </>
                    )}
                  </div>
                  <div className="w-[350px] flex items-center gap-5 mt-5">
                    <div
                      onClick={() => setCounter(counter * 2)}
                      className="bg-black w-full  cursor-pointer hover:opacity-80 flex items-center justify-center uppercase  outline-none font-bold text-white border-[#555555] border p-1 rounded-lg "
                    >
                      x2
                    </div>
                    <div
                      onClick={() => setCounter(counter * 3)}
                      className="bg-black w-full cursor-pointer hover:opacity-80  flex items-center justify-center uppercase  outline-none font-bold text-white border-[#555555] border p-1 rounded-lg "
                    >
                      x3
                    </div>
                    <div
                      onClick={() => setCounter(counter / 2)}
                      className="bg-black w-full cursor-pointer hover:opacity-80  flex items-center justify-center uppercase  outline-none font-bold text-white border-[#555555] border p-1 rounded-lg "
                    >
                      1/2
                    </div>
                  </div>

                  {/*
<div className="w-[350px]">
                    <button className="bg-transparent text-[#0038FF] mt-3 border border-[#0038FF]  uppercase  outline-none font-bold  p-2 rounded-lg w-full cursor-pointer hover:opacity-80">
                      Buy booster
                    </button>
                  </div>
                  <div className="w-[350px]">
                    <button className="bg-black uppercase  outline-none font-bold  p-2 rounded-lg w-full cursor-pointer hover:opacity-80">
                      3 spins left
                    </button>
                  </div>
                    */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}

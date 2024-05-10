//@ts-nocheck

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Countdown from "react-countdown";
import UpgradeModal from "./UpgradeModal";
import ReleaseModal from "./ReleaseModal";

export default function NFTItem({
  nft,
  onSelect,
  isSelected,
  isOnGame,
  showUpgrade,
}: any) {
  const [progress, setProgress] = useState(0);
  const [allowedToGo, setAllowedToGo] = useState(false);
  const [releaseDate, setReleaseDate] = useState("");
  const [releaseTime, setReleaseTime] = useState(0);
  const [openUpgrade, setOpenUpgrade] = useState(false);
  const [openRelease, setOpenRelease] = useState(false);
  const imageUrl = `https://cdn.hellomoon.io/nft/${nft.mintId}?apiKey=1c243515-f583-4000-aff4-40708fedd6de&height=500&width=500`;

  const calculateProgress = () => {
    const now = Date.now();
    const allowedTime = parseInt(nft.timestampAllowedToLeave) * 1000;
    const totalTime = allowedTime - now;
    const elapsedTime = allowedTime - new Date().getTime();
    const progressPercentage = Math.max(
      0,
      Math.min(100, (elapsedTime / totalTime) * 100)
    );
    return progressPercentage;
  };

  const checkAllowedToGo = () => {
    const now = Date.now();
    const allowedTime = parseInt(nft.timestampAllowedToLeave) * 1000;
    return now > allowedTime;
  };

  const formatReleaseDate = () => {
    const releaseTime = new Date(parseInt(nft.timestampAllowedToLeave) * 1000);
    setReleaseDate(releaseTime.toLocaleDateString());
    setReleaseTime(releaseTime.getDate());
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(calculateProgress());
      setAllowedToGo(checkAllowedToGo());
    }, 1000);

    formatReleaseDate();

    return () => clearInterval(interval);
  }, [nft]);

  const handleClick = () => {
    onSelect(nft.mintId);
  };

  const Completionist = () => <span>ENDED</span>;

  // Renderer callback with condition
  const renderer = ({ hours, minutes, seconds, completed }: any) => {
    if (completed) {
      // Render a completed state
      return <Completionist />;
    } else {
      // Render a countdown
      return (
        <div className="flex items-center text-sm justify-center w-full mb-3">
          {hours}H : {minutes}M : {seconds}S
        </div>
      );
    }
  };

  useEffect(() => {
    console.log("nft", nft.json.image);
  }, [imageUrl]);

  const allowedTime = parseInt(nft.timestampAllowedToLeave) * 1000;

  return (
    <>
      <UpgradeModal
        open={openUpgrade}
        setOpen={setOpenUpgrade}
        mintId={nft.mintId}
        level={nft.xp}
      />
      <ReleaseModal
        open={openRelease}
        setOpen={setOpenRelease}
        mintId={nft.mintId}
        methodOfLeaving={checkAllowedToGo() ? 0 : 1}
      />
      <div onClick={handleClick} className="relative">
        {nft.json && (
          <Image
            src={"https://cdn.hellomoon.io/public/marius/" + nft.mintId + ".png"}
            className={`rounded-3xl cursor-pointer hover:opacity-80 ${
              isSelected ? "border-4 border-[#fcb62a98]" : ""
            }`}
            alt=""
            quality={40}
            width={250}
            height={250}
            blurDataURL={nft.json.image}
            placeholder="blur"
          />
        )}

        {showUpgrade && (
          <div className="absolute bottom-0 z-20 left-0 p-3 w-full flex items-center justify-between">
            <div>
              <div className="text-xs uppercase opacity-80">LVL</div>
              <div className="text-[#FCB72A]">{nft.xp}</div>
            </div>
            <div>
              <button
                onClick={() => setOpenUpgrade(true)}
                className="bg-[#FCB72A]  text-black px-2 rounded-md py-1 cursor-pointer hover:opacity-80 text-xs"
              >
                UPGRADE
              </button>
            </div>
          </div>
        )}
        {
        nft.zoneAddyIn != "11111111111111111111111111111111" &&
        isOnGame ? (
          <>
            <div className="absolute z-20 bottom-0 w-full p-5">
              <div>
                <Countdown date={allowedTime} renderer={renderer} />
              </div>
              <div className="relative bg-white rounded-lg">
                <div
                  style={{ width: `${progress}%` }}
                  className="bg-[#FCB72A] h-1"
                ></div>
              </div>
              {nft.inHospital ? (
                <>
                  <div className=" bottom-0 z-20 left-0 mt-3 w-full flex items-center justify-between">
                    <div className="w-full flex-1">
                      {/* <button
                        onClick={() => setOpenRelease(true)}
                        className="bg-[#FCB72A] w-full  text-black px-2 rounded-md py-1 cursor-pointer hover:opacity-80 text-xs"
                      >
                        RELEASE
                      </button> */}
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </>
        ) : (
          <></>
        )}

        <div className="absolute bg-gradient-to-t from-black/40 to-transparent left-0 right-0 bottom-0 top-0 z-10"></div>
      </div>
    </>
  );
}

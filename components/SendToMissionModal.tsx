import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import NFTItem from "./NFTItem";
import { mariusApi } from "@/lib/api/marius-api";
import { getCookie } from "cookies-next";
import { responses } from "@/lib/util/response-util.const";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { send } from "process";
import { set } from "@project-serum/anchor/dist/cjs/utils/features";
// import { NFT } from './types'

export default function SendToMissionModal({
  open,
  setOpen,
  missionName,
  gameNFTs,
  handleNftChange,
}: any) {
  const csrfToken = getCookie("csrf");
  const { publicKey } = useWallet();

  const handleModalOpen = () => {
    setOpen(false)
  }
  const item = [];
  if (gameNFTs.length < 16) {
    for (let i = 0; i < 16 - gameNFTs.length; i++) {
      item.push(<div className="bg-zinc-800/65 rounded-[23px] aspect-square"></div>);
    }
  }
  const [selectedMintAddresses, setSelectedMintAddresses] = useState([]);
  const [loadingSend, setLoadingSend] = useState(false);
  const handleSelect = (mintId: any) => {
    setSelectedMintAddresses((prevSelected: any) => {
      if (prevSelected.includes(mintId)) {
        return prevSelected.filter((address: any) => address !== mintId);
      } else {
        return [...prevSelected, mintId];
      }
    });
  };
  const selectAllNFTs = () => {
    const allMintAddresses = gameNFTs.map((nft: any) => nft.mintId);
    setSelectedMintAddresses(allMintAddresses);
  };
  const sendToMission = async () => {
    setLoadingSend(true);
    try {
      const actions = new Array(selectedMintAddresses.length).fill("Looting");

      const enterZonePromises = selectedMintAddresses.map(async (mintAddress, index) => {
        try {
          const response = await mariusApi.enterZone(
            publicKey!.toBase58(),
            [mintAddress],
            missionName,
            [actions[index]],
            csrfToken!
          );

          if (response.error) {
            toast.error(`Error from sending NFTs to mission: ${response.error}`);
          }

          if (!responses.isSuccess(response)) {
            toast.error("Error sending NFTs to mission");
          }
        } catch (error) {
          console.error(`Error in sending NFTs to mission: ${error}`);
        }
      });

      // Wait for all promises to resolve
      await Promise.all(enterZonePromises);

      setLoadingSend(false);

      const event = new CustomEvent("level-upgrade");
      window.dispatchEvent(event);
      setOpen(false);
      handleNftChange(true);
      setLoadingSend(false);
      setSelectedMintAddresses([]);
      toast.success("NFTs sent to mission");
    } catch (error) {
      console.error("exit game error:", error);
    }
  };
  return (
    <>
      {open == true ? (
        <>
          <div className="absolute flex w-full h-full items-center z-[99999] justify-center bg-black/50 backdrop-blur-[4px]">
            <div className="inline-flex w-[70%] h-[85%] left-[15%]  bg-black/90 backdrop-blur-[4px] rounded-[30px]">
              <div className="relative w-[45%] h-full">
                {missionName == "StateFair" ? (
                  <img className="w-full h-full rounded-[30px] object-cover" src="/stateFair.png" />
                ) : (
                  <img className="w-full h-full rounded-[30px] object-cover" src="/wallStreet.png" />
                )}
                <div className="absolute top-[50px] w-full flex justify-center">
                  <div className="relative w-[90%] flex items-center justify-center bg-black/60 h-[70px] rounded-[10px]">
                    <div className="w-[100%] flex justify-around">
                      <div className="items-center justify-center">
                        <div className="text-[12px] text-[#555555]">LOCATION</div>
                        <div className="text-[14px] text-white">{missionName.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</div>
                      </div>
                      <div className="items-center justify-center">
                        <div className="text-[12px] text-[#555555]">MAX YIELD</div>
                        <div className="text-[14px] text-white flex align-center">{missionName == "StateFair" ? (<>1,5M</>) : <>3,765M</>}<img className="w-[19px] h-[17px] mt-[1px] ml-[2px]" src="/coin1.png" /></div>
                      </div>
                      <div className="items-center justify-center">
                        <div className="text-[12px] text-[#555555]">DURATION</div>
                        <div className="text-[14px] text-white">4H</div>
                      </div>
                      <div className="items-center justify-center">
                        <div className="text-[12px] text-[#555555]">LVL</div>
                        <div className="text-[14px] text-white">+15</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute w-full bottom-[85px] z-10 flex items-center justify-center">
                  <div className="w-[90%] inline-flex justify-around 2xl:text-[14px] xl:text-[12px] text-[10px]">
                    <div className="w-[35%] h-[37px] justify-around bg-black/60 rounded-full border border-[#00FF85] inline-flex items-center 2xl:px-[20px] px-[10px]"><div className="text-[#00FF85]">{missionName == "StateFair" ? (<>49.5%</>) : <>29%</>}</div><div className="text-white">SUCCESS</div></div>
                    <div className="w-[30%] h-[37px] justify-around bg-black/60 rounded-full border border-[#00F0FF] inline-flex items-center 2xl:px-[20px] px-[10px]"><div className="text-[#00F0FF]">{missionName == "StateFair" ? (<>12.5%</>) : <>8%</>}</div><div className="text-white">DOUBLE</div></div>
                    <div className="w-[25%] h-[37px] justify-around bg-black/60 rounded-full border border-[#FF7A00] inline-flex items-center px-[20px] "><div className="text-[#FF7A00]">3%</div><div className="text-white">{missionName == "StateFair" ? (<>X5</>) : <>X10</>}</div></div>
                  </div>

                </div>
                <div className="absolute w-full bottom-0 rounded-b-[27px] h-[40%] bg-gradient-to-t from-black from-0% to-black/0 to-100%"></div>
              </div>
              <div className="relative flex w-[55%] h-full items-center justify-center">
                <button
                  className="absolute top-[40px] right-[40px]"
                  onClick={handleModalOpen}
                >
                  <img src="/close.png" />
                </button>
                <div className="w-[70%]">
                  <div className="w-full text-[20px] text-white text-center">SELECT WHICH NFTS TO SEND ON MISSIONS</div>
                  {/* <div className="w-full grid grid-cols-4 gap-4 mt-[40px] aspect-square overflow-auto">
                    {gameNFTs.map((nft: any) => (
                      <NFTItem
                        key={nft.mintId}
                        nft={nft}
                        isOnGame={false}
                        showUpgrade={false}
                        onSelect={handleSelect}
                        isSelected={selectedMintAddresses.includes(
                          nft.mintId
                        )}
                      />
                    ))}
                    {item}
                  </div> */}
                  <div className="w-full grid grid-cols-4 gap-4 mt-[40px] aspect-square overflow-auto">
                    {gameNFTs.map((nft: { mintId: never; /* Add other properties and their types here */ }) => (
                      <NFTItem
                        key={nft.mintId}
                        nft={nft}
                        isOnGame={false}
                        showUpgrade={false}
                        onSelect={handleSelect}
                        isSelected={selectedMintAddresses.includes(nft.mintId)}
                      />
                    ))}
                    {item}
                  </div>
                  <div className="w-full grid grid-cols-2 gap-4 mt-[50px] text-black">

                    <button onClick={sendToMission}
                      disabled={selectedMintAddresses.length === 0}
                      className=" bg-[#FCB72A] hover:bg-zinc-700 py-1 rounded-[6px]"
                    >
                      {loadingSend ? (
                        <>Loading...</>
                      ) : (<>SEND SELECTED</>)}
                    </button>
                    <button
                      onClick={() => {
                        selectAllNFTs();
                      }}
                      className="bg-black hover:bg-zinc-700 text-white py-1 border border-[#555555] rounded-[6px]"
                    >
                      SEND ALL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

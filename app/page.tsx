"use client";

import CampModal from "@/components/CampModal";
import CasinoModal from "@/components/CasinoModal";
import FundsModal from "@/components/FundsModal";
import LoginPage from "@/components/LoginPage";
import ManageWalletModal from "@/components/ManageWalletModal";
import SendToMissionModal from "@/components/SendToMissionModal";
import ManageWalletPopUp from "@/components/ManageWalletPopUp";
import RaffleModal from "@/components/RaffleModal";
import ChatModal from "@/components/ChatModal"
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { Howl } from "howler";
import { BsMusicNoteBeamed } from "react-icons/bs";
import { Switch } from "@headlessui/react";
import { mariusApi } from "@/lib/api/marius-api";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import LoadingPage from "@/components/LoadingPage";
import io from 'socket.io-client';
import RewardsModal from "@/components/RewardsModal";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}
const API_KEY = "3e1b0123-b319-4c3d-a674-64dc37293d60";

export default function Home() {
  const [openCasino, setOpenCasino] = useState(false);
  const [openCamp, setOpenCamp] = useState(false);
  const wallet = useWallet();
  const [openRewards, setOpenRewards] = useState(false);
  const [openSendToMissionModal, setOpenSendToMissionModal] = useState(false);
  const [selectedMissionName, setSelectedMissionName] = useState<any>(null);
  const [openFundsModal, setOpenFundsModal] = useState(false);
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const [openWalletPopUp, setOpenWalletPopUp] = useState(false);
  const [gameNFTs, setGameNFTs] = useState<any[]>([]);
  const [walletNFTs, setWalletNFTs] = useState<any[]>([]);
  const [wallStreetNfts, setWallStreetNfts] = useState<any[]>([]);
  const [stateFairNfts, setStateFairNfts] = useState<any[]>([]);
  const [hospitalNfts, setHospitalNfts] = useState<any[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { publicKey, disconnect } = useWallet();
  const [messageSigned, setMessageSigned] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const walletModal = useWalletModal();
  const [csrf, setcsrf] = useState<any>(
    getCookie("csrf") ? getCookie("csrf") : null
  );
  const csrfToken = getCookie("csrf");
  const publicKeyCockie = getCookie("walletAdress");
  const [isCasinoHovered, setIsCasinoHovered] = useState(false);
  const [isHospitalHovered, setIsHospitalHovered] = useState(false);
  const [isStateFairHovered, setIsStateFairHovered] = useState(false);
  const [isWallStreetHovered, setIsWallStreetHovered] = useState(false);
  const [isHospitalOpened, setIsHospitalOpened] = useState(false);
  const [isCampHovered, setIsCampHovered] = useState(false);
  const [isCampTwoHovered, setIsCampTwoHovered] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [music, setMusic] = useState<any>(null);
  const [openRaffle, setOpenRaffle] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | undefined>('');
  const [unreadMessage, setUnreadMessage] = useState(0);
  const [username, setUserName] = useState('');
  const [alert, setAlert] = useState(0);
  const socket = io('https://web-camxq60inzhu.up-fi-hel1-k8s-1.apps.run-on-seenode.com/');
  const avatarUrl = profilePic !== "" && "https://cdn.hellomoon.io/public/marius/" + profilePic + ".png"

  useEffect(() => {
    setWalletAddress(publicKey?.toBase58());
    const newMusic = new Howl({
      src: ["/LastHaven.mp3"],
      loop: true,
      volume: 0.5,
      onplay: () => setIsMusicPlaying(true),
      onpause: () => setIsMusicPlaying(false),
      onstop: () => setIsMusicPlaying(false),
      onend: () => setIsMusicPlaying(false),
    });

    setMusic(newMusic);

    newMusic.once("load", () => {
      newMusic.play();
    });

    // return () => newMusic.unload();
  }, []);


  const toggleMusic = () => {
    if (music) {
      if (isMusicPlaying) {
        music.pause();
      } else {
        music.play();
      }
    }
  };

  const casinoPosition = { x: "50%", y: "30%" };
  const hospitalPosition = { x: "20%", y: "60%" };
  const stateFairPosition = { x: "2%", y: "10%" };
  const wallStreetPosition = { x: "50%", y: "40%" };
  const campPosition = { x: "10%", y: "70%" };
  const campTwoPosition = { x: "70%", y: "10%" };

  const mapImages = [
    { src: "/Buttons/casino.png", x: "50%", y: "20%" },
    { src: "/Buttons/morecamp.png", x: "80%", y: "40%" },
    { src: "/Buttons/hospital.png", x: "17%", y: "60%" },
    { src: "/Buttons/wallstreet.png", x: "55%", y: "50%" },
    { src: "/Buttons/state.png", x: "20%", y: "40%" },
    { src: "/Buttons/redcamp.png", x: "40%", y: "60%" },
  ];

  const sendToMission = (missionName: string) => {
    setSelectedMissionName(missionName);
    setOpenSendToMissionModal(true);
  };

  async function fetchData() {
    setLoadingNFTs(true);
    try {
      const response = await axios.get("/api/getNfts", {
        params: { publicKey: publicKey?.toBase58() },
      });

      let theMint = "";

      try {
        if (response.data.gameNFTs.length > 0) {
          theMint = response.data.gameNFTs[0].mintId;
        }
        else if (response.data.WallStreet.length > 0) {
          theMint = response.data.WallStreet[0].mintId;
        }
        else if (response.data.StateFair.length > 0) {
          theMint = response.data.StateFair[0].mintId;
        }
        else if (response.data.Hospital.length > 0) {
          theMint = response.data.Hospital[0].mintId;
        }
        setProfilePic(theMint);
      }
      catch (e) {
        console.log(e);
      }


      setWalletNFTs(response.data.walletNFTs);
      setGameNFTs(response.data.gameNFTs);
      setWallStreetNfts(response.data.WallStreet);
      setStateFairNfts(response.data.StateFair);
      setHospitalNfts(response.data.Hospital);
      setLoadingNFTs(false);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setLoadingNFTs(false);
    }
  }

  async function fetchBalance() {
    try {
      const response = await mariusApi.escrowDetails(publicKey?.toBase58() || '');

      console.log("responsed", response.data.splBalance);
      setBalance(Math.floor(response.data.splBalance));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }

  useEffect(() => {
    if (publicKey) {
      fetchData();
      fetchBalance();
    }
  }, [publicKey]);

  const handleBalanceChange = (isOpen: any) => {
    if (isOpen) {
      setTimeout(() => {
        fetchBalance();
      }, 2000);
    }
  };

  const handleNftChange = async (isOpen: any) => {
    if (isOpen) {
      try {
        const response = await axios.get("/api/getNfts", {
          params: { publicKey: publicKey?.toBase58() },
        });

        setWalletNFTs(response.data.walletNFTs);
        setGameNFTs(response.data.gameNFTs);
        setWallStreetNfts(response.data.WallStreet);
        setStateFairNfts(response.data.StateFair);
        setHospitalNfts(response.data.Hospital);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      }
    }
  };

  useEffect(() => {
    const handleAction = async (event: any) => {
      setTimeout(() => {
        handleBalanceChange(true);
      }, 2000);
      const response = await axios.get("/api/getNfts", {
        params: { publicKey: publicKey?.toBase58() },
      });

      setWalletNFTs(response.data.walletNFTs);
      setGameNFTs(response.data.gameNFTs);
      setWallStreetNfts(response.data.WallStreet);
      setStateFairNfts(response.data.StateFair);
      setHospitalNfts(response.data.Hospital);
      setTimeout(() => {
        handleBalanceChange(true);
      }, 2000);
    };

    window.addEventListener("level-upgrade", handleAction);
    console.log("publicKey", publicKey);

    return () => {
      window.removeEventListener("level-upgrade", handleAction);
    };
  }, [publicKey]);

  const handleOwnership = async () => {
    setMessageSigned(false);
    try {
      if (!wallet.connected) {
        walletModal.setVisible(true);
      }

      if (!wallet.publicKey || !wallet.signMessage) return;

      const message = `sign in at: ${Math.floor(Date.now() / 1000)}`;
      const encoder = new TextEncoder();
      const signature = await wallet.signMessage!(encoder.encode(message));
      const serializedSignature = bs58.encode(signature);

      if (serializedSignature) {
        setMessageSigned(true);
        const response = await axios.post(
          "https://rest-api.hellomoon.io/v0/auth/create_jwt",
          {
            wallet: wallet.publicKey?.toBase58(),
            signature: serializedSignature,
            message: message,
          },
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );

        const jwt = response.data.jwt;
        setcsrf(jwt);
        setCookie("csrf", jwt);
        setMessageSigned(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const isMessageSigned = Boolean(csrfToken);
    setMessageSigned(isMessageSigned);

    const isTokenExpired = () => {
      if (!csrfToken) return true;

      try {
        const payloadBase64 = csrfToken.split(".")[1];
        const decodedPayload = JSON.parse(window.atob(payloadBase64));
        const exp = decodedPayload.exp;
        const jwtWallet = decodedPayload.wallet;
        const isExpired = Date.now() >= exp * 1000; // Convert to milliseconds
        return isExpired;
      } catch (error) {
        console.error("Error decoding token:", error);
        return true;
      }
    };

    if (csrfToken && isTokenExpired()) {
      deleteCookie("csrf");
      setcsrf(null);
      setMessageSigned(false);
      window.location.reload();
    }
    setOpenChat(false);

    socket.on('wallet', (response) => {
      if (response.isWalletLogin == 'true') {
        setIsLogin(true);
        setUserName(response.username)
      }
      else setIsLogin(false)
    })
  }, []);

  useEffect(() => {
    const isTokenValid = () => {
      if (!csrfToken) return false;

      try {
        const payloadBase64 = csrfToken.split(".")[1];
        const decodedPayload = JSON.parse(window.atob(payloadBase64));
        const jwtWallet = decodedPayload.wallet;
        return jwtWallet === publicKey?.toBase58();
      } catch (error) {
        console.error("Error decoding token:", error);
        return false;
      }
    };

    if (publicKey && csrfToken) {
      if (!isTokenValid()) {
        console.error("Token is invalid for the current publicKey.");
        deleteCookie("csrf");
        setcsrf(null);
        setMessageSigned(false);
        window.location.reload();
      }
    }
  }, [publicKey, csrfToken]);

  if (!publicKey || !messageSigned) {
    return (
      <LoginPage
        handleOwnership={handleOwnership}
        messageSigned={messageSigned}
      />
    );
  }

  if (loadingNFTs) {
    return <LoadingPage />;
  }

  const handleChatClick = async () => {
    socket.emit('wallet', { walletAddress: publicKey?.toBase58() })
    try {
      const response = await axios.post('https://web-camxq60inzhu.up-fi-hel1-k8s-1.apps.run-on-seenode.com/api/chat/wallet', { walletAddress: publicKey?.toBase58() });
      if (response.data.isWalletLogin === 'true') {
        setIsLogin(true);
        const user = response.data.username
        await setUserName(user);
      }
      else setIsLogin(false);
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <RewardsModal
        open={openRewards}
        setOpen={setOpenRewards}
        key={handleNftChange}
      />
      <SendToMissionModal
        open={openSendToMissionModal}
        setOpen={setOpenSendToMissionModal}
        missionName={selectedMissionName}
        walletNFTs={walletNFTs}
        gameNFTs={gameNFTs}
        handleNftChange={handleNftChange}
      />
      <ManageWalletPopUp
        gameNFTs={gameNFTs}
        setGameNFTs={setGameNFTs}
        open={openWalletPopUp}
        setOpen={setOpenWalletPopUp}
        walletNFTs={walletNFTs}
        setWalletNFTs={setWalletNFTs}
        handleNftChange={handleNftChange}
      />
      <CampModal
        open={openCamp}
        setOpen={setOpenCamp}
        walletNFTs={gameNFTs}
        hospitalNfts={hospitalNfts}
        stateFairNfts={stateFairNfts}
        wallStreetNfts={wallStreetNfts}
        isHospitalOpened={isHospitalOpened}
        key={isHospitalOpened}
        handleNftChange={handleNftChange}
      />
      <CasinoModal
        open={openCasino}
        balance={balance}
        setOpen={setOpenCasino}
        handleBalanceChange={handleBalanceChange}
      />
      <RaffleModal
        open={openRaffle}
        balance={balance}
        setOpen={setOpenRaffle}
        handleBalanceChange={handleBalanceChange}
      />
      <ChatModal
        open={openChat}
        balance={balance}
        setOpen={setOpenChat}
        userName={username}
        setUserName={setUserName}
        handleBalanceChange={handleBalanceChange}
        walletAddress={publicKey?.toBase58()}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        unreadMessage={unreadMessage}
        setUnreadMessage={setUnreadMessage}
        alert={alert}
        setAlert={setAlert}
        avatarUrl={avatarUrl}
      />
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 h-full w-full object-cover"
      >
        <source src="/map.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="w-full h-52 z-0 left-0 right-0  absolute top-0 bg-gradient-to-b from-black to-transparent"></div>
      <div className="w-full h-52 z-0 left-0 right-0  absolute bottom-0 bg-gradient-to-t from-black to-transparent"></div>

      <div className=" p-10">
        {mapImages.map((image, index) => (
          <div
            key={index}
            onMouseOver={() => setIsHovered(true)}
            onMouseOut={() => setIsHovered(false)}
            style={{
              position: "absolute",
              top: image.y,
              left: image.x,
              transform: "translate(-50%, -50%)",
            }}
            className="w-[140px] z-50 relative h-[30px] cursor-pointer bg-white/0 flex items-center justify-center"
          >
            <img src={image.src} alt={`Map Area ${index + 1}`} />
          </div>
        ))}

        <div className="w-full z-[97] relative flex items-center justify-between">
          <div className="flex relative z-[97] items-start gap-5">
            <div className="flex items-center gap-2">
              <div className="h-auto p-[3px]  w-full rounded-xl bg-gradient-to-b from-[#FF0046] via-[#FF0046] to-transparent">
                <div className="flex cursor-pointer hover:opacity-90  gap-2 h-full w-full rounded-lg items-center justify-between bg-black/90 back">
                  <div className="w-[80px] h-[80px] bg-black rounded-lg">
                    <img
                      src={!profilePic ? "" : "https://cdn.hellomoon.io/public/marius/" + profilePic + ".png"}
                      className=" rounded-lg h-auto"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div
                  onClick={() => {
                    setOpenWalletModal(false);
                    setOpenFundsModal((prev) => !prev);
                  }}
                  className="h-auto p-[1px]  w-full rounded-lg bg-gradient-to-b from-[#FF0046] via-[#FF0046] to-transparent"
                >
                  <div className="flex text-white cursor-pointer hover:opacity-90 px-4 py-2 gap-2 h-full w-full rounded-lg items-center justify-between bg-black/90 back">
                    <div className="flex items-center gap-2">
                      <img src="/coin.png" className="w-[25px]" /> {balance}
                    </div>
                    <IoIosArrowForward
                      className={`text-white ${openFundsModal ? "rotate-180" : ""
                        }`}
                    />
                  </div>
                </div>
                <div
                  onClick={() => {
                    setOpenFundsModal(false);
                    setOpenWalletModal((prev) => !prev);
                  }}
                  className="h-auto p-[1px]  w-full rounded-lg bg-gradient-to-b from-[#FF0046] via-[#FF0046] to-transparent"
                >
                  <div className="flex  text-white cursor-pointer hover:opacity-90 px-4 py-2 gap-2 h-full w-full rounded-lg items-center justify-between bg-black/90 back">
                    <div className="flex text-white items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M18.75 14.9999V16.5624C18.75 17.4243 18.0487 18.1249 17.1875 18.1249H3.75C2.37125 18.1249 1.25 17.0036 1.25 15.6249C1.25 15.6249 1.25 5.00925 1.25 4.99988C1.25 3.62113 2.37125 2.49988 3.75 2.49988H15.3125C15.8306 2.49988 16.25 2.91988 16.25 3.43738C16.25 3.95488 15.8306 4.37488 15.3125 4.37488H3.75C3.40563 4.37488 3.125 4.65488 3.125 4.99988C3.125 5.34488 3.40563 5.62488 3.75 5.62488H17.1875C18.0487 5.62488 18.75 6.3255 18.75 7.18738V8.74988H15.625C13.9019 8.74988 12.5 10.1518 12.5 11.8749C12.5 13.598 13.9019 14.9999 15.625 14.9999H18.75Z"
                          fill="#FCB72A"
                        />
                        <path
                          d="M18.75 9.99988V13.7499H15.625C14.5894 13.7499 13.75 12.9105 13.75 11.8749C13.75 10.8393 14.5894 9.99988 15.625 9.99988H18.75Z"
                          fill="#FCB72A"
                        />
                      </svg>{" "}
                      WALLET
                    </div>
                    <IoIosArrowForward
                      className={`text-white ${openWalletModal ? "rotate-180" : ""
                        }`}
                    />
                  </div>
                </div>
              </div>
            </div>
            {openFundsModal && (
              <FundsModal
                setOpen={setOpenFundsModal}
                open={openFundsModal}
                onBalanceChange={handleBalanceChange}
                balance={balance}
              />
            )}
            {openWalletModal && (
              <ManageWalletModal
                setOpen={setOpenWalletModal}
                open={openWalletModal}
                openPopUp={openWalletPopUp}
                setWalletNFTs={setWalletNFTs}
                setOpenPopup={setOpenWalletPopUp}
              />
            )}
          </div>
          <button
            className="g-[url('/box.png')] bg-cover w-[63px] h-[63px] absolute z-[97] right-[75px] flex items-center justify-center"
            onClick={() => setOpenRaffle(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="63" height="63" viewBox="0 0 63 63" fill="none">
              <g filter="url(#filter0_b_792_644)">
                <rect width="63" height="63" rx="12.7462" fill="black" fill-opacity="0.83" />
                <rect x="0.5" y="0.5" width="62" height="62" rx="12.2462" stroke="url(#paint0_linear_792_644)" />
              </g>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M42.0834 44.0485C39.5733 46.0882 36.4331 47.3826 33 47.5943V34.9651L42.0834 44.0485ZM35.0445 31.1367L47.9927 31.1367C47.8855 27.559 46.6037 24.2764 44.5198 21.6614L35.0445 31.1367ZM47.9295 33.1367C47.5834 36.8305 45.9815 40.1593 43.5553 42.692L34 33.1367L47.9295 33.1367ZM29.1716 31.1367L19.5765 21.5417C17.4359 24.1759 16.1162 27.5042 16.0073 31.1367L29.1716 31.1367ZM16.0705 33.1367L30.216 33.1367L20.551 42.8018C18.0653 40.2559 16.4217 36.8841 16.0705 33.1367ZM33 15.6558L33 30.3527L43.1768 20.176C40.5155 17.5776 36.9518 15.8995 33 15.6558ZM31 35.1812L22.0364 44.1448C24.5262 46.129 27.6213 47.3859 31 47.5943V35.1812ZM31 30.1367V15.6558C27.1023 15.8961 23.5822 17.5319 20.9331 20.0698L31 30.1367Z" fill="#FCB72A" />
              <path d="M31.758 22.5322C31.8835 22.6844 32.1165 22.6844 32.242 22.5322L38.5048 14.939C38.6736 14.7344 38.528 14.4257 38.2628 14.4257H25.7372C25.472 14.4257 25.3264 14.7344 25.4952 14.939L31.758 22.5322Z" fill="white" />
              <circle cx="31.9998" cy="31.5472" r="4.07843" fill="white" />
              <defs>
                <filter id="filter0_b_792_644" x="-12.7462" y="-12.7462" width="88.4924" height="88.4924" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feGaussianBlur in="BackgroundImageFix" stdDeviation="6.37309" />
                  <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_792_644" />
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_792_644" result="shape" />
                </filter>
                <linearGradient id="paint0_linear_792_644" x1="31.5" y1="0" x2="31.5" y2="63" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#FCB72A" />
                  <stop offset="1" stop-color="#FCB72A" stop-opacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </button>
          <div className="bg-[url('/box.png')] opacity-100 relative flex items-center justify-center bg-cover w-[63px] h-[63px]"
            onClick={() => {
              setOpenChat(true);
              handleChatClick();
            }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 35 35"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M26.25 1.64062C31.0625 1.64062 35 5.57812 35 10.3906V20.2344C35 25.0469 31.0625 28.9844 26.25 28.9844H10.1719C9.1875 28.9844 8.3125 29.3125 7.54688 29.8594L3.5 32.9219C2.51562 33.6875 1.20312 33.4688 0.4375 32.4844C0.109375 32.1562 0 31.6094 0 31.1719V10.3906C0 5.57812 3.9375 1.64062 8.75 1.64062H26.25ZM23.4062 12.6875C22.8594 12.4688 22.2031 12.6875 21.9844 13.2344C21.2188 14.7656 19.4688 15.8594 17.5 15.8594C15.5312 15.8594 13.7812 14.7656 13.0156 13.2344C12.7969 12.6875 12.1406 12.4688 11.5938 12.6875C11.0469 12.9062 10.8281 13.5625 11.0469 14.1094C12.1406 16.4062 14.7656 18.0469 17.5 18.0469C20.2344 18.0469 22.8594 16.5156 23.9531 14.1094C24.1719 13.5625 23.9531 12.9062 23.4062 12.6875Z"
                fill="#FCB72A"
              />
            </svg>
            <div className="bg-[#FCB72A] absolute -top-2 -right-2 font-bold w-[26px] h-[26px] rounded-full flex items-center justify-center text-black">
              {alert}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 ">
        <div>
          <div
            onClick={() => setOpenCasino(true)}
            onMouseOver={() => setIsCasinoHovered(true)}
            onMouseOut={() => setIsCasinoHovered(false)}
            style={{
              position: "absolute",
              top: casinoPosition.y,
              left: casinoPosition.x,
              transform: "translate(-50%, -50%)",
            }}
            className="w-[540px] h-[130px] cursor-pointer bg-transparent z-10"
          />
          {isCasinoHovered && (
            <div
              className="absolute inset-0 bg-no-repeat bg-center bg-cover"
              style={{ backgroundImage: "url('/Areas/Cassino.png')" }}
            />
          )}
        </div>
        <div>
          <div
            onClick={() => {
              setIsHospitalOpened(true);
              setOpenCamp(true);
            }}
            onMouseOver={() => setIsHospitalHovered(true)}
            onMouseOut={() => setIsHospitalHovered(false)}
            style={{
              position: "absolute",
              top: hospitalPosition.y,
              left: hospitalPosition.x,
              transform: "translate(-50%, -50%)",
            }}
            className="w-[400px] h-[190px] bg-transparent cursor-pointer z-10"
          />
          {isHospitalHovered && (
            <div
              className="absolute inset-0 bg-no-repeat bg-center bg-cover"
              style={{ backgroundImage: "url('/Areas/Hospital.png')" }}
            />
          )}
        </div>
        <div>
          <div
            onClick={() => sendToMission("StateFair")}
            onMouseOver={() => setIsStateFairHovered(true)}
            onMouseOut={() => setIsStateFairHovered(false)}
            style={{
              position: "absolute",
              top: stateFairPosition.y,
              left: stateFairPosition.x,
            }}
            className="w-[550px] h-[300px] bg-transparent cursor-pointer z-10 -rotate-[30deg]"
          />
          {isStateFairHovered && (
            <div
              className="absolute inset-0 bg-no-repeat bg-center bg-cover"
              style={{ backgroundImage: "url('/Areas/StateFair.png')" }}
            />
          )}
        </div>
        <div>
          <div
            onClick={() => sendToMission("WallStreet")}
            onMouseOver={() => setIsWallStreetHovered(true)}
            onMouseOut={() => setIsWallStreetHovered(false)}
            style={{
              position: "absolute",
              top: wallStreetPosition.y,
              left: wallStreetPosition.x,
            }}
            className="w-[300px] h-[250px] bg-transparent cursor-pointer z-10 -rotate-[20deg]"
          />
          {isWallStreetHovered && (
            <div
              className="absolute inset-0 bg-no-repeat bg-center bg-cover"
              style={{ backgroundImage: "url('/Areas/WallStreet.png')" }}
            />
          )}
        </div>
        <div>
          <div
            onClick={() => {
              setIsHospitalOpened(false);
              setOpenCamp(true);
            }}
            onMouseOver={() => setIsCampHovered(true)}
            onMouseOut={() => setIsCampHovered(false)}
            style={{
              position: "absolute",
              top: campPosition.y,
              left: campPosition.x,
            }}
            className="w-[620px] h-[250px] bg-transparent cursor-pointer z-10 -rotate-[20deg]"
          />
          {isCampHovered && (
            <div
              className="absolute inset-0 bg-no-repeat bg-center bg-cover"
              style={{ backgroundImage: "url('/Areas/Camp.png')" }}
            />
          )}
        </div>
        <div>
          <div
            onClick={() => {
              setIsHospitalOpened(false);
              setOpenCamp(true);
            }}
            onMouseOver={() => setIsCampTwoHovered(true)}
            onMouseOut={() => setIsCampTwoHovered(false)}
            style={{
              position: "absolute",
              top: campTwoPosition.y,
              left: campTwoPosition.x,
            }}
            className="w-[400px] h-[400px] bg-transparent cursor-pointer z-10 -rotate-[40deg]"
          />
          {isCampTwoHovered && (
            <div
              className="absolute inset-0 bg-no-repeat bg-center bg-cover"
              style={{ backgroundImage: "url('/Areas/Camp.png')" }}
            />
          )}
        </div>
      </div>
      <div className="z-10 p-10">
        <div className="w-full  z-10 flex items-center justify-between">
          <div
            onClick={() => {
              setIsHospitalOpened(false);
              setOpenCamp(true);
            }}
            className="cursor-pointer hover:opacity-80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="63"
              height="63"
              viewBox="0 0 63 63"
              fill="none"
            >
              <g filter="url(#filter0_b_64_8)">
                <rect width="63" height="63" rx="12.7462" fill="#FCB72A" />
              </g>
              <path
                d="M50.5714 45.4291H47.1343L33.6271 20.6677L36.1114 16.1134C36.49 15.4205 36.2343 14.5534 35.5414 14.1748C34.8486 13.7962 33.9814 14.0534 33.6029 14.7448L32 17.6834L30.3971 14.7448C30.02 14.0534 29.1543 13.7962 28.4586 14.1748C27.7657 14.5534 27.51 15.4205 27.8886 16.1134L30.3729 20.6677L16.8657 45.4291H13.4286C12.64 45.4291 12 46.0691 12 46.8577C12 47.6462 12.64 48.2862 13.4286 48.2862H50.5714C51.36 48.2862 52 47.6462 52 46.8577C52 46.0691 51.36 45.4291 50.5714 45.4291ZM36.2857 45.4291H27.7143V39.7148C27.7143 37.3477 29.6329 35.4291 32 35.4291C34.3671 35.4291 36.2857 37.3477 36.2857 39.7148V45.4291Z"
                fill="black"
              />
              <defs>
                <filter
                  id="filter0_b_64_8"
                  x="-12.7462"
                  y="-12.7462"
                  width="88.4924"
                  height="88.4924"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feGaussianBlur
                    in="BackgroundImageFix"
                    stdDeviation="6.37309"
                  />
                  <feComposite
                    in2="SourceAlpha"
                    operator="in"
                    result="effect1_backgroundBlur_64_8"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_backgroundBlur_64_8"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
          </div>
          <div
            onClick={() => setOpenRewards(true)}
            className="daily  ttbold px-20 py-3 cursor-pointer hover:opacity-80 uppercase text-[#00FF85] relative flex items-center justify-center bg-cover "
          >
            REWARDS
          </div>

          <div className="bg-white/20 gap-5 w-[120px] flex items-center px-4 py-2 rounded-full">
            <div>
              <BsMusicNoteBeamed />
            </div>
            <Switch
              checked={isMusicPlaying}
              onChange={toggleMusic}
              className={classNames(
                isMusicPlaying ? "bg-yellow-600" : "bg-gray-200",
                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none "
              )}
            >
              <span className="sr-only">Use setting</span>
              <span
                className={classNames(
                  isMusicPlaying ? "translate-x-5" : "translate-x-0",
                  "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                )}
              >
                <span
                  className={classNames(
                    isMusicPlaying
                      ? "opacity-0 duration-100 ease-out"
                      : "opacity-100 duration-200 ease-in",
                    "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                  )}
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="h-3 w-3 text-gray-400"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                    />
                  </svg>
                </span>
                <span
                  className={classNames(
                    isMusicPlaying
                      ? "opacity-100 duration-200 ease-in"
                      : "opacity-0 duration-100 ease-out",
                    "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                  )}
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="h-3 w-3 text-yellow-600"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                    />
                  </svg>
                </span>
              </span>
            </Switch>
          </div>
        </div>
      </div>
    </main>
  );
}

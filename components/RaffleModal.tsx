//@ts-nocheck

import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import FlipCard from "react-countdown-flip-card";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { RiTwitterXLine } from "react-icons/ri";
import confetti from 'canvas-confetti';
import {
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAccount
} from '@solana/spl-token';
import {
  PublicKey,
  Transaction,
  Connection,
  TransactionInstruction
} from '@solana/web3.js';
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import axios from "axios";



export default function RaffleModal({
  open,
  balance,
  setOpen,
  handleBalanceChange
}: any) {
  const { connection } = useConnection();
  const [ticketCounter, setTicketCounter] = useState(1);
  const [tickets, setTickets] = useState(10);
  const [ticketPrice, setTicketPrice] = useState(5);
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const [signatureHash, setSignatureHash] = useState("")
  const [nickName, setNickName] = useState("")
  const [currentTokens, setCurrentTokens] = useState(0);
  const [buyLoad, setBuyLoad] = useState(false);
  const [image, setImage] = useState("/nftImage.png");
  const [name, setName] = useState("SMB Gen3")
  const [restTime, setRestTime] = useState(
    new Date(new Date().getTime() + 1000000)
  );
  const [purchasedTickets, setPurchasedTickets] = useState("0");
  const [confirm, setConfirm] = useState(false)
  const handleTicketCounter = (event) => {
    if (event == "minus") {
      if (ticketCounter > 1) {
        setTicketCounter(ticketCounter - 1)
      }
    } else {
      setTicketCounter(ticketCounter + 1)
    }
  }
  const configureAndSendCurrentTransaction = async (
    transaction: Transaction,
    connection: Connection,
    feePayer: PublicKey,
    signTransaction: SignerWalletAdapterProps['signTransaction']
  ) => {
    const blockHash = await connection.getLatestBlockhash();
    transaction.feePayer = feePayer;
    transaction.recentBlockhash = blockHash.blockhash;
    const signed = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction({
      blockhash: blockHash.blockhash,
      lastValidBlockHeight: blockHash.lastValidBlockHeight,
      signature
    });
    return signature;
  };
  const handleChangeNickName = (event) => {
    setNickName(event.target.value);
  };
  const sendRazeToken = async () => {
    setBuyLoad(true);
    const data = await axios.post("https://last-haven-server.onrender.com/api/buyTicketInfo/getInvaild")
    if (data.data == "expired") {
      toast.error("Raffle ended")
    } else {
      const toPublicKey = new PublicKey("5TrmjfzsnTEg7xzuHHsYzzjxnZYgXHZ41HfAYKR5jbBE");
      const mintToken = new PublicKey('3AdohYQukY24FusgsruJ1jxkxocyg4TPPEwYxgkfGHWs');
      const amount = ticketPrice * 100000 * Math.pow(10, 9);
      // const amount = 0.3 * 1000000 * Math.pow(10, 9);
      const transactionInstructions: TransactionInstruction[] = [];
      const associatedTokenFrom = await getAssociatedTokenAddress(
        mintToken,
        publicKey
      );
      const fromAccount = await getAccount(connection, associatedTokenFrom);
      const associatedTokenTo = await getAssociatedTokenAddress(
        mintToken,
        toPublicKey
      );
      if (!(await connection.getAccountInfo(associatedTokenTo))) {
        transactionInstructions.push(
          createAssociatedTokenAccountInstruction(
            publicKey,
            associatedTokenTo,
            toPublicKey,
            mintToken
          )
        );
      }
      transactionInstructions.push(
        createTransferInstruction(
          fromAccount.address, // source
          associatedTokenTo, // dest
          publicKey,
          amount // transfer 1 USDC, USDC on solana devnet has 6 decimal
        )
      );
      const transaction = new Transaction().add(...transactionInstructions);
      const signature = await configureAndSendCurrentTransaction(
        transaction,
        connection,
        publicKey,
        signTransaction
      );
      if (signature) {
        setSignatureHash(signature);
        setConfirm(true);
        setBuyLoad(false);
      }
    }
  }
  const getCurrentTokens = async () => {
    const response = await axios.post("https://last-haven-server.onrender.com/api/buyTicketInfo/getTokens", { address: publicKey?.toBase58() })
    setCurrentTokens(response.data.total)
  }
  const sendTransactionResult = async () => {
    const data = {
      tickets: tickets,
      sign: signatureHash,
      publicKey: publicKey?.toBase58(),
      nickName: nickName
    }
    const response = await axios.post("https://last-haven-server.onrender.com/api/buyTicketInfo/create", data)
    setCurrentTokens(response.data.total)
    toast.success("Success")
    setConfirm(false)
  }
  const getEndedTime = async () => {
    const response = await axios.post("https://last-haven-server.onrender.com/api/ticket/getTicketInfo");
    const targetTime = new Date(`${response.data.deadline}:00`);
    setImage(response.data.image);
    setName(response.data.ticketName);
    const timezoneOffset = targetTime.getTimezoneOffset();
    const localDate = new Date(
      targetTime.getTime() - timezoneOffset * 60 * 1000
    );
    setRestTime(localDate);
  }
  const getTickets = async () => {
    const response = await axios.post("https://last-haven-server.onrender.com/api/buyTicketInfo/purchasedTickets");
    setPurchasedTickets(response.data);
  }
  useEffect(() => {
    setTickets(ticketCounter * 10);
    setTicketPrice(ticketCounter * 5);
  }, [ticketCounter])

  useEffect(() => {
    getEndedTime();
    getCurrentTokens();
    getTickets();
  }, [])
  useEffect(() => {
    if (confirm) {
      confetti({
        particleCount: 100,
        spread: 160,
        origin: { y: 0.6 }
      });
    }
  }, [confirm]);


  return (
    <>
      {open == true ? (
        <>
          <div className="absolute flex w-full h-full items-center z-[98] justify-center bg-black/20 backdrop-blur-[4px]" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false); // Close the modal only if the click occurred on the outer div
            }
          }}>
            <div className="inline-flex w-[810px] h-[580px] left-[15%]  bg-black/50 backdrop-blur-[4px] rounded-[20px]">
              <div className="relative w-[45%] mr-[5%] h-full">
                <img className="w-full h-full object-cover rounded-l-[20px]" src={image} />
                <div className="absolute w-full top-[5%] flex items-center justify-center">
                  <div className="w-[36%] bg-black/80 flex items-center justify-center z-[999] text-white aspect-[3.5/1] rounded-[10px] text-[14px]">{name}</div>
                </div>
              </div>
              <div className="relative w-[50%] h-full">
                <button className="ml-[80%] mt-[52px]" onClick={() => { setOpen(false) }}>
                  <img src="/close.png"></img>
                </button>
                <div className="text-white text-[20px]">Raffle ends in</div>
                <FlipClockCountdown
                  className="mt-[2%]"
                  digitBlockStyle={{
                    width: 20,
                    height: 30,
                    fontSize: 15,
                  }}
                  dividerStyle={{ color: "transparent", height: 0 }}
                  separatorStyle={{ color: "white", size: "4px" }}
                  labelStyle={{
                    fontSize: 0,
                    fontWeight: 0,
                    color: "transparent",
                  }}
                  to={restTime}
                />
                <div className="text-[23px] mt-[25px] text-white">Total Tickets Purchased: {purchasedTickets}</div>
                <div className="text-[23px] mt-[17px] text-white">You will receive</div>
                <div className="inline-flex w-full mt-[3%]">
                  <div className="w-[45%] mr-[10%] bg-black/70 h-[65px] rounded-[7px] px-[20px] py-[20px] inline-flex align-middle items-center justify-center text-[23px]">
                    <FlipCard
                      digit={tickets}
                      width={90}
                      height={40}
                    />
                    <div className="text-[26px] ml-[10px]">🎟️</div>
                  </div>
                  <div className="w-[30%] flex items-center justify-center bg-black/90 px-[3%] h-[65px] rounded-[10px]">
                    <button className="w-1/3 flex items-center justify-center" onClick={() => { handleTicketCounter("minus") }}><img className="w-[19px]" src="/minus.svg" /></button>
                    <div className="w-1/3 text-white flex items-center mt-[2px] justify-center font-bold text-[25px]">{ticketCounter}</div>
                    <button className="w-1/3 flex items-center justify-center" onClick={() => { handleTicketCounter("plus") }}><img className="w-[19px]" src="/plus.svg" /></button>
                  </div>
                </div>
                <button
                  className="mt-[40px] bg-black border border-[#D679BC] w-[88%] rounded-[6px] h-[40px] text-white inline-flex items-center justify-center"
                  onClick={() => { sendRazeToken() }}
                >{!buyLoad ? (
                  <>
                    BUY FOR
                    <img className="mx-[6px]" src="/coin.png" />
                    {(ticketPrice * 100000).toLocaleString()}
                  </>) : (
                  <>
                    <video
                      src="/loading.mp4"
                      className="h-full"
                      autoPlay
                      muted
                      loop
                    ></video>
                  </>)
                  }

                </button>
                <div className="mt-[5%] w-[88%] inline-flex items-center justify-center text-white 2xl:text-[13px] text-[11px]">Raffle tickets cannot be refunded once bought</div>
                <div className="mt-[5%] w-[88%] inline-flex items-center justify-center text-white text-[20px] 2xl:mb-[0px] mb-[40px]">You own {currentTokens} 🎟️</div>
              </div>
            </div>
          </div>
          {confirm == true ? (
            <>
              <div className="absolute flex justify-center items-center z-[99] w-screen h-screen inset-0 bg-black/50  backdrop-blur-[4px]" style={{
                transition: 'transform 0.3s ease',
              }}>
                <div className="flex justify-center items-center w-full h-full md:w-[665px] md:h-[450px] bg-black/70 rounded-[20px]  backdrop-blur-[30px]" style={{
                  transform: 'scale(1)',
                }}>
                  <div className="flow-root items-center children-div">
                    <div className="text-[35px] text-center font-bold text-[#2cff3e] mb-[20px]">
                      Good Luck!
                    </div>
                    <div className="inline-flex">
                      <div className="w-1/12"></div>
                      <div
                        className={`w-10/12 text-[20px] text-center text-white mb-[20px]`}
                      >
                        <div>"In a world that's fallen apart, you don't wait for others to hand you a chance. You grab it, you own it, and you live on your own terms, no matter how tough it gets."</div>
                        <div className="mt-[10px]">- Negan, The Walking Dead.</div>
                      </div>
                      {/* ${poppinsSmall.variable} */}
                    </div>
                    <div className="flex justify-center items-center w-full mb-[40px]">
                      <div className="w-[340px] border-b-2"></div>
                    </div>
                    <div className="flex justify-center items-center w-full">
                      <div className="w-[250px] border inline-flex items-center border-white/25 rounded-lg">
                        <RiTwitterXLine className="text-white w-[15px] h-[15px] my-3 ml-3 group-hover:text-[#FF0046]" />
                        <input
                          placeholder="Your twitter nickname"
                          onChange={handleChangeNickName}
                          className="bg-white/0 ml-[20px] border-white/5 outline-none text-[15px] h-full text-white"
                        ></input>
                      </div>
                    </div>
                    <div className="flex justify-center items-center w-full mt-[20px]">
                      <button
                        className="w-[250px] bg-black/50 backdrop-blur-[4px] border border-[#D679BC] text-[18px] font-bold text-white py-2 rounded-lg"
                        onClick={() => {
                          sendTransactionResult();
                        }}
                      >
                        Enter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
}

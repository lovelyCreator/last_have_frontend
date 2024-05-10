//@ts-nocheck

import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
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



export default function MessageModal({
  image,
  message,
  time,
  seen,
  setSeen
}: any) {
  return (
    <>
        <div className="flex w-[90%] h-full justify-start z-[98]" onClick={(e) => {
        if (e.target === e.currentTarget) {
            setOpen(false); // Close the modal only if the click occurred on the outer div
        }
        }}>
        <div className="inline-flex w-[325px] h-[584px] left-[15%]  bg-black/85 backdrop-blur-[4px] rounded-[12.75px]">

            <div className="relative w-[100%] h-full justify-center items-center">
            {islogin == true ? (
                <>
                <button className="ml-[87%] mt-[14px]" onClick={() => { setOpen(false) }}>
                    <img src="/close.png"></img>
                </button>
                <div className="inline-flex w-[100%] h-[80.5%] justify-center">
                    
                    {}
                </div>
                <div className="inline-flex w-[100%] h-[34px] justify-center">
                    <input type="text" class="bg-black/60 w-[79%] rounded-[6px] h-[34px] text-xs text-white mr-[5px] border border-555555 pl-[10px]" placeholder='Write a message...'>
                    </input>
                    <button
                    onClick = {() => setIsLogin(false)}
                    className="bg-white w-[34px] rounded-[6px] h-[34px] text-white inline-flex items-center justify-center"
                    >
                    <img className="mx-[6px]" src="/send.png" />
                    </button>
                </div>
                </>
            ):(
                <>
                <button className="ml-[87%] mt-[14px]" onClick={() => { setOpen(false) }}>
                    <img src="/close.png"></img>
                </button>
                <div className="flex flex-col w-[100%] h-[70%] justify-center items-center">
                    <input type="text" class="bg-black/60 w-[80%] rounded-[6px] h-[40px] text-sm text-white border border-555555 pl-[10px] mb-[3px]" placeholder='Write a message...'
                    onClick={()=>setIsValid(!isValid)}
                    />
                    {
                    isValid == true ? (
                        <p className="text-[#EE3300] text-xs">Validation Error! The user already exists.</p>
                    ): (null)
                    }
                    <button
                    className="bg-white w-[80%] rounded-[6px] h-[40px] text-white inline-flex items-center justify-center mt-[20px]"
                    onClick = {() => setIsLogin(true)}
                    >
                    <img className="mx-[6px]" src="/send.png" />
                    </button>
                </div>
                </>
            )

            }
            </div>
        </div>
        </div>
          
    </>
  );
}

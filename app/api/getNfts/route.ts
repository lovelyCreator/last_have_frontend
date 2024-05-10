//@ts-nocheck

import { NextRequest, NextResponse } from "next/server";
import { Metadata, Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import axios from "axios";
import * as anchor from "@project-serum/anchor";
import { NextApiRequest, NextApiResponse } from "next";
import { DEV } from "@/lib/utils";
import { mariusApi } from "@/lib/api/marius-api";
import { NFT } from "@/lib/interfaces";
import {MAPPING} from "./mapping"
const endpoint = DEV
  ? "https://rpc-devnet.hellomoon.io/15b3c970-4cdc-4718-ac26-3896d5422fb6"
  : "https://rpc.hellomoon.io/2aac76c6-9590-400a-bfbb-1411c9716810";

const enum ZoneAddresses {
  WALL_STREET = "75P3nPKWKNbjzdqsbRNLY2TDso37cD5NfDiAriigmRkm",
  STATE_FAIR = "6d6Us2rCcMEJKosLAMkvCYSy61E2KzzU6VFMWgDEfj2B",
}

const connection = new anchor.web3.Connection(endpoint);

const metaplex = new Metaplex(connection);

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const publicKey = request.nextUrl.searchParams.get("publicKey");

    if (!publicKey) {
      return new NextResponse("publicKey  is required", { status: 400 });
    }

    const user = new PublicKey(publicKey);
    const gameNftsResponse = await mariusApi.listNftsInGame(publicKey);
    let nftInGameObject = JSON.parse(gameNftsResponse.data);
    const gameNftsData = new Map(
      nftInGameObject.map((nft: NFT) => [nft.mintId, nft])
    );
    let nfts: Metadata[] = (await metaplex
      .nfts()
      .findAllByOwner({ owner: user })) as any;

    const filteredNfts = nfts.filter((nft) =>
      nft.name.startsWith("Last Haven #")
    );

    const gameNFTs = [];
    const walletNFTs = [];
    const WallStreet = [];
    const StateFair = [];
    const Hospital = [];

    for (const nft of filteredNfts) {
      const gameData = gameNftsData.get(nft.mintAddress.toString());
      let theJson = MAPPING[nft.mintAddress.toString()];
      if (gameData && gameData.inGame === 1) {
        if (gameData.inHospital === 1) {
          Hospital.push({
            ...gameData,
            json: theJson,
          });
        } else if (gameData.inZone === 0) {
          gameNFTs.push({
            ...gameData,
            json: theJson,
          });
        } else if (gameData.zoneAddyIn === ZoneAddresses.WALL_STREET) {
          WallStreet.push({
            ...gameData,
            json: theJson,
          });
        } else if (gameData.zoneAddyIn === ZoneAddresses.STATE_FAIR) {
          StateFair.push({
            ...gameData,
            json: theJson,
          });
        }
      } else {
        walletNFTs.push({
          name: nft.name,
          mintId: nft.mintAddress,
          json: theJson,
        });
      }
    }

    return NextResponse.json({
      gameNFTs,
      walletNFTs,
      WallStreet,
      StateFair,
      Hospital,
    });
  } catch (error) {
    console.log("[NFTS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

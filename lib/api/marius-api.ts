import axios from "axios";
import { DEV } from "../utils";

const HM_URL = DEV
  ? "https://dev-rest-api.hellomoon.io/v0/hello-moon/idle-games"
  : "https://rest-api.hellomoon.io/v0/hello-moon/idle-games";

const createBody = (action: string, data: object) => {
  return {
    game: "marius-game",
    action,
    data,
  };
};

const createGeneralBody = (action: string, data: object) => {
  return {
    game: "general-game",
    action,
    data,
  };
};

const API_KEY = DEV
  ? "cffc4c13-c7a6-4667-bf4a-f0a8fcd94116"
  : "15b3c970-4cdc-4718-ac26-3896d5422fb6";

const send = async (action: string, data: object) => {
  try {
    const response = await axios.post(HM_URL, createBody(action, data), {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("An error occurred while sending the request:", error);
  }
};

const sendGeneral = async (action: string, data: object) => {
  try {
    const response = await axios.post(HM_URL, createGeneralBody(action, data), {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("An error occurred while sending the request:", error);
  }
};

export const mariusApi = {
  enterGame: async (wallet: string, mints: string[]) => {
    return await send("marius-enter-game-create-txn", {
      wallet,
      mints,
    });
  },
  exitGame: async (wallet: string, mints: string[]) => {
    return await send("marius-exit-game-create-txn", {
      wallet,
      mints,
    });
  },
  exitHospital: async (wallet: string, mint: string, methodOfLeaving: number, jwt: string | null) => {

    console.log("method of leaving: ", methodOfLeaving)
    return await send("marius-exit-hospital", {
      methodOfLeaving: methodOfLeaving,
      wallet,
      mint,
      jwt,
    });
  },
  listNftsInGame: async (wallet: string) => {
    return await send("marius-list-nfts-in-game", {
      wallet,
    });
  },
  listNftsInZone: async (wallet: string, zone: string) => {
    return await send("marius-list-nfts-in-zone", {
      wallet,
      zone,
    });
  },
  listNftsInHospital: async (wallet: string) => {
    return await send("marius-list-nfts-in-hospital", {
      wallet,
    });
  },
  listRewards: async (wallet: string) => {
    return await send("marius-list-rewards", {
      wallet,
    });
  },
  buyLevel: async (wallet: string, mint: number, jwt: string | null) => {
    return await send("marius-buy-level", {
      wallet,
      mint,
      jwt,
    });
  },
  enterZone: async (
    wallet: string,
    mints: string[],
    zone: string,
    actions: string[],
    jwt: string | null
  ) => {
    return await send("marius-enter-zone", {
      wallet,
      mints,
      zone,
      actions,
      jwt,
    });
  },
  exitZone: async (wallet: string, mints: string, jwt: string | null) => {
    return await send("marius-exit-zone", {
      wallet,
      mints,
      jwt,
    });
  },
  spinSlot: async (wallet: string, amount: number, jwt: string | null) => {
    return await send("marius-spin-slot", {
      wallet,
      amount,
      jwt,
    });
  },
  depositEscrow: async (wallet: string, amount: number) => {
    return await sendGeneral("deposit-escrow", {
      wallet,
      amount,
      depositType: "SPL",
      application: "MARIUS",
    });
  },
  withdrawEscrow: async (wallet: string, amount: number) => {
    return await sendGeneral("withdraw-escrow", {
      wallet,
      amount,
      depositType: "SPL",
      application: "MARIUS",
    });
  },
  escrowDetails: async (wallet: string) => {
    return await sendGeneral("escrow-details", {
      wallet,
      application: "MARIUS",
    });
  },
};

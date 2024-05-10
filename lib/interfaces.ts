export interface NFT {
  bump: number;
  defenseStat: number;
  healthStat: number;
  inGame: number; // 1 for true, 0 for false - adjust as per your data structure
  inHospital: number; // Similar to inGame
  inZone: number; // Similar to inGame
  meleeStat: number;
  mintId: string; // The unique identifier for the NFT
  owner: string; // Owner's wallet address
  timestampAllowedToLeave: string; // Could be a number or string depending on your data format
  xp: string; // Experience points, could be a number or string
  zoneAction: number;
  zoneAddyIn: string; // Address in the zone, format depends on your application
  name?: string; // NFT name, optional if it might not be present
  image?: string; // URL to the NFT image, optional if it might not be present
  mintAddress?: string; // Mint address, optional if it's the same as mintId
}

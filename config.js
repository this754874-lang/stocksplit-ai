// ============================================
// STOCKSPLIT AI CONFIGURATION
// ============================================

// Solana Network
export const NETWORK = "devnet";

// Official Solana Devnet RPC
export const RPC_ENDPOINT =
  "https://api.devnet.solana.com";


// ============================================
// PROGRAM CONFIGURATION
// ============================================

/*
  IMPORTANT:

  PROGRAM_ID will be added ONLY after
  the real StockSplit program is deployed.

  Never use a fake Program ID.
*/

export const PROGRAM_ID = null;


// ============================================
// PROTOCOL SETTINGS
// ============================================

/*
  These values are NOT displayed as
  user balances or fake risk scores.

  Actual borrow calculations will come
  from the deployed on-chain program.
*/

export const PROTOCOL = {

  name: "StockSplit AI",

  network: NETWORK,

  version: "1.0.0-devnet"

};


// ============================================
// EXPLORER
// ============================================

export function getExplorerUrl(signature) {

  return (
    "https://explorer.solana.com/tx/"
    + signature
    + "?cluster=devnet"
  );

}


export function getAddressExplorerUrl(address) {

  return (
    "https://explorer.solana.com/address/"
    + address
    + "?cluster=devnet"
  );

}

import {
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey
} from "https://esm.sh/@solana/web3.js@1.98.0";

/* =========================
   SOLANA CONNECTION
========================= */

const NETWORK = "devnet";

const connection = new Connection(
  clusterApiUrl(NETWORK),
  "confirmed"
);


/* =========================
   ELEMENTS
========================= */

const walletModal = document.getElementById("walletModal");

const connectWalletBtn =
  document.getElementById("connectWalletBtn");

const closeModal =
  document.getElementById("closeModal");

const modalBackdrop =
  document.getElementById("modalBackdrop");

const connectText =
  document.getElementById("connectText");

const networkName =
  document.getElementById("networkName");

const collateralValue =
  document.getElementById("collateralValue");

const borrowedValue =
  document.getElementById("borrowedValue");

const borrowPower =
  document.getElementById("borrowPower");

const riskScore =
  document.getElementById("riskScore");

const riskLabel =
  document.getElementById("riskLabel");

const riskTitle =
  document.getElementById("riskTitle");

const riskDescription =
  document.getElementById("riskDescription");

const analyzeBtn =
  document.getElementById("analyzeBtn");

const simulateBtn =
  document.getElementById("simulateBtn");

const toast =
  document.getElementById("toast");

const depositBtn =
  document.getElementById("depositBtn");

const borrowBtn =
  document.getElementById("borrowBtn");


/* =========================
   APP STATE
========================= */

let walletProvider = null;
let walletPublicKey = null;


/* =========================
   NETWORK DISPLAY
========================= */

networkName.textContent =
  NETWORK.toUpperCase();


/* =========================
   MODAL
========================= */

function openWalletModal() {
  walletModal.classList.remove("hidden");
}

function closeWalletModal() {
  walletModal.classList.add("hidden");
}

connectWalletBtn.addEventListener(
  "click",
  openWalletModal
);

closeModal.addEventListener(
  "click",
  closeWalletModal
);

modalBackdrop.addEventListener(
  "click",
  closeWalletModal
);


/* =========================
   TOAST
========================= */

function showToast(message) {

  toast.textContent = message;

  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3500);

}


/* =========================
   WALLET DETECTION
========================= */

function getWallet(walletName) {

  if (walletName === "phantom") {

    if (
      window.phantom &&
      window.phantom.solana &&
      window.phantom.solana.isPhantom
    ) {

      return window.phantom.solana;

    }

  }


  if (walletName === "solflare") {

    if (
      window.solflare &&
      window.solflare.isSolflare
    ) {

      return window.solflare;

    }

  }


  if (walletName === "backpack") {

    if (
      window.backpack &&
      window.backpack.solana
    ) {

      return window.backpack.solana;

    }

  }

  return null;

}


/* =========================
   CONNECT WALLET
========================= */

async function connectWallet(walletName) {

  try {

    showToast(
      "Checking " + walletName + "..."
    );

    const provider =
      getWallet(walletName);


    if (!provider) {

      showToast(
        walletName +
        " wallet is not available in this browser"
      );

      return;

    }


    const response =
      await provider.connect();


    walletProvider =
      provider;


    walletPublicKey =
      response.publicKey;


    closeWalletModal();


    const shortAddress =
      walletPublicKey
        .toString()
        .slice(0, 4)
      +
      "..."
      +
      walletPublicKey
        .toString()
        .slice(-4);


    connectText.textContent =
      shortAddress;


    showToast(
      "Wallet connected"
    );


    await loadRealWalletData();


  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Wallet connection failed"
    );

  }

}


/* =========================
   WALLET BUTTONS
========================= */

document
  .querySelectorAll(".wallet-option")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const walletName =
          button.dataset.wallet;

        connectWallet(walletName);

      }
    );

  });


/* =========================
   REAL BALANCE
========================= */

async function loadRealWalletData() {

  if (!walletPublicKey) {
    return;
  }

  try {

    collateralValue.textContent =
      "Loading...";


    const publicKey =
      new PublicKey(
        walletPublicKey.toString()
      );


    const balance =
      await connection.getBalance(
        publicKey,
        "confirmed"
      );


    const solBalance =
      balance / LAMPORTS_PER_SOL;


    /*
      REAL SOL BALANCE

      This is NOT a fake USD value.
    */

    collateralValue.textContent =
      solBalance.toFixed(4) + " SOL";


    document
      .getElementById("collateralSub")
      .textContent =
      "Actual Devnet wallet balance";


    /*
      Borrowed amount remains --

      Until a real lending
      protocol position exists.
    */

    borrowedValue.textContent =
      "--";


    document
      .getElementById("borrowedSub")
      .textContent =
      "No on-chain loan detected";


    /*
      Borrow power stays --

      No fake borrowing
      calculation.
    */

    borrowPower.textContent =
      "--";


    showToast(
      "Real wallet balance loaded"
    );


  } catch (error) {

    console.error(error);

    collateralValue.textContent =
      "Unavailable";

    showToast(
      "Could not load wallet balance"
    );

  }

}


/* =========================
   AI RISK ANALYSIS
========================= */

analyzeBtn.addEventListener(
  "click",
  async () => {

    if (!walletPublicKey) {

      showToast(
        "Connect a wallet first"
      );

      return;

    }


    /*
      No fake score.

      Risk score requires:

      - Actual collateral
      - Actual borrowed amount
      - Protocol LTV
      - Liquidation threshold
      - Live price data
    */

    riskScore.textContent =
      "--";

    riskLabel.textContent =
      "INSUFFICIENT DATA";

    riskTitle.textContent =
      "Real position required";

    riskDescription.textContent =
      "Connect a supported lending position to calculate a real risk score. No risk score is generated from fake data.";

    showToast(
      "Checking on-chain position..."
    );

  }
);


/* =========================
   AI SIMULATION
========================= */

simulateBtn.addEventListener(
  "click",
  () => {

    if (!walletPublicKey) {

      showToast(
        "Connect wallet first"
      );

      return;

    }

    showToast(
      "A real collateral position is required for simulation"
    );

  }
);


/* =========================
   DEPOSIT
========================= */

depositBtn.addEventListener(
  "click",
  () => {

    if (!walletPublicKey) {

      openWalletModal();

      return;

    }

    /*
      IMPORTANT

      We do NOT create a fake
      deposit transaction.

      Next step:
      Connect to the real
      StockSplit Devnet program.
    */

    showToast(
      "Real collateral program integration is next"
    );

  }
);


/* =========================
   BORROW
========================= */

borrowBtn.addEventListener(
  "click",
  () => {

    if (!walletPublicKey) {

      openWalletModal();

      return;

    }

    /*
      No fake borrowing.
    */

    showToast(
      "A real lending position is required"
    );

  }
);


/* =========================
   AUTO REFRESH BALANCE
========================= */

setInterval(
  () => {

    if (walletPublicKey) {

      loadRealWalletData();

    }

  },

  30000
);

const STORAGE_KEY = "whacky-slot-wallet";

const DEFAULT_WALLET = {
  userId: "local-user",
  currency: "COINS",
  balance: 5000,
  version: 0,
  updatedAt: new Date().toISOString(),
};

function readStoredWallet() {
  if (typeof window === "undefined") {
    return { ...DEFAULT_WALLET };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_WALLET };
    }

    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_WALLET,
      ...parsed,
    };
  } catch (_error) {
    return { ...DEFAULT_WALLET };
  }
}

function writeStoredWallet(wallet) {
  if (typeof window === "undefined") {
    return wallet;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  return wallet;
}

export async function fetchCurrentUser() {
  const wallet = readStoredWallet();
  return {
    user: {
      id: "local-user",
      username: "local-player",
      displayName: "Local Player",
    },
    wallet,
  };
}

export async function fetchWallet() {
  return readStoredWallet();
}

export async function settleWallet({ previousBalance, nextBalance, delta, reason }) {
  const wallet = readStoredWallet();
  return writeStoredWallet({
    ...wallet,
    previousBalance,
    balance: nextBalance,
    lastDelta: delta,
    lastReason: reason,
    version: wallet.version + 1,
    updatedAt: new Date().toISOString(),
  });
}

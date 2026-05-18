const GUEST_WALLET_STORAGE_KEY = "whacky-slot-guest-wallet";
const GUEST_ID_STORAGE_KEY = "whacky-slot-guest-id";
const REFILL_REQUEST_STORAGE_KEY = "whacky-slot-refill-request";
const SESSION_TOKEN_STORAGE_KEY = "whacky-slot-session-token";
const DEFAULT_ACCOUNT_SERVICE_URL = "http://localhost:3001";
export const REFILL_AMOUNT = 2000;

const DEFAULT_GUEST_WALLET = {
  userId: "guest-user",
  currency: "GUEST_COINS",
  balance: 2000,
  version: 0,
  updatedAt: new Date().toISOString(),
  canSettleFromFrontend: true,
  walletType: "guest_demo",
  walletLabel: "Guest Demo Coins",
  isGuestWallet: true,
};

function getAccountServiceUrl() {
  return String(import.meta.env.VITE_ACCOUNT_SERVICE_URL ?? DEFAULT_ACCOUNT_SERVICE_URL).replace(/\/+$/, "");
}

function buildAccountServiceUrl(pathname) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getAccountServiceUrl()}${normalizedPath}`;
}

function generateGuestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `guest-${crypto.randomUUID()}`;
  }

  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readStoredJson(storageKey, fallbackValue) {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return fallbackValue;
    }

    return JSON.parse(raw);
  } catch (_error) {
    return fallbackValue;
  }
}

function writeStoredJson(storageKey, value) {
  if (typeof window === "undefined") {
    return value;
  }

  if (value == null) {
    window.localStorage.removeItem(storageKey);
    return null;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(value));
  return value;
}

function readGuestWallet() {
  const parsed = readStoredJson(GUEST_WALLET_STORAGE_KEY, null);
  return {
    ...DEFAULT_GUEST_WALLET,
    ...(parsed ?? {}),
    currency: "GUEST_COINS",
    walletType: "guest_demo",
    walletLabel: "Guest Demo Coins",
    isGuestWallet: true,
  };
}

function writeGuestWallet(wallet) {
  if (typeof window === "undefined") {
    return wallet;
  }

  window.localStorage.setItem(GUEST_WALLET_STORAGE_KEY, JSON.stringify(wallet));
  return wallet;
}

function readSessionToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(SESSION_TOKEN_STORAGE_KEY) || "";
}

function writeSessionToken(token) {
  if (typeof window === "undefined") {
    return token ?? "";
  }

  if (!token) {
    window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
    return "";
  }

  window.localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
  return token;
}

function clearStoredSessionToken() {
  writeSessionToken("");
}

function normalizeWallet(wallet, fallbackWallet = DEFAULT_GUEST_WALLET) {
  return {
    ...fallbackWallet,
    ...(wallet ?? {}),
  };
}

function getGuestAccountSnapshot() {
  return {
    isGuest: true,
    user: {
      id: getGuestId(),
      username: "guest-player",
      displayName: "Guest Player",
      billingProfile: "guest-demo-coins",
    },
    wallet: normalizeWallet(readGuestWallet(), DEFAULT_GUEST_WALLET),
  };
}

async function requestAccountService(pathname, options = {}) {
  const sessionToken = readSessionToken();
  const response = await window.fetch(buildAccountServiceUrl(pathname), {
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? `Account service request failed (${response.status}).`);
  }

  return payload;
}

export function hasStoredSessionToken() {
  return Boolean(readSessionToken());
}

export function getGuestId() {
  if (typeof window === "undefined") {
    return generateGuestId();
  }

  const existingGuestId = window.localStorage.getItem(GUEST_ID_STORAGE_KEY);
  if (existingGuestId) {
    return existingGuestId;
  }

  const guestId = generateGuestId();
  window.localStorage.setItem(GUEST_ID_STORAGE_KEY, guestId);
  return guestId;
}

export function getStoredRefillRequest() {
  return readStoredJson(REFILL_REQUEST_STORAGE_KEY, null);
}

function writeStoredRefillRequest(refillRequest) {
  return writeStoredJson(REFILL_REQUEST_STORAGE_KEY, refillRequest);
}

export async function signUp({ username, password }) {
  const payload = await requestAccountService("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  writeSessionToken(payload.sessionToken);
  return {
    isGuest: false,
    user: payload.user,
    wallet: normalizeWallet(payload.wallet, {
      currency: "USER_COINS",
      walletType: "signed_in_user",
      walletLabel: "Signed-In Player Coins",
      isGuestWallet: false,
    }),
    expiresAt: payload.expiresAt,
  };
}

export async function signIn({ username, password }) {
  const payload = await requestAccountService("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  writeSessionToken(payload.sessionToken);
  return {
    isGuest: false,
    user: payload.user,
    wallet: normalizeWallet(payload.wallet, {
      currency: "USER_COINS",
      walletType: "signed_in_user",
      walletLabel: "Signed-In Player Coins",
      isGuestWallet: false,
    }),
    expiresAt: payload.expiresAt,
  };
}

export async function signOut() {
  const sessionToken = readSessionToken();
  try {
    if (sessionToken) {
      await requestAccountService("/api/auth/signout", {
        method: "POST",
      });
    }
  } catch (_error) {
    // Clear local session regardless of backend signout success.
  } finally {
    clearStoredSessionToken();
  }
}

export async function fetchCurrentUser() {
  const sessionToken = readSessionToken();
  if (!sessionToken) {
    return getGuestAccountSnapshot();
  }

  try {
    const payload = await requestAccountService("/api/me");
    return {
      isGuest: Boolean(payload?.isGuest),
      user: payload.user,
      wallet: normalizeWallet(payload.wallet, {
        currency: "USER_COINS",
        walletType: "signed_in_user",
        walletLabel: "Signed-In Player Coins",
        isGuestWallet: false,
      }),
    };
  } catch (_error) {
    clearStoredSessionToken();
    return getGuestAccountSnapshot();
  }
}

export async function fetchWallet() {
  const sessionToken = readSessionToken();
  if (!sessionToken) {
    return normalizeWallet(readGuestWallet(), DEFAULT_GUEST_WALLET);
  }

  const payload = await requestAccountService("/api/wallet");
  return normalizeWallet(payload, {
    currency: "USER_COINS",
    walletType: "signed_in_user",
    walletLabel: "Signed-In Player Coins",
    isGuestWallet: false,
  });
}

export async function settleWallet({ previousBalance, nextBalance, delta, reason }) {
  const sessionToken = readSessionToken();
  if (!sessionToken) {
    const wallet = readGuestWallet();
    return writeGuestWallet({
      ...wallet,
      previousBalance,
      balance: nextBalance,
      lastDelta: delta,
      lastReason: reason,
      version: wallet.version + 1,
      updatedAt: new Date().toISOString(),
    });
  }

  const payload = await requestAccountService("/api/wallet/settle", {
    method: "POST",
    body: JSON.stringify({
      previousBalance,
      nextBalance,
      delta,
      reason,
    }),
  });

  return normalizeWallet(payload.wallet, {
    currency: "USER_COINS",
    walletType: "signed_in_user",
    walletLabel: "Signed-In Player Coins",
    isGuestWallet: false,
  });
}

export async function createRefillRequest() {
  if (hasStoredSessionToken()) {
    throw new Error("Refill requests are only available for guest demo coins.");
  }

  const payload = await requestAccountService("/api/refill-requests", {
    method: "POST",
    body: JSON.stringify({
      guestId: getGuestId(),
    }),
  });

  return writeStoredRefillRequest(payload.request);
}

export async function fetchStoredRefillRequestStatus() {
  if (hasStoredSessionToken()) {
    return null;
  }

  const refillRequest = getStoredRefillRequest();
  if (!refillRequest?.id) {
    return null;
  }

  const payload = await requestAccountService(
    `/api/refill-requests/${encodeURIComponent(refillRequest.id)}?guestId=${encodeURIComponent(getGuestId())}`,
  );

  return writeStoredRefillRequest(payload.request);
}

export async function claimStoredRefillRequest() {
  if (hasStoredSessionToken()) {
    return null;
  }

  const refillRequest = getStoredRefillRequest();
  if (!refillRequest?.id) {
    return null;
  }

  const payload = await requestAccountService(`/api/refill-requests/${encodeURIComponent(refillRequest.id)}/claim`, {
    method: "POST",
    body: JSON.stringify({
      guestId: getGuestId(),
    }),
  });

  writeStoredRefillRequest(null);
  return payload.request;
}

export async function applyApprovedRefill(amount = REFILL_AMOUNT) {
  const wallet = readGuestWallet();
  return writeGuestWallet({
    ...wallet,
    balance: wallet.balance + Number(amount || 0),
    lastDelta: Number(amount || 0),
    lastReason: "refill_approved",
    version: wallet.version + 1,
    updatedAt: new Date().toISOString(),
  });
}

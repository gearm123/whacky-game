const STORAGE_KEY = "whacky-slot-wallet";
const GUEST_ID_STORAGE_KEY = "whacky-slot-guest-id";
const REFILL_REQUEST_STORAGE_KEY = "whacky-slot-refill-request";
const DEFAULT_ACCOUNT_SERVICE_URL = "http://localhost:3001";
export const REFILL_AMOUNT = 2000;

const DEFAULT_WALLET = {
  userId: "local-user",
  currency: "COINS",
  balance: 2000,
  version: 0,
  updatedAt: new Date().toISOString(),
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

function readStoredWallet() {
  const parsed = readStoredJson(STORAGE_KEY, null);
  return {
    ...DEFAULT_WALLET,
    ...(parsed ?? {}),
  };
}

function writeStoredWallet(wallet) {
  if (typeof window === "undefined") {
    return wallet;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  return wallet;
}

async function requestAccountService(pathname, options = {}) {
  const response = await window.fetch(buildAccountServiceUrl(pathname), {
    headers: {
      "Content-Type": "application/json",
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

export async function fetchCurrentUser() {
  const wallet = readStoredWallet();
  return {
    user: {
      id: getGuestId(),
      username: "guest-player",
      displayName: "Guest Player",
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

export async function createRefillRequest() {
  const payload = await requestAccountService("/api/refill-requests", {
    method: "POST",
    body: JSON.stringify({
      guestId: getGuestId(),
    }),
  });

  return writeStoredRefillRequest(payload.request);
}

export async function fetchStoredRefillRequestStatus() {
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
  const wallet = readStoredWallet();
  return writeStoredWallet({
    ...wallet,
    balance: wallet.balance + Number(amount || 0),
    lastDelta: Number(amount || 0),
    lastReason: "refill_approved",
    version: wallet.version + 1,
    updatedAt: new Date().toISOString(),
  });
}

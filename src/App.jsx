import { useEffect, useMemo, useState } from "react";
import {
  REFILL_AMOUNT,
  applyApprovedRefill,
  claimStoredRefillRequest,
  createRefillRequest,
  fetchCurrentUser,
  fetchStoredRefillRequestStatus,
  getGuestId,
  getStoredRefillRequest,
  signIn,
  signOut,
  signUp,
  settleWallet,
} from "./api";
import { trackEvent } from "./analytics";
import { createGameSession, getGameConfig, runGameFeature, runGameSpin } from "./mockGame";

const GREEK_IMAGE_ASSETS = [
  "/assets/greek/aphro.png",
  "/assets/greek/apollo.png",
  "/assets/greek/ares.png",
  "/assets/greek/athen.png",
  "/assets/greek/dioni.png",
  "/assets/greek/hercules.png",
  "/assets/greek/hermes.png",
  "/assets/greek/medus.png",
  "/assets/greek/pos.png",
  "/assets/greek/zeu.png",
];

const LOONY_IMAGE_ASSETS = [
  "/assets/loony/bugs.png",
  "/assets/loony/coyote.png",
  "/assets/loony/daffy.png",
  "/assets/loony/elmer.png",
  "/assets/loony/marvin.png",
  "/assets/loony/pig.png",
  "/assets/loony/runner.png",
  "/assets/loony/sam.png",
  "/assets/loony/silvester.png",
  "/assets/loony/taz.png",
];

const NETWORK_IMAGE_ASSETS = [
  "/assets/network/blossom.png",
  "/assets/network/bravo.png",
  "/assets/network/courage.png",
  "/assets/network/cow.png",
  "/assets/network/dexter.png",
  "/assets/network/doubledee.png",
  "/assets/network/grim.png",
  "/assets/network/jack.png",
  "/assets/network/mojo.png",
  "/assets/network/scooby.png",
];

const DISNEY_IMAGE_ASSETS = [
  "/assets/disney/ariel.png",
  "/assets/disney/donkey.png",
  "/assets/disney/fairy.png",
  "/assets/disney/hades.png",
  "/assets/disney/hook.png",
  "/assets/disney/nemo.png",
  "/assets/disney/pan.png",
  "/assets/disney/rumple.png",
  "/assets/disney/shrek.png",
  "/assets/disney/snow.png",
];
const GEARM_SIGNATURE_ASSET = "/assets/brand_logo.png";

const PIXAR_IMAGE_ASSETS = [
  "/assets/pixar/buzz.png",
  "/assets/pixar/carl.png",
  "/assets/pixar/edna.png",
  "/assets/pixar/eve.png",
  "/assets/pixar/mike.png",
  "/assets/pixar/mqueen.png",
  "/assets/pixar/super.png",
  "/assets/pixar/toy_dog.png",
  "/assets/pixar/walle.png",
  "/assets/pixar/woode.png",
];

const GREEK_BACKGROUND_CLASSES = [
  "backdrop-figure backdrop-greek backdrop-greek-1",
  "backdrop-figure backdrop-greek backdrop-greek-2",
  "backdrop-figure backdrop-greek backdrop-greek-3",
  "backdrop-figure backdrop-greek backdrop-greek-4",
  "backdrop-figure backdrop-greek backdrop-greek-5",
];

const LOONY_BACKGROUND_CLASSES = [
  "backdrop-figure backdrop-loony backdrop-loony-1",
  "backdrop-figure backdrop-loony backdrop-loony-2",
  "backdrop-figure backdrop-loony backdrop-loony-3",
  "backdrop-figure backdrop-loony backdrop-loony-4",
];

const NETWORK_BACKGROUND_CLASSES = [
  "backdrop-figure backdrop-network backdrop-network-1",
  "backdrop-figure backdrop-network backdrop-network-2",
  "backdrop-figure backdrop-network backdrop-network-3",
  "backdrop-figure backdrop-network backdrop-network-4",
];

const DISNEY_BACKGROUND_CLASSES = [
  "backdrop-figure backdrop-disney backdrop-disney-1",
  "backdrop-figure backdrop-disney backdrop-disney-2",
  "backdrop-figure backdrop-disney backdrop-disney-3",
  "backdrop-figure backdrop-disney backdrop-disney-4",
];

const PIXAR_BACKGROUND_CLASSES = [
  "backdrop-figure backdrop-pixar backdrop-pixar-1",
  "backdrop-figure backdrop-pixar backdrop-pixar-2",
];

const FAMILY_ORDER = ["GREEK", "SLAPSTICK", "MYSTERY", "DISNEY", "PIXAR"];
const MOBILE_MEDIA_QUERY = "(max-width: 760px)";
const ALL_IMAGE_ASSETS = Array.from(
  new Set([
    ...GREEK_IMAGE_ASSETS,
    ...LOONY_IMAGE_ASSETS,
    ...NETWORK_IMAGE_ASSETS,
    ...DISNEY_IMAGE_ASSETS,
    ...PIXAR_IMAGE_ASSETS,
  ]),
);

const SITE_MAP_ITEMS = [
  {
    title: "Home",
    description: "Landing view with the title, balance, and the active play area.",
  },
  {
    title: "Guide Page",
    description: "Step-by-step instructions, event rules, and feature explanations for the game flow.",
  },
  {
    title: "FAQ Page",
    description: "Standalone answers for payouts, trigger rules, feature choices, and balance behavior.",
  },
  {
    title: "Puzzle Grid",
    description: "Main 4x4 board where the family matches, free spins, and bonus triggers happen.",
  },
  {
    title: "Action Bar",
    description: "Play button, balance snapshot, and the quick way to open the help modal.",
  },
];

const GUIDE_STEPS = [
  "Press Play to spend 200 coins and resolve the next 4x4 board.",
  "Match families on paylines to earn regular payouts while watching for feature triggers.",
  "Complete a full same-family row to unlock free spins that cost 0 coins.",
  "Trigger a bonus round or mega bonus round, then choose 200 or 300 once to lock that mode for the feature.",
  "Watch the highlighted tiles and win banners to understand why a win or feature triggered.",
];

const FAQ_ITEMS = [
  {
    question: "How much does a normal spin cost?",
    answer: "A normal spin costs 200 coins. Free spins cost 0 coins once they are unlocked.",
  },
  {
    question: "How do I trigger free spins?",
    answer: "Any full horizontal row from the same family unlocks the configured free-spin feature.",
  },
  {
    question: "How do I trigger a bonus round?",
    answer: "A same-family row or column plus at least five visible tiles from that family starts the bonus round.",
  },
  {
    question: "How do I trigger a mega bonus round?",
    answer: "If all 16 tiles on the board belong to the same family, the mega bonus round starts.",
  },
  {
    question: "What does the 200 or 300 choice mean?",
    answer: "That choice locks the bonus-spin mode for the active feature, changes the per-spin feature cost, and stacks with the bonus or mega-bonus multiplier.",
  },
  {
    question: "Why do wins still feel possible if the game has an edge?",
    answer: "The stored RTP, hit-frequency, and volatility settings are tuned so wins stay visible while losses still dominate over time.",
  },
];

const SITE_ORIGIN = "https://www.whacky-game.com";
const PAGE_METADATA = {
  home: {
    id: "home",
    label: "Home",
    path: "/",
    title: "Whacky Game",
  },
  guide: {
    id: "guide",
    label: "Guide",
    navLabel: "Guide",
    path: "/guide",
    title: "Whacky Game Guide",
  },
  faq: {
    id: "faq",
    label: "FAQ",
    navLabel: "FAQ",
    path: "/faq",
    title: "Whacky Game FAQ",
  },
};

const AUTH_FORM_DEFAULT = {
  username: "",
  password: "",
};

function getCurrentPageFromPath(pathname) {
  const normalizedPath = pathname?.replace(/\/+$/, "").toLowerCase() || "/";

  if (normalizedPath === "/guide" || normalizedPath === "/guides") {
    return "guide";
  }

  if (normalizedPath === "/faq" || normalizedPath === "/faqs") {
    return "faq";
  }

  return "home";
}

function buildBreadcrumbSchema(currentPage) {
  const items = [PAGE_METADATA.home];

  if (currentPage !== "home" && PAGE_METADATA[currentPage]) {
    items.push(PAGE_METADATA[currentPage]);
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: new URL(item.path, SITE_ORIGIN).toString(),
    })),
  };
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function formatCoins(value) {
  return Number(value ?? 0).toLocaleString();
}

function getWalletTheme(wallet) {
  return wallet?.isGuestWallet ? "guest" : "user";
}

function extractFirstNumber(value) {
  const match = String(value ?? "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildShuffleBoard(symbolIds, reels, rows) {
  return Array.from({ length: reels }, () =>
    Array.from({ length: rows }, () => randomItem(symbolIds)),
  );
}

function hashString(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function deterministicShuffle(items, seedValue) {
  const seed = hashString(seedValue);
  const decorated = items.map((item, index) => ({
    item,
    weight: hashString(`${seed}-${item}-${index}`),
  }));

  decorated.sort((left, right) => left.weight - right.weight);
  return decorated.map((entry) => entry.item);
}

function pickSeededAsset(items, seedValue) {
  if (items.length === 0) {
    return null;
  }

  return items[hashString(seedValue) % items.length];
}

const PRELOADED_IMAGE_PROMISES = new Map();
const PRELOADED_IMAGE_SOURCES = new Set();

function preloadImage(src) {
  if (!src) {
    return Promise.resolve();
  }

  if (PRELOADED_IMAGE_SOURCES.has(src)) {
    return Promise.resolve();
  }

  if (PRELOADED_IMAGE_PROMISES.has(src)) {
    return PRELOADED_IMAGE_PROMISES.get(src);
  }

  const preloadPromise = new Promise((resolve) => {
    const image = new Image();
    let finished = false;

    const complete = (shouldCache = false) => {
      if (finished) {
        return;
      }

      finished = true;
      if (shouldCache) {
        PRELOADED_IMAGE_SOURCES.add(src);
      } else {
        PRELOADED_IMAGE_PROMISES.delete(src);
      }
      resolve();
    };

    image.onload = () => {
      if (typeof image.decode === "function") {
        image.decode()
          .then(() => complete(true))
          .catch(() => complete(false));
        return;
      }

      complete(true);
    };

    image.onerror = () => complete(false);
    image.src = src;

    if (image.complete) {
      complete(true);
    }
  });

  PRELOADED_IMAGE_PROMISES.set(src, preloadPromise);
  return preloadPromise;
}

async function preloadAssets(sources, onProgress) {
  if (sources.length === 0) {
    onProgress({ loaded: 0, total: 0 });
    return;
  }

  let loadedCount = 0;

  onProgress({ loaded: 0, total: sources.length });

  await Promise.all(
    sources.map((src) =>
      preloadImage(src).finally(() => {
        loadedCount += 1;
        onProgress({ loaded: loadedCount, total: sources.length });
      }),
    ),
  );
}

function warmAssetsInBackground(sources, options = {}) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const { batchSize = 4, delayMs = 1200, useIdleCallback = true } = options;
  const queue = sources.filter((src) => src && !PRELOADED_IMAGE_SOURCES.has(src));
  let offset = 0;
  let cancelled = false;
  let timeoutId = null;
  let idleCallbackId = null;

  const runNextBatch = async () => {
    if (cancelled || offset >= queue.length) {
      return;
    }

    const batch = queue.slice(offset, offset + batchSize);
    offset += batch.length;
    await preloadAssets(batch, () => undefined);

    if (!cancelled && offset < queue.length) {
      scheduleNextBatch();
    }
  };

  const scheduleNextBatch = () => {
    if (cancelled || offset >= queue.length) {
      return;
    }

    if (useIdleCallback && typeof window.requestIdleCallback === "function") {
      idleCallbackId = window.requestIdleCallback(
        () => {
          idleCallbackId = null;
          void runNextBatch();
        },
        { timeout: delayMs },
      );
      return;
    }

    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      void runNextBatch();
    }, delayMs);
  };

  scheduleNextBatch();

  return () => {
    cancelled = true;
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    if (idleCallbackId !== null && typeof window.cancelIdleCallback === "function") {
      window.cancelIdleCallback(idleCallbackId);
    }
  };
}

function getSymbolAssetPool(symbol) {
  if (!symbol) {
    return [];
  }

  if (symbol.themeGroup === "GREEK" || symbol.type === "wild") {
    return GREEK_IMAGE_ASSETS;
  }

  if (symbol.themeGroup === "SLAPSTICK" || symbol.type === "scatter") {
    return LOONY_IMAGE_ASSETS;
  }

  if (symbol.themeGroup === "MYSTERY" || symbol.type === "bonus") {
    return NETWORK_IMAGE_ASSETS;
  }

  if (symbol.themeGroup === "DISNEY") {
    return DISNEY_IMAGE_ASSETS;
  }

  if (symbol.themeGroup === "PIXAR") {
    return PIXAR_IMAGE_ASSETS;
  }

  return [];
}

function formatPayoutSummary(payouts) {
  if (!payouts) {
    return "Prize values vary by feature state.";
  }

  return Object.entries(payouts)
    .map(([matches, prize]) => `${matches} match: ${formatCoins(prize)} coins`)
    .join(" | ");
}

function buildWinningTileKeys(board, paylines, uiState) {
  const keys = new Set();
  const lineWins = uiState?.lineWins ?? [];
  const highlightedFeatureTiles = uiState?.highlightTileKeys ?? [];

  for (const lineWin of lineWins) {
    const payline = paylines?.[Math.max(0, (lineWin.line ?? 1) - 1)];
    if (!payline) {
      continue;
    }

    for (let reelIndex = 0; reelIndex < Math.min(lineWin.count ?? 0, payline.length); reelIndex += 1) {
      keys.add(`${reelIndex}-${payline[reelIndex]}`);
    }
  }

  highlightedFeatureTiles.forEach((key) => {
    keys.add(key);
  });

  if (keys.size === 0 && (uiState?.lastWin ?? 0) > 0) {
    board.forEach((column, columnIndex) => {
      column.forEach((symbolId, rowIndex) => {
        if (symbolId === "SCATTER") {
          keys.add(`${columnIndex}-${rowIndex}`);
        }
      });
    });
  }

  return keys;
}

function collectBoardImageSources(board, symbolMap) {
  const imageSources = new Set();

  board.forEach((column, columnIndex) => {
    column.forEach((symbolId, rowIndex) => {
      const symbol = symbolMap[symbolId];
      const assetPool = getSymbolAssetPool(symbol);

      if (assetPool.length === 0) {
        return;
      }

      const imageSource = pickSeededAsset(
        assetPool,
        `${symbolId}-${symbol?.themeGroup ?? symbol?.type ?? "tile"}`,
      );

      if (imageSource) {
        imageSources.add(imageSource);
      }
    });
  });

  return Array.from(imageSources);
}

function buildSymbolArtworkMap(symbols) {
  return Object.fromEntries(
    symbols.map((symbol) => {
      const assetPool = getSymbolAssetPool(symbol);
      const imageSource =
        assetPool.length > 0 ? pickSeededAsset(assetPool, `${symbol.id}-${symbol.themeGroup ?? symbol.type ?? "tile"}`) : null;
      return [symbol.id, imageSource];
    }),
  );
}

function collectSymbolImageSources(symbols) {
  return Array.from(
    new Set(
      Object.values(buildSymbolArtworkMap(symbols)).filter(Boolean),
    ),
  );
}

export default function App() {
  const [config, setConfig] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [gameState, setGameState] = useState(null);
  const [uiState, setUiState] = useState(null);
  const [board, setBoard] = useState([]);
  const [events, setEvents] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFeatureRunning, setIsFeatureRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [winningTileKeys, setWinningTileKeys] = useState([]);
  const [transientWinAmount, setTransientWinAmount] = useState(null);
  const [refillRequest, setRefillRequest] = useState(() => getStoredRefillRequest());
  const [isRequestingRefill, setIsRequestingRefill] = useState(false);
  const [isApplyingRefill, setIsApplyingRefill] = useState(false);
  const [refillError, setRefillError] = useState("");
  const [assetLoadState, setAssetLoadState] = useState({
    loaded: 0,
    total: ALL_IMAGE_ASSETS.length,
  });
  const [account, setAccount] = useState({
    isGuest: true,
    user: {
      id: "guest-user",
      username: "guest-player",
      displayName: "Guest Player",
      billingProfile: "guest-demo-coins",
    },
    wallet: null,
  });
  const [authMode, setAuthMode] = useState("signin");
  const [authForm, setAuthForm] = useState(AUTH_FORM_DEFAULT);
  const [authError, setAuthError] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(() =>
    window.matchMedia(MOBILE_MEDIA_QUERY).matches,
  );
  const [currentPage, setCurrentPage] = useState(() => getCurrentPageFromPath(window.location.pathname));

  const symbols = config?.symbols ?? [];
  const themePayouts = config?.themePayouts ?? {};
  const symbolMap = useMemo(
    () => Object.fromEntries(symbols.map((symbol) => [symbol.id, symbol])),
    [symbols],
  );
  const symbolArtworkById = useMemo(() => buildSymbolArtworkMap(symbols), [symbols]);
  const boardRetryKey = useMemo(() => board.flat().join("|"), [board]);
  const symbolIds = useMemo(
    () => symbols.filter((symbol) => symbol.type === "regular").map((symbol) => symbol.id),
    [symbols],
  );
  const spinCost = config?.economics.spinCost ?? 0;
  const flashTier = uiState?.flashTier ?? "none";
  const lastWin = uiState?.lastWin ?? 0;
  const hasWin = lastWin > 0;
  const specialState = uiState?.specialState ?? null;
  const isGuestAccount = account?.isGuest ?? true;
  const activeWallet = account?.wallet ?? null;
  const walletTheme = getWalletTheme(activeWallet);
  const balanceChipClassName = `balance-chip balance-chip-${walletTheme}`;
  const accountModeLabel = isGuestAccount ? "Guest Demo Coins" : "Signed-In Player Coins";
  const accountOwnerLabel = isGuestAccount
    ? "Guest Browser"
    : account?.user?.displayName || account?.user?.username || "Signed-In Player";
  const authSubmitDisabled =
    isAuthSubmitting || authForm.username.trim().length < 3 || authForm.password.length < 4;
  const isManualFreeSpin = specialState?.type === "free_spins";
  const isManualBonusFeature =
    specialState?.type === "bonus_round" || specialState?.type === "mega_bonus_round";
  const hasLockedBonusStake = Boolean(specialState?.selectedStakeChoice);
  const showBonusChoiceOverlay =
    isManualBonusFeature && !hasLockedBonusStake && !isFeatureRunning;
  const isLockedBonusFeature = isManualBonusFeature && hasLockedBonusStake;
  const isSpinActionDisabled =
    isSpinning || isFeatureRunning || (specialState?.active && specialState.type !== "free_spins" && !isLockedBonusFeature);
  const currentPageMeta = PAGE_METADATA[currentPage] ?? PAGE_METADATA.home;
  const isHomePage = currentPage === "home";
  const breadcrumbItems = currentPage === "home"
    ? [PAGE_METADATA.home]
    : [PAGE_METADATA.home, currentPageMeta];
  const secondaryPageButtons = [PAGE_METADATA.guide, PAGE_METADATA.faq];
  const overlayTheme = uiState?.overlayTheme ?? "greek";
  const spinSettleDelayMs = isMobileLayout ? 260 : 1400;
  const featureSettleDelayMs = isMobileLayout ? 180 : 950;
  const displayedSpinCost = isManualFreeSpin ? 0 : spinCost;
  const restingWinBannerLabel =
    specialState?.type === "free_spins"
      ? "FREE SPIN READY"
      : specialState?.type === "mega_bonus_round"
        ? "MEGA BONUS READY"
        : specialState?.type === "bonus_round"
          ? "BONUS READY"
          : "SPIN READY";
  const showTransientWin = Number.isFinite(transientWinAmount) && transientWinAmount > 0;
  const winBannerLabel = showTransientWin
    ? (uiState?.winBannerLabel ?? "WIN CONFIRMED")
    : restingWinBannerLabel;
  const bonusStakeOptions = specialState?.availableStakeOptions ?? [];
  const lowestBonusStake = bonusStakeOptions.length > 0 ? Math.min(...bonusStakeOptions) : spinCost;
  const refillThreshold = isLockedBonusFeature
    ? Number(specialState?.selectedStakeChoice ?? lowestBonusStake)
    : isManualBonusFeature
      ? lowestBonusStake
      : spinCost;
  const needsRefill = Number(gameState?.balance ?? 0) < refillThreshold;
  const showRefillPanel = isHomePage && isGuestAccount && (needsRefill || Boolean(refillRequest));
  const showSignedInBalancePanel = isHomePage && !isGuestAccount && needsRefill;
  const bonusRoundCount =
    specialState?.type === "mega_bonus_round"
      ? config?.features?.megaBonusSpins ?? 0
      : specialState?.type === "bonus_round"
        ? config?.features?.bonusRoundSpins ?? 0
        : 0;
  const freeSpinPopupEvent =
    events.find((event) => event.type === "free_spins_started" || event.type === "free_spins_retriggered") ?? null;
  const freeSpinPopupCount = extractFirstNumber(freeSpinPopupEvent?.summary);
  const freeSpinPopupTitle =
    freeSpinPopupEvent?.type === "free_spins_retriggered" ? "Extra Free Spins" : uiState?.celebrationLabel;
  const freeSpinPopupMessage =
    freeSpinPopupEvent?.type === "free_spins_retriggered"
      ? `${freeSpinPopupCount} added`
      : `${freeSpinPopupCount} free spins`;
  const winBannerValue = showTransientWin
    ? `${formatCoins(transientWinAmount)} coins`
    : `${formatCoins(displayedSpinCost)} coins`;
  const actionLabel = isSpinning
    ? "Resolving..."
    : isFeatureRunning
      ? "Running Feature..."
      : isManualBonusFeature && hasLockedBonusStake
        ? specialState?.type === "mega_bonus_round"
          ? "Play Mega Bonus Spin"
          : "Play Bonus Spin"
      : isManualFreeSpin
        ? "Play Free Spin"
        : "Play";

  const backgroundGreekImages = useMemo(
    () => deterministicShuffle(GREEK_IMAGE_ASSETS, "greek-background"),
    [],
  );
  const backgroundLoonyImages = useMemo(
    () => deterministicShuffle(LOONY_IMAGE_ASSETS, "loony-background"),
    [],
  );
  const backgroundNetworkImages = useMemo(
    () => deterministicShuffle(NETWORK_IMAGE_ASSETS, "network-background"),
    [],
  );
  const backgroundDisneyImages = useMemo(
    () => deterministicShuffle(DISNEY_IMAGE_ASSETS, "disney-background"),
    [],
  );
  const backgroundPixarImages = useMemo(
    () => deterministicShuffle(PIXAR_IMAGE_ASSETS, "pixar-background"),
    [],
  );
  const highlightedTiles = useMemo(
    () => buildWinningTileKeys(board, config?.layout?.paylines ?? [], uiState),
    [board, config?.layout?.paylines, uiState],
  );
  const familyDetails = useMemo(() => {
    const grouped = new Map();

    symbols
      .filter((symbol) => symbol.type === "regular")
      .forEach((symbol) => {
        const groupKey = symbol.themeGroup ?? "OTHER";
        const existing = grouped.get(groupKey) ?? {
          id: groupKey,
          label: themePayouts[groupKey]?.label ?? symbol.themeLabel ?? groupKey,
          members: [],
          payouts: themePayouts[groupKey]?.payouts ?? null,
        };

        existing.members.push(symbol.label);
        grouped.set(groupKey, existing);
      });

    return Array.from(grouped.values()).sort(
      (left, right) => FAMILY_ORDER.indexOf(left.id) - FAMILY_ORDER.indexOf(right.id),
    );
  }, [symbols, themePayouts]);
  const specialSymbols = useMemo(
    () => symbols.filter((symbol) => symbol.type === "wild"),
    [symbols],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const handleChange = (event) => {
      setIsMobileLayout(event.matches);
    };

    setIsMobileLayout(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getCurrentPageFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    document.title = currentPageMeta.title;

    let canonicalLink = document.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }

    canonicalLink.setAttribute("href", new URL(currentPageMeta.path, SITE_ORIGIN).toString());

    const breadcrumbScriptId = "whacky-breadcrumb-schema";
    let breadcrumbScript = document.getElementById(breadcrumbScriptId);
    if (!breadcrumbScript) {
      breadcrumbScript = document.createElement("script");
      breadcrumbScript.id = breadcrumbScriptId;
      breadcrumbScript.type = "application/ld+json";
      document.head.appendChild(breadcrumbScript);
    }

    breadcrumbScript.textContent = JSON.stringify(buildBreadcrumbSchema(currentPage));
  }, [currentPage, currentPageMeta]);

  function resetGameForAccount(accountPayload, configPayload) {
    const nextSession = createGameSession(accountPayload?.wallet?.balance ?? 0);

    setAccount(accountPayload);
    setSessionId(nextSession.sessionId);
    setGameState(nextSession.state);
    setUiState(nextSession.uiState);
    setBoard(nextSession.board);
    setEvents(nextSession.events ?? []);
    setConfig(configPayload);
    setIsSpinning(false);
    setIsFeatureRunning(false);
    setWinningTileKeys([]);
    setTransientWinAmount(null);
    setError("");

    if (accountPayload?.isGuest) {
      setRefillRequest(getStoredRefillRequest());
    } else {
      setRefillRequest(null);
      setRefillError("");
    }
  }

  async function loadGame() {
    setIsLoading(true);
    setError("");
    setAuthError("");
    setAssetLoadState({ loaded: 0, total: 0 });

    try {
      const configPayload = getGameConfig();
      const accountPayload = await fetchCurrentUser();
      const initialBoardImageSources = collectSymbolImageSources(configPayload.symbols ?? []);

      await preloadAssets(initialBoardImageSources, setAssetLoadState);
      resetGameForAccount(accountPayload, configPayload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load config.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAuthSubmit(nextMode) {
    if (authSubmitDisabled || !config) {
      return;
    }

    setAuthError("");
    setError("");
    setIsAuthSubmitting(true);

    try {
      const accountPayload =
        nextMode === "signup"
          ? await signUp({
              username: authForm.username.trim(),
              password: authForm.password,
            })
          : await signIn({
              username: authForm.username.trim(),
              password: authForm.password,
            });

      resetGameForAccount(accountPayload, config);
      setAuthForm(AUTH_FORM_DEFAULT);
      setAuthMode("signin");
      setIsAuthModalOpen(false);
      trackEvent(nextMode === "signup" ? "account_signed_up" : "account_signed_in", {
        username: accountPayload.user?.username,
      });
    } catch (submitError) {
      setAuthError(submitError instanceof Error ? submitError.message : "Could not complete sign in.");
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleSignOut() {
    if (!config || isAuthSubmitting) {
      return;
    }

    setIsAuthSubmitting(true);
    setAuthError("");
    setError("");

    try {
      const guestAccount = await signOut();
      resetGameForAccount(guestAccount, config);
      trackEvent("account_signed_out");
    } catch (signOutError) {
      setAuthError(signOutError instanceof Error ? signOutError.message : "Could not sign out.");
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  function openAuthModal(nextMode) {
    setAuthError("");
    setAuthMode(nextMode);
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    if (isAuthSubmitting) {
      return;
    }

    setIsAuthModalOpen(false);
    setAuthError("");
  }

  useEffect(() => {
    loadGame();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const connection = navigator.connection ?? navigator.mozConnection ?? navigator.webkitConnection;
    if (connection?.saveData || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g") {
      return;
    }

    return warmAssetsInBackground(ALL_IMAGE_ASSETS, {
      batchSize: isMobileLayout ? 6 : 10,
      delayMs: isMobileLayout ? 150 : 100,
      useIdleCallback: false,
    });
  }, [isLoading, isMobileLayout]);

  function navigateToPage(pageId) {
    const page = PAGE_METADATA[pageId] ?? PAGE_METADATA.home;
    const nextUrl = page.path;

    if (window.location.pathname !== nextUrl) {
      window.history.pushState({}, "", nextUrl);
    }

    setCurrentPage(page.id);
    window.scrollTo({ top: 0, behavior: "auto" });
    trackEvent("site_navigation", { destination: page.id });
  }

  useEffect(() => {
    if (!isSpinning || !config || symbolIds.length === 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setBoard(buildShuffleBoard(symbolIds, config.layout.reels, config.layout.rows));
    }, 110);

    return () => window.clearInterval(intervalId);
  }, [config, isSpinning, symbolIds]);

  useEffect(() => {
    if (isSpinning || isFeatureRunning || highlightedTiles.size === 0) {
      setWinningTileKeys([]);
      return undefined;
    }

    const keys = Array.from(highlightedTiles);
    setWinningTileKeys(keys);

    const timeoutId = window.setTimeout(() => {
      setWinningTileKeys([]);
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedTiles, isFeatureRunning, isSpinning]);

  useEffect(() => {
    if (isSpinning || isFeatureRunning) {
      setTransientWinAmount(null);
    }
  }, [isFeatureRunning, isSpinning]);

  useEffect(() => {
    if (isSpinning || isFeatureRunning || lastWin <= 0) {
      return undefined;
    }

    setTransientWinAmount(lastWin);
    const timeoutId = window.setTimeout(() => {
      setTransientWinAmount(null);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [isFeatureRunning, isSpinning, lastWin, sessionId]);

  useEffect(() => {
    if (!isGuestAccount || !refillRequest?.id || refillRequest.status !== "pending") {
      return undefined;
    }

    let isCancelled = false;

    const refreshRefillRequest = async () => {
      try {
        const nextRequest = await fetchStoredRefillRequestStatus();
        if (!isCancelled) {
          setRefillRequest(nextRequest);
          setRefillError("");
        }
      } catch (requestError) {
        if (!isCancelled) {
          setRefillError(
            requestError instanceof Error ? requestError.message : "Could not refresh the refill request status.",
          );
        }
      }
    };

    refreshRefillRequest();
    const intervalId = window.setInterval(refreshRefillRequest, 4000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isGuestAccount, refillRequest?.id, refillRequest?.status]);

  useEffect(() => {
    if (!isGuestAccount || !refillRequest?.id || refillRequest.status !== "approved" || isApplyingRefill) {
      return undefined;
    }

    let isCancelled = false;

    const claimAndApplyRefill = async () => {
      setIsApplyingRefill(true);

      try {
        const approvedRequest = await claimStoredRefillRequest();
        if (!approvedRequest) {
          return;
        }

        const walletPayload = await applyApprovedRefill(approvedRequest.amount);
        if (isCancelled) {
          return;
        }

        setRefillRequest(null);
        setRefillError("");
        setAccount((currentAccount) => ({
          ...currentAccount,
          wallet: walletPayload,
        }));
        setGameState((currentState) =>
          currentState
            ? {
                ...currentState,
                balance: walletPayload.balance,
              }
            : currentState,
        );
        setUiState((currentState) =>
          currentState
            ? {
                ...currentState,
                resultMessage: `${formatCoins(approvedRequest.amount)} coins added to your guest wallet.`,
              }
            : currentState,
        );
        trackEvent("refill_applied", {
          guest_id: getGuestId(),
          request_id: approvedRequest.id,
          amount: approvedRequest.amount,
        });
      } catch (requestError) {
        if (!isCancelled) {
          setRefillError(requestError instanceof Error ? requestError.message : "Could not apply the approved refill.");
        }
      } finally {
        if (!isCancelled) {
          setIsApplyingRefill(false);
        }
      }
    };

    claimAndApplyRefill();

    return () => {
      isCancelled = true;
    };
  }, [isApplyingRefill, isGuestAccount, refillRequest]);

  async function handleRefillRequest() {
    if (!isGuestAccount || isRequestingRefill || isApplyingRefill) {
      return;
    }

    setRefillError("");
    setIsRequestingRefill(true);

    try {
      const nextRequest = await createRefillRequest();
      setRefillRequest(nextRequest);
      setUiState((currentState) =>
        currentState
          ? {
              ...currentState,
              resultMessage: "Top-up request sent. Waiting for approval.",
            }
          : currentState,
      );
      trackEvent("refill_requested", {
        guest_id: getGuestId(),
        request_id: nextRequest.id,
        amount: nextRequest.amount,
      });
    } catch (requestError) {
      setRefillError(requestError instanceof Error ? requestError.message : "Could not send the top-up request.");
    } finally {
      setIsRequestingRefill(false);
    }
  }

  async function handleSpin() {
    const isBlockedByFeature = specialState?.active && specialState.type !== "free_spins" && !isLockedBonusFeature;
    if (!config || !sessionId || !gameState || isSpinning || isFeatureRunning || isBlockedByFeature) {
      return;
    }

    setError("");
    setIsSpinning(true);
    trackEvent("spin_started", {
      mode: isManualFreeSpin
        ? "free_spin"
        : isLockedBonusFeature
          ? specialState?.type ?? "bonus_feature"
          : "base_spin",
    });

    const startTime = Date.now();

    try {
      const payload =
        isManualFreeSpin || isLockedBonusFeature
          ? runGameFeature(gameState, board)
          : runGameSpin(gameState);
      const nextBoardImageSources = collectBoardImageSources(payload.board, symbolMap);
      const walletPayload = await settleWallet({
        previousBalance: gameState.balance,
        nextBalance: payload.state.balance,
        delta: payload.state.balance - gameState.balance,
        reason: payload.events?.[0]?.type ?? "spin_resolution",
      });
      const elapsed = Date.now() - startTime;
      await Promise.all([
        preloadAssets(nextBoardImageSources, () => undefined),
        wait(Math.max(0, spinSettleDelayMs - elapsed)),
      ]);

      setAccount((currentAccount) => ({
        ...currentAccount,
        wallet: walletPayload,
      }));
      setSessionId(payload.sessionId);
      setBoard(payload.board);
      setGameState({ ...payload.state, balance: walletPayload.balance });
      setUiState(payload.uiState);
      setEvents(payload.events ?? []);
    } catch (spinError) {
      setError(spinError instanceof Error ? spinError.message : "Spin request failed.");
    } finally {
      setIsSpinning(false);
    }
  }

  async function handleFeatureChoice(stakeChoice) {
    if (!isManualBonusFeature || !gameState || isSpinning || isFeatureRunning) {
      return;
    }

    setError("");
    setIsFeatureRunning(true);
    trackEvent("feature_spin_selected", {
      feature_type: specialState?.type ?? "unknown",
      stake_choice: stakeChoice,
    });

    try {
      const payload = runGameFeature(gameState, board, stakeChoice);
      const nextBoardImageSources = collectBoardImageSources(payload.board, symbolMap);
      const walletPayload = await settleWallet({
        previousBalance: gameState.balance,
        nextBalance: payload.state.balance,
        delta: payload.state.balance - gameState.balance,
        reason: payload.events?.[0]?.type ?? "feature_resolution",
      });
      await Promise.all([
        preloadAssets(nextBoardImageSources, () => undefined),
        wait(featureSettleDelayMs),
      ]);

      setAccount((currentAccount) => ({
        ...currentAccount,
        wallet: walletPayload,
      }));
      setSessionId(payload.sessionId);
      setBoard(payload.board);
      setGameState({ ...payload.state, balance: walletPayload.balance });
      setUiState(payload.uiState);
      setEvents(payload.events ?? []);
    } catch (featureError) {
      setError(featureError instanceof Error ? featureError.message : "Feature resolution failed.");
    } finally {
      setIsFeatureRunning(false);
    }
  }

  if (isLoading) {
    return (
      <div className="app-shell">
        <div className="page-noise" />
        <div className="loading-panel">
          <strong>Preparing Whacky Game</strong>
          <p className="loading-copy">
            Loading artwork {assetLoadState.loaded}/{assetLoadState.total} before the game appears.
          </p>
        </div>
      </div>
    );
  }

  if (!config || !gameState) {
    return (
      <div className="app-shell">
        <div className="page-noise" />
        <div className="loading-panel">
          Could not start the game. {error || "Local game configuration is missing."}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`app-shell flash-${flashTier} overlay-${overlayTheme} ${
        isMobileLayout ? "layout-mobile" : "layout-desktop"
      }`}
    >
      <div className="mythic-backdrop" aria-hidden="true">
        {backgroundGreekImages
          .slice(0, isMobileLayout ? 1 : GREEK_BACKGROUND_CLASSES.length)
          .map((src, index) => (
          <AssetImage
            key={`${src}-${index}`}
            src={src}
            alt=""
            className={GREEK_BACKGROUND_CLASSES[index]}
            fetchPriority="low"
          />
        ))}
        {backgroundLoonyImages
          .slice(0, isMobileLayout ? 1 : LOONY_BACKGROUND_CLASSES.length)
          .map((src, index) => (
          <AssetImage
            key={`${src}-${index}`}
            src={src}
            alt=""
            className={LOONY_BACKGROUND_CLASSES[index]}
            fetchPriority="low"
          />
        ))}
        {backgroundNetworkImages
          .slice(0, isMobileLayout ? 1 : NETWORK_BACKGROUND_CLASSES.length)
          .map((src, index) => (
          <AssetImage
            key={`${src}-${index}`}
            src={src}
            alt=""
            className={NETWORK_BACKGROUND_CLASSES[index]}
            fetchPriority="low"
          />
        ))}
        {backgroundDisneyImages
          .slice(0, isMobileLayout ? 1 : DISNEY_BACKGROUND_CLASSES.length)
          .map((src, index) => (
          <AssetImage
            key={`${src}-${index}`}
            src={src}
            alt=""
            className={DISNEY_BACKGROUND_CLASSES[index]}
            fetchPriority="low"
          />
        ))}
        {backgroundPixarImages
          .slice(0, isMobileLayout ? 1 : PIXAR_BACKGROUND_CLASSES.length)
          .map((src, index) => (
          <AssetImage
            key={`${src}-${index}`}
            src={src}
            alt=""
            className={PIXAR_BACKGROUND_CLASSES[index]}
            fetchPriority="low"
          />
        ))}
      </div>
      <div className="page-noise" />
      <div className={`coin-burst coin-burst-${walletTheme}`} aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} className="coin-particle" />
        ))}
      </div>

      <header className={isMobileLayout ? "mobile-topbar" : "simple-topbar"}>
        {!isMobileLayout ? (
          <>
            <div className="topbar-side topbar-side-left">
              <img
                className="topbar-gearm-mark"
                src={GEARM_SIGNATURE_ASSET}
                alt="Gearm"
                width="140"
                height="40"
                decoding="async"
              />
            </div>

            <div className="brand-block brand-block-centered">
              <p className="eyebrow">Cartoon Puzzle Slot</p>
              <h1>{config.title}</h1>
            </div>

            <div className="topbar-actions">
              <div className={balanceChipClassName}>
                <span>{accountModeLabel}</span>
                <strong>{formatCoins(gameState.balance)} coins</strong>
              </div>
              <div className={`account-card account-card-${walletTheme}`}>
                <div className={`wallet-mark wallet-mark-${walletTheme}`} aria-hidden="true" />
                <div className="account-card-copy">
                  <span className="account-card-label">{isGuestAccount ? "Playing as guest" : "Signed in"}</span>
                  <strong>{accountOwnerLabel}</strong>
                </div>
                {isGuestAccount ? (
                  <div className="auth-launchers">
                    <button
                      type="button"
                      className="mode-button compact secondary-button auth-launch-button"
                      onClick={() => openAuthModal("signin")}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      className="mode-button compact secondary-button auth-launch-button"
                      onClick={() => openAuthModal("signup")}
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="mode-button compact secondary-button auth-signout-button"
                    onClick={handleSignOut}
                    disabled={isAuthSubmitting}
                  >
                    {isAuthSubmitting ? "Signing Out..." : "Sign Out"}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="mobile-topbar-stack">
            <img
              className="topbar-gearm-mark mobile-gearm-mark"
              src={GEARM_SIGNATURE_ASSET}
              alt="Gearm"
              width="140"
              height="40"
              decoding="async"
            />
            <div className="brand-block">
              <p className="eyebrow">Cartoon Puzzle Slot</p>
              <h1>{config.title}</h1>
            </div>
            <div className={balanceChipClassName}>
              <span>{accountModeLabel}</span>
              <strong>{formatCoins(gameState.balance)} coins</strong>
            </div>
            <div className={`account-card account-card-${walletTheme} account-card-mobile`}>
              <div className={`wallet-mark wallet-mark-${walletTheme}`} aria-hidden="true" />
              <div className="account-card-copy">
                <span className="account-card-label">{isGuestAccount ? "Playing as guest" : "Signed in"}</span>
                <strong>{accountOwnerLabel}</strong>
              </div>
              {isGuestAccount ? (
                <div className="auth-launchers auth-launchers-mobile">
                  <button
                    type="button"
                    className="mode-button compact secondary-button auth-launch-button"
                    onClick={() => openAuthModal("signin")}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className="mode-button compact secondary-button auth-launch-button"
                    onClick={() => openAuthModal("signup")}
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="mode-button compact secondary-button auth-signout-button"
                  onClick={handleSignOut}
                  disabled={isAuthSubmitting}
                >
                  {isAuthSubmitting ? "Signing Out..." : "Sign Out"}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {!isHomePage ? (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol className="breadcrumb-list">
            {breadcrumbItems.map((item, index) => {
              const isLastItem = index === breadcrumbItems.length - 1;

              return (
                <li className="breadcrumb-item" key={item.id}>
                  {isLastItem ? (
                    <span className="breadcrumb-current" aria-current="page">
                      {item.label}
                    </span>
                  ) : (
                    <button type="button" className="breadcrumb-link" onClick={() => navigateToPage(item.id)}>
                      {item.label}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      {isMobileLayout && isHomePage ? (
        <section className="mobile-summary-strip">
          <div className={`win-banner mobile-win-banner banner-${flashTier}`}>
            <span className="win-banner-label">{winBannerLabel}</span>
            <strong>{winBannerValue}</strong>
          </div>
        </section>
      ) : null}

      <main className={`simple-stage ${isMobileLayout ? "simple-stage-mobile" : ""}`}>
        {isHomePage ? (
          <section className="cabinet simple-cabinet">
            <div className={`cabinet-stage stage-${overlayTheme}`}>
              <div className={`reel-frame ${isSpinning ? "reel-frame-spinning" : ""}`}>
                {board.map((column, columnIndex) => (
                  <div className="reel-column" key={`reel-${columnIndex}`}>
                    {column.map((symbolId, rowIndex) => {
                      const symbol = symbolMap[symbolId];
                      const tileImage = symbolArtworkById[symbolId] ?? null;
                      const isArtworkTile = Boolean(tileImage);

                      return (
                        <article
                          key={`${columnIndex}-${rowIndex}-${symbolId}`}
                          className={`symbol-tile ${symbol?.accent ?? ""} ${isArtworkTile ? "symbol-tile-art" : ""} ${
                            winningTileKeys.includes(`${columnIndex}-${rowIndex}`) ? "symbol-tile-winning" : ""
                          }`}
                          title={symbol?.label ?? symbolId}
                        >
                          {tileImage ? (
                            <AssetImage
                              src={tileImage}
                              alt={symbol?.label ?? symbolId}
                              className={`symbol-art ${isArtworkTile ? "puzzle-piece" : ""}`}
                              fetchPriority="high"
                              retryKey={`${sessionId}-${boardRetryKey}`}
                            />
                          ) : (
                            <>
                              <span className="symbol-label">{symbol?.label ?? symbolId}</span>
                              <span className="symbol-tag">{symbol?.tag ?? ""}</span>
                            </>
                          )}
                        </article>
                      );
                    })}
                  </div>
                ))}
              </div>

              {!isMobileLayout ? (
                <div className={`win-banner banner-${flashTier}`}>
                  <span className="win-banner-label">{winBannerLabel}</span>
                  <strong>{winBannerValue}</strong>
                </div>
              ) : null}
            </div>

            {uiState?.resultMessage || error ? (
              <div className="minimal-status">
                {uiState?.resultMessage ? <p>{uiState.resultMessage}</p> : null}
                {error ? <p className="error-text">{error}</p> : null}
              </div>
            ) : null}

            {showRefillPanel ? (
              <div className="refill-panel">
                <strong>Need more coins?</strong>
                <p className="refill-copy">
                  {refillRequest?.status === "pending"
                    ? "Your top-up request is pending approval in the backend admin page."
                    : refillRequest?.status === "approved" || isApplyingRefill
                      ? "Approval received. Adding coins to this browser now."
                      : `Request another ${formatCoins(REFILL_AMOUNT)} coins for this guest browser.`}
                </p>
                <div className="refill-actions">
                  <button
                    type="button"
                    className="mode-button compact secondary-button"
                    onClick={handleRefillRequest}
                    disabled={isRequestingRefill || isApplyingRefill || refillRequest?.status === "pending"}
                  >
                    {isApplyingRefill
                      ? "Applying..."
                      : isRequestingRefill
                        ? "Sending..."
                        : refillRequest?.status === "pending"
                          ? "Request Sent"
                          : `Request ${formatCoins(REFILL_AMOUNT)} Coins`}
                  </button>
                  {refillRequest?.id ? (
                    <span className="refill-request-tag">Request {refillRequest.id.slice(-8)}</span>
                  ) : null}
                </div>
                {refillError ? <p className="error-text refill-error">{refillError}</p> : null}
              </div>
            ) : null}

            {showSignedInBalancePanel ? (
              <div className="refill-panel refill-panel-user">
                <strong>Signed-in balance is low</strong>
                <p className="refill-copy">
                  Your signed-in player coins live on the backend account. Ask the admin to add more coins to your
                  username and the next refresh will continue from that stored balance.
                </p>
              </div>
            ) : null}

            {!isMobileLayout ? (
              <div className="controls simple-controls">
                <button
                  type="button"
                  className="spin-button"
                  onClick={handleSpin}
                  disabled={isSpinActionDisabled}
                >
                  {actionLabel}
                </button>
                <button
                  type="button"
                  className="mode-button compact secondary-button"
                  onClick={() => {
                    trackEvent("help_opened", { source: "desktop_controls" });
                    setIsInfoOpen(true);
                  }}
                >
                  Help
                </button>
              </div>
            ) : null}

            <div className={`page-nav page-nav-bottom ${isMobileLayout ? "page-nav-mobile" : ""}`} aria-label="More pages">
              {secondaryPageButtons.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  className={`mode-button compact page-nav-button ${currentPage === page.id ? "page-nav-button-active" : ""}`}
                  onClick={() => navigateToPage(page.id)}
                >
                  {page.navLabel}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="panel content-page-panel">
            <div className="content-page-hero">
              <p className="section-label">{currentPageMeta.label}</p>
              <h2>{currentPage === "guide" ? "Whacky Game Guide" : "Whacky Game FAQ"}</h2>
              <p className="content-page-copy">
                {currentPage === "guide"
                  ? "Use this guide to understand the spin flow, family matches, feature triggers, and the locked bonus mode before you jump back into the board."
                  : "Use these quick answers to understand costs, trigger conditions, bonus choices, and how guest versus signed-in balances behave."}
              </p>
            </div>

            <div className="info-grid content-page-grid">
              {currentPage === "guide" ? (
                <>
                  <section className="info-section">
                    <h3>Quick Guide</h3>
                    <ol className="guide-list">
                      {GUIDE_STEPS.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </section>

                  <section className="info-section">
                    <h3>How To Play</h3>
                    <ul>
                      <li>Each spin costs {formatCoins(spinCost)} coins.</li>
                      <li>Each unlocked free spin costs 0 coins and must be played manually.</li>
                      <li>Match 3, 4, or 5 pieces from the same family across active paylines to win.</li>
                      <li>Bonus rounds and mega bonus rounds ask you to choose 200 or 300 once, then lock that mode for the feature.</li>
                      <li>Wild pieces can help complete matching lines.</li>
                    </ul>
                  </section>

                  <section className="info-section info-section-wide">
                    <h3>Special Events</h3>
                    <ul>
                      <li>
                        Any full same-family row starts {config.features?.baseFreeSpins ?? 0} free spins with a{" "}
                        {config.features?.freeSpinMultiplier ?? 1}x multiplier.
                      </li>
                      <li>
                        A row or column with 5 or more tiles from the same family starts a{" "}
                        {config.features?.bonusRoundSpins ?? 0}-spin bonus round at x
                        {config.features?.bonusRoundMultiplier ?? 1}.
                      </li>
                      <li>
                        All 16 tiles from the same family start a {config.features?.megaBonusSpins ?? 0}-spin mega bonus
                        round at x{config.features?.megaBonusMultiplier ?? 1}.
                      </li>
                      {(config.eventDefinitions ?? []).map((eventDefinition) => (
                        <li key={eventDefinition.type}>
                          {eventDefinition.label}: {eventDefinition.description}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="info-section info-section-wide">
                    <h3>Site Map</h3>
                    <div className="family-grid">
                      {SITE_MAP_ITEMS.map((item) => (
                        <article className="family-card" key={item.title}>
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <section className="info-section info-section-wide">
                    <h3>Frequently Asked Questions</h3>
                    <div className="faq-grid">
                      {FAQ_ITEMS.map((item) => (
                        <article className="family-card" key={item.question}>
                          <h4>{item.question}</h4>
                          <p>{item.answer}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="info-section info-section-wide">
                    <h3>Puzzle Families</h3>
                    <div className="family-grid">
                      {familyDetails.map((family) => (
                        <article className="family-card" key={family.id}>
                          <h4>{family.label}</h4>
                          <p>{family.members.join(" and ")}</p>
                          <p className="family-prize">{formatPayoutSummary(family.payouts)}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="info-section info-section-wide">
                    <h3>Special Symbols</h3>
                    <div className="family-grid">
                      {specialSymbols.map((symbol) => (
                        <article className="family-card" key={symbol.id}>
                          <h4>{symbol.label}</h4>
                          <p>{symbol.tag}</p>
                          <p className="family-prize">
                            {symbol.type === "wild"
                              ? "Substitutes for regular family pieces."
                              : "Special event symbols are currently handled through family patterns instead of board icons."}
                          </p>
                        </article>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>

            <div className={`page-nav page-nav-bottom ${isMobileLayout ? "page-nav-mobile" : ""}`} aria-label="More pages">
              {secondaryPageButtons.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  className={`mode-button compact page-nav-button ${currentPage === page.id ? "page-nav-button-active" : ""}`}
                  onClick={() => navigateToPage(page.id)}
                  aria-current={currentPage === page.id ? "page" : undefined}
                >
                  {page.navLabel}
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {isMobileLayout && isHomePage ? (
        <div className="mobile-action-bar">
          <button
            type="button"
            className="spin-button"
            onClick={handleSpin}
            disabled={isSpinActionDisabled}
          >
            {actionLabel}
          </button>
          <button
            type="button"
            className="mode-button compact secondary-button"
            onClick={() => {
              trackEvent("help_opened", { source: "mobile_action_bar" });
              setIsInfoOpen(true);
            }}
          >
            Help
          </button>
        </div>
      ) : null}

      {isInfoOpen ? (
        <div className="bonus-overlay info-overlay" onClick={() => setIsInfoOpen(false)}>
          <div className="bonus-modal info-modal" onClick={(event) => event.stopPropagation()}>
            <div className="info-header">
              <div>
                <p className="section-label">Game Info</p>
                <h2>Rules, puzzle families, and prizes</h2>
              </div>
              <button
                type="button"
                className="mode-button compact secondary-button"
                onClick={() => setIsInfoOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="info-grid">
              <section className="info-section">
                <h3>How To Play</h3>
                <ul>
                  <li>Each spin costs {formatCoins(spinCost)} coins.</li>
                  <li>Each unlocked free spin costs 0 coins and must be played manually.</li>
                  <li>Match 3, 4, or 5 pieces from the same family across active paylines to win.</li>
                  <li>Bonus rounds and mega bonus rounds ask you to choose 200 or 300 once, then lock that mode for the feature.</li>
                  <li>Wild pieces can help complete matching lines.</li>
                  <li>Guest balances stay in local browser storage, while signed-in player balances are synced to the backend on each change.</li>
                </ul>
              </section>

              <section className="info-section">
                <h3>Quick Guide</h3>
                <ol className="guide-list">
                  {GUIDE_STEPS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>

              <section className="info-section">
                <h3>Special Events</h3>
                <ul>
                  <li>
                    Any full same-family row starts {config.features?.baseFreeSpins ?? 0} free spins with a{" "}
                    {config.features?.freeSpinMultiplier ?? 1}x multiplier.
                  </li>
                  <li>
                    A row or column with 5 or more tiles from the same family starts a{" "}
                    {config.features?.bonusRoundSpins ?? 0}-spin bonus round at x
                    {config.features?.bonusRoundMultiplier ?? 1}.
                  </li>
                  <li>
                    All 16 tiles from the same family start a {config.features?.megaBonusSpins ?? 0}-spin mega bonus
                    round at x{config.features?.megaBonusMultiplier ?? 1}.
                  </li>
                  {(config.eventDefinitions ?? []).map((eventDefinition) => (
                    <li key={eventDefinition.type}>
                      {eventDefinition.label}: {eventDefinition.description}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="info-section info-section-wide">
                <h3>Site Map</h3>
                <div className="family-grid">
                  {SITE_MAP_ITEMS.map((item) => (
                    <article className="family-card" key={item.title}>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="info-section info-section-wide">
                <h3>FAQs</h3>
                <div className="faq-grid">
                  {FAQ_ITEMS.map((item) => (
                    <article className="family-card" key={item.question}>
                      <h4>{item.question}</h4>
                      <p>{item.answer}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="info-section info-section-wide">
                <h3>Puzzle Families</h3>
                <div className="family-grid">
                  {familyDetails.map((family) => (
                    <article className="family-card" key={family.id}>
                      <h4>{family.label}</h4>
                      <p>{family.members.join(" and ")}</p>
                      <p className="family-prize">{formatPayoutSummary(family.payouts)}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="info-section info-section-wide">
                <h3>Special Symbols</h3>
                <div className="family-grid">
                  {specialSymbols.map((symbol) => (
                    <article className="family-card" key={symbol.id}>
                      <h4>{symbol.label}</h4>
                      <p>{symbol.tag}</p>
                      <p className="family-prize">
                        {symbol.type === "wild"
                          ? "Substitutes for regular family pieces."
                          : "Special event symbols are currently handled through family patterns instead of board icons."}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}

      {isAuthModalOpen ? (
        <div className="bonus-overlay auth-overlay" onClick={closeAuthModal}>
          <div className="bonus-modal auth-modal" onClick={(event) => event.stopPropagation()}>
            <div className="info-header auth-modal-header">
              <div>
                <p className="section-label">Account Access</p>
                <h2>{authMode === "signup" ? "Create your player account" : "Sign in to your player account"}</h2>
              </div>
              <button
                type="button"
                className="mode-button compact secondary-button"
                onClick={closeAuthModal}
                disabled={isAuthSubmitting}
              >
                Close
              </button>
            </div>

            <div className="auth-mode-toggle auth-modal-toggle" role="tablist" aria-label="Choose sign-in mode">
              <button
                type="button"
                className={`auth-toggle ${authMode === "signin" ? "auth-toggle-active" : ""}`}
                onClick={() => setAuthMode("signin")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-toggle ${authMode === "signup" ? "auth-toggle-active" : ""}`}
                onClick={() => setAuthMode("signup")}
              >
                Sign Up
              </button>
            </div>

            <div className="auth-modal-copy">
              {authMode === "signup"
                ? "Create a username and password to keep your gold signed-in balance synced with the backend."
                : "Sign in with your username and password to continue from your gold signed-in balance."}
            </div>

            <div className="auth-fields auth-fields-modal">
              <input
                type="text"
                value={authForm.username}
                onChange={(event) =>
                  setAuthForm((currentForm) => ({ ...currentForm, username: event.target.value }))
                }
                placeholder="Username"
                autoComplete="username"
              />
              <input
                type="password"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm((currentForm) => ({ ...currentForm, password: event.target.value }))
                }
                placeholder="Password"
                autoComplete={authMode === "signup" ? "new-password" : "current-password"}
              />
            </div>

            {authError ? <p className="auth-error-banner auth-error-banner-modal">{authError}</p> : null}

            <div className="auth-modal-actions">
              <button
                type="button"
                className="mode-button compact secondary-button"
                onClick={closeAuthModal}
                disabled={isAuthSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="mode-button compact auth-submit-button"
                onClick={() => handleAuthSubmit(authMode)}
                disabled={authSubmitDisabled}
              >
                {isAuthSubmitting ? "Working..." : authMode === "signup" ? "Create Account" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isHomePage && (uiState?.celebrationLabel || freeSpinPopupEvent) ? (
        <div className="celebration-overlay" aria-hidden="true">
          <div className={`celebration-card celebration-${flashTier}`}>
            <div className="celebration-title">{freeSpinPopupTitle ?? uiState?.celebrationLabel}</div>
            {freeSpinPopupCount > 0 ? <div className="celebration-subtitle">{freeSpinPopupMessage}</div> : null}
          </div>
        </div>
      ) : null}

      {isHomePage && isManualBonusFeature && isFeatureRunning ? (
        <div className="feature-runner free-spin-banner">
          <div className="feature-runner-pill">
            {specialState?.type === "mega_bonus_round" ? "Mega Bonus Spin Running" : "Bonus Spin Running"}
          </div>
          <div className="feature-runner-copy">
            Resolving the locked {specialState?.selectedStakeChoice ?? specialState?.lastStakeChoice ?? "200/300"}-coin
            mode and applying the feature multiplier now.
          </div>
        </div>
      ) : null}

      {isHomePage && showBonusChoiceOverlay ? (
        <div
          className={`bonus-overlay overlay-${overlayTheme} ${
            specialState?.type === "mega_bonus_round" || specialState?.type === "bonus_round"
              ? "bonus-overlay-jackpot"
              : ""
          }`}
        >
          <div className={`bonus-modal modal-${overlayTheme}`}>
            {specialState?.type === "mega_bonus_round" || specialState?.type === "bonus_round" ? (
              <div className="bonus-jackpot-burst" aria-hidden="true">
                {Array.from({ length: 14 }, (_, index) => (
                  <span key={index} className="bonus-glitter" />
                ))}
              </div>
            ) : null}

            <div className="special-event-pill">
              {specialState?.type === "mega_bonus_round" ? "Mega Bonus Round" : "Bonus Round"}
            </div>
            <div className="bonus-summary-grid">
              <div className="bonus-summary-card">
                <span>Bonus rounds</span>
                <strong>{bonusRoundCount}</strong>
              </div>
              <div className="bonus-summary-card">
                <span>Multiplier</span>
                <strong>X{specialState?.featureMultiplier ?? 1}</strong>
              </div>
            </div>

            <div className="bonus-event-banner">Choose bet</div>
            <div className="bonus-choice-grid">
              {(specialState?.availableStakeOptions ?? []).map((stakeChoice) => (
                <button
                  key={stakeChoice}
                  type="button"
                  className="bonus-card bonus-choice-button"
                  onClick={() => handleFeatureChoice(stakeChoice)}
                  disabled={isSpinning || isFeatureRunning || gameState.balance < stakeChoice}
                >
                  <span>{formatCoins(stakeChoice)} coins</span>
                  <strong>X{specialState?.choiceMultipliers?.[stakeChoice] ?? 1}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AssetImage({ src, alt, className, fetchPriority = "auto", retryKey = "" }) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setFailed(false);
    setAttempt(0);
  }, [retryKey, src]);

  if (!src || failed) {
    return null;
  }

  return (
    <img
      key={`${src}-${attempt}`}
      src={src}
      alt={alt}
      className={className}
      loading={fetchPriority === "high" ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={fetchPriority}
      onError={() => {
        if (attempt < 2) {
          setAttempt((currentAttempt) => currentAttempt + 1);
          return;
        }

        setFailed(true);
      }}
    />
  );
}

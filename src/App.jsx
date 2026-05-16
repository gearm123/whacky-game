import { useEffect, useMemo, useState } from "react";
import { fetchWallet, settleWallet } from "./api";
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

const GREEK_BACKGROUND_CLASSES = [
  "backdrop-figure backdrop-greek backdrop-greek-1",
  "backdrop-figure backdrop-greek backdrop-greek-2",
  "backdrop-figure backdrop-greek backdrop-greek-3",
];

const LOONY_BACKGROUND_CLASSES = [
  "backdrop-figure backdrop-loony backdrop-loony-1",
  "backdrop-figure backdrop-loony backdrop-loony-2",
];

const NETWORK_BACKGROUND_CLASSES = [
  "backdrop-figure backdrop-network backdrop-network-1",
  "backdrop-figure backdrop-network backdrop-network-2",
];

const FAMILY_ORDER = ["GREEK", "SLAPSTICK", "MYSTERY"];
const MOBILE_MEDIA_QUERY = "(max-width: 760px)";
const ALL_IMAGE_ASSETS = Array.from(
  new Set([...GREEK_IMAGE_ASSETS, ...LOONY_IMAGE_ASSETS, ...NETWORK_IMAGE_ASSETS]),
);

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function formatCoins(value) {
  return Number(value ?? 0).toLocaleString();
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

function preloadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    let finished = false;

    const complete = () => {
      if (finished) {
        return;
      }

      finished = true;
      resolve();
    };

    image.onload = () => {
      if (typeof image.decode === "function") {
        image.decode().catch(() => undefined).finally(complete);
        return;
      }

      complete();
    };

    image.onerror = complete;
    image.src = src;

    if (image.complete) {
      complete();
    }
  });
}

async function preloadAssets(sources, onProgress) {
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

  for (const lineWin of lineWins) {
    const payline = paylines?.[Math.max(0, (lineWin.line ?? 1) - 1)];
    if (!payline) {
      continue;
    }

    for (let reelIndex = 0; reelIndex < Math.min(lineWin.count ?? 0, payline.length); reelIndex += 1) {
      keys.add(`${reelIndex}-${payline[reelIndex]}`);
    }
  }

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
  const [assetLoadState, setAssetLoadState] = useState({
    loaded: 0,
    total: ALL_IMAGE_ASSETS.length,
  });
  const [isMobileLayout, setIsMobileLayout] = useState(() =>
    window.matchMedia(MOBILE_MEDIA_QUERY).matches,
  );

  const symbols = config?.symbols ?? [];
  const themePayouts = config?.themePayouts ?? {};
  const symbolMap = useMemo(
    () => Object.fromEntries(symbols.map((symbol) => [symbol.id, symbol])),
    [symbols],
  );
  const symbolIds = useMemo(() => symbols.map((symbol) => symbol.id), [symbols]);
  const spinCost = config?.economics.spinCost ?? 0;
  const flashTier = uiState?.flashTier ?? "none";
  const lastWin = uiState?.lastWin ?? 0;
  const hasWin = lastWin > 0;
  const specialState = uiState?.specialState ?? null;
  const overlayTheme = uiState?.overlayTheme ?? "greek";
  const winBannerLabel = uiState?.winBannerLabel ?? (hasWin ? "WIN" : "READY");
  const winBannerValue = hasWin ? `${formatCoins(lastWin)} coins` : `${formatCoins(spinCost)} coins`;
  const actionLabel = isSpinning
    ? "Resolving..."
    : isFeatureRunning
      ? "Running Feature..."
      : "Play";

  const boardImages = useMemo(() => {
    const boardSeed = JSON.stringify(board);
    const assignments = {};

    board.forEach((column, columnIndex) => {
      column.forEach((symbolId, rowIndex) => {
        const symbol = symbolMap[symbolId];
        const assetPool = getSymbolAssetPool(symbol);

        if (assetPool.length === 0) {
          return;
        }

        assignments[`${columnIndex}-${rowIndex}`] = pickSeededAsset(
          assetPool,
          `${symbolId}-${symbol?.themeGroup ?? symbol?.type ?? "tile"}-${columnIndex}-${rowIndex}-${boardSeed}`,
        );
      });
    });

    return assignments;
  }, [board, symbolMap]);

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
    () => symbols.filter((symbol) => symbol.type !== "regular"),
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

  async function loadGame() {
    setIsLoading(true);
    setError("");
    setAssetLoadState({ loaded: 0, total: ALL_IMAGE_ASSETS.length });

    try {
      const walletPromise = fetchWallet();
      const assetPromise = preloadAssets(ALL_IMAGE_ASSETS, setAssetLoadState);
      const configPayload = getGameConfig();
      const walletPayload = await walletPromise;
      await assetPromise;
      const sessionPayload = createGameSession(walletPayload.balance);

      setConfig(configPayload);
      setSessionId(sessionPayload.sessionId);
      setGameState(sessionPayload.state);
      setUiState(sessionPayload.uiState);
      setBoard(sessionPayload.board);
      setEvents(sessionPayload.events ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load config.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadGame();
  }, []);

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
    if (!config || !sessionId || !specialState?.active || isSpinning || isFeatureRunning || !gameState) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsFeatureRunning(true);
      setError("");

      try {
        const payload = runGameFeature(gameState, board);
        const walletPayload = await settleWallet({
          previousBalance: gameState.balance,
          nextBalance: payload.state.balance,
          delta: payload.state.balance - gameState.balance,
          reason: payload.events?.[0]?.type ?? "feature_resolution",
        });

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
    }, specialState.autoAdvanceMs ?? 1400);

    return () => window.clearTimeout(timeoutId);
  }, [board, config, gameState, sessionId, specialState, isSpinning, isFeatureRunning]);

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

  async function handleSpin() {
    if (!config || !sessionId || !gameState || isSpinning || isFeatureRunning || specialState?.active) {
      return;
    }

    setError("");
    setIsSpinning(true);

    const startTime = Date.now();

    try {
      const payload = runGameSpin(gameState);
      const walletPayload = await settleWallet({
        previousBalance: gameState.balance,
        nextBalance: payload.state.balance,
        delta: payload.state.balance - gameState.balance,
        reason: payload.events?.[0]?.type ?? "spin_resolution",
      });
      const elapsed = Date.now() - startTime;
      await wait(Math.max(0, 1100 - elapsed));

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
        <div className="sun-disk" />
        <div className="mount-olympus" />
        <div className="sky-temple sky-temple-left" />
        <div className="sky-temple sky-temple-right" />
        <div className="temple-silhouette" />
        <div className="temple-ruins temple-ruins-left" />
        <div className="temple-ruins temple-ruins-right" />
        <div className="pillar-cluster pillar-cluster-left">
          <span className="pillar" />
          <span className="pillar short" />
          <span className="pillar" />
        </div>
        <div className="pillar-cluster pillar-cluster-right">
          <span className="pillar" />
          <span className="pillar short" />
          <span className="pillar" />
        </div>
        <div className="laurel-ring" />
        <div className="coin-cluster coin-cluster-left" />
        <div className="coin-cluster coin-cluster-right" />
        <div className="cash-ribbon cash-ribbon-left" />
        <div className="cash-ribbon cash-ribbon-right" />
        <div className="greek-arch greek-arch-left" />
        <div className="greek-arch greek-arch-right" />
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
      </div>
      <div className="page-noise" />
      <div className="coin-burst" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} className="coin-particle" />
        ))}
      </div>

      <header className={isMobileLayout ? "mobile-topbar" : "simple-topbar"}>
        <div className="brand-block">
          <p className="eyebrow">Greek Puzzle Slot</p>
          <h1>{config.title}</h1>
        </div>

        {!isMobileLayout ? (
          <div className="topbar-actions">
            <div className="balance-chip">
              <span>Balance</span>
              <strong>{formatCoins(gameState.balance)} coins</strong>
            </div>
          </div>
        ) : null}
      </header>

      {isMobileLayout ? (
        <section className="mobile-summary-strip">
          <div className="balance-chip mobile-balance-chip">
            <span>Balance</span>
            <strong>{formatCoins(gameState.balance)} coins</strong>
          </div>
          <div className={`win-banner mobile-win-banner banner-${flashTier}`}>
            <span className="win-banner-label">{winBannerLabel}</span>
            <strong>{winBannerValue}</strong>
          </div>
        </section>
      ) : null}

      <main className={`simple-stage ${isMobileLayout ? "simple-stage-mobile" : ""}`}>
        <section className="cabinet simple-cabinet">
          <div className={`cabinet-stage stage-${overlayTheme}`}>
            <div className={`reel-frame ${isSpinning ? "reel-frame-spinning" : ""}`}>
              {board.map((column, columnIndex) => (
                <div className="reel-column" key={`reel-${columnIndex}`}>
                  {column.map((symbolId, rowIndex) => {
                    const symbol = symbolMap[symbolId];
                    const tileImage = boardImages[`${columnIndex}-${rowIndex}`] ?? null;
                    const isArtworkTile = Boolean(tileImage);

                    return (
                      <article
                        key={`${columnIndex}-${rowIndex}-${symbolId}`}
                        className={`symbol-tile ${isArtworkTile ? "symbol-tile-art" : symbol?.accent ?? ""} ${
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
                          />
                        ) : null}
                        <span className="symbol-label">{symbol?.label ?? symbolId}</span>
                        <span className="symbol-tag">{symbol?.tag ?? ""}</span>
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

          <div className="minimal-status">
            <p>{uiState?.resultMessage ?? "Waiting for state..."}</p>
            {error ? <p className="error-text">{error}</p> : null}
          </div>

          {!isMobileLayout ? (
            <div className="controls simple-controls">
              <button
                type="button"
                className="spin-button"
                onClick={handleSpin}
                disabled={isSpinning || isFeatureRunning || specialState?.active}
              >
                {actionLabel}
              </button>
              <button
                type="button"
                className="mode-button compact secondary-button"
                onClick={() => setIsInfoOpen(true)}
              >
                Info
              </button>
            </div>
          ) : null}
        </section>
      </main>

      {isMobileLayout ? (
        <div className="mobile-action-bar">
          <button
            type="button"
            className="spin-button"
            onClick={handleSpin}
            disabled={isSpinning || isFeatureRunning || specialState?.active}
          >
            {actionLabel}
          </button>
          <button
            type="button"
            className="mode-button compact secondary-button"
            onClick={() => setIsInfoOpen(true)}
          >
            Info
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
                  <li>Each spin costs {formatCoins(spinCost)} fake coins.</li>
                  <li>Match 3, 4, or 5 pieces from the same family across active paylines to win.</li>
                  <li>Wild pieces can help complete matching lines.</li>
                  <li>The frontend resolves each spin and feature locally and keeps the balance in local browser storage.</li>
                </ul>
              </section>

              <section className="info-section">
                <h3>Special Events</h3>
                <ul>
                  <li>
                    Scatter starts {config.features?.baseFreeSpins ?? 0} free spins with a{" "}
                    {config.features?.freeSpinMultiplier ?? 1}x multiplier.
                  </li>
                  <li>
                    Bonus starts an automatic reward sequence with up to{" "}
                    {config.features?.bonusPicks ?? 0} reveal steps.
                  </li>
                  {(config.eventDefinitions ?? []).map((eventDefinition) => (
                    <li key={eventDefinition.type}>
                      {eventDefinition.label}: {eventDefinition.description}
                    </li>
                  ))}
                </ul>
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
                          : symbol.type === "scatter"
                            ? formatPayoutSummary(symbol.payouts)
                            : "Triggers the mystery bonus sequence."}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}

      {uiState?.celebrationLabel ? (
        <div className="celebration-overlay" aria-hidden="true">
          <div className={`celebration-card celebration-${flashTier}`}>
            {uiState.celebrationLabel}
          </div>
        </div>
      ) : null}

      {specialState?.active ? (
        <div
          className={`bonus-overlay overlay-${overlayTheme} ${
            specialState.type === "bonus_round" ? "bonus-overlay-jackpot" : ""
          }`}
        >
          <div className={`bonus-modal modal-${overlayTheme}`}>
            {specialState.type === "bonus_round" ? (
              <div className="bonus-jackpot-burst" aria-hidden="true">
                {Array.from({ length: 14 }, (_, index) => (
                  <span key={index} className="bonus-glitter" />
                ))}
              </div>
            ) : null}

            <p className="section-label">Special Event</p>
            <div className="special-event-pill">
              {specialState.type === "bonus_round" ? "Bonus Round" : "Free Spins"}
            </div>
            <h2>{specialState.title}</h2>
            <p className="bonus-copy jackpot-copy">
              {specialState.type === "bonus_round"
                ? "Bonus round unlocked. Jackpot-style rewards are now being revealed."
                : "Free spins unlocked. Extra spins are now playing automatically."}
            </p>
            <p className="bonus-copy bonus-progress">{specialState.progressLabel ?? specialState.subtitle}</p>
            <p className="bonus-copy">{specialState.subtitle}</p>

            {specialState.type === "bonus_round" ? (
              <>
                <div className="bonus-event-banner">Bonus Round is live</div>
                <div className="bonus-grid">
                  {Array.from({ length: 3 }, (_, index) => {
                  const reward = specialState.revealedRewards?.[index];

                  return (
                    <div
                      key={index}
                      className={reward ? "bonus-card revealed" : "bonus-card"}
                    >
                      <span>{reward ? `${formatCoins(reward)} coins` : "Auto Reveal Pending"}</span>
                    </div>
                  );
                  })}
                </div>
              </>
            ) : (
              <div className="feature-runner">
                <div className="feature-runner-pill">Free Spins in progress</div>
                <div className="feature-runner-copy">
                  The game is auto-playing the remaining free spins now.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AssetImage({ src, alt, className, fetchPriority = "auto" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={fetchPriority === "high" ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={fetchPriority}
      onError={() => setFailed(true)}
    />
  );
}

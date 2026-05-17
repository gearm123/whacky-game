const GRID_REELS = 4;
const GRID_ROWS = 4;

const PAYLINES = [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [2, 2, 2, 2],
  [3, 3, 3, 3],
  [0, 1, 2, 3],
  [3, 2, 1, 0],
  [0, 0, 1, 1],
  [2, 2, 3, 3],
  [1, 2, 1, 0],
  [2, 1, 2, 3],
];

const SYMBOLS = [
  {
    id: "TEMPLE_MEDAL",
    label: "Temple Medal",
    tag: "Greek",
    type: "regular",
    themeGroup: "GREEK",
    accent: "symbol-violet",
  },
  {
    id: "PEGASUS_POP",
    label: "Pegasus Pop",
    tag: "Greek",
    type: "regular",
    themeGroup: "GREEK",
    accent: "symbol-coral",
  },
  {
    id: "MYSTERY_VAN",
    label: "Mystery Van",
    tag: "Network",
    type: "regular",
    themeGroup: "MYSTERY",
    accent: "symbol-green",
  },
  {
    id: "GHOST_LANTERN",
    label: "Ghost Lantern",
    tag: "Network",
    type: "regular",
    themeGroup: "MYSTERY",
    accent: "symbol-sky",
  },
  {
    id: "ZANY_ROCKET",
    label: "Zany Rocket",
    tag: "Loony",
    type: "regular",
    themeGroup: "SLAPSTICK",
    accent: "symbol-gold",
  },
  {
    id: "CARROT_CANNON",
    label: "Carrot Cannon",
    tag: "Loony",
    type: "regular",
    themeGroup: "SLAPSTICK",
    accent: "symbol-amber",
  },
  {
    id: "STORYBOOK_WISH",
    label: "Storybook Wish",
    tag: "Disney",
    type: "regular",
    themeGroup: "DISNEY",
    accent: "symbol-rose",
  },
  {
    id: "PIXIE_COMPASS",
    label: "Pixie Compass",
    tag: "Disney",
    type: "regular",
    themeGroup: "DISNEY",
    accent: "symbol-indigo",
  },
  {
    id: "SPACE_RANGER_SPARK",
    label: "Space Ranger Spark",
    tag: "Pixar",
    type: "regular",
    themeGroup: "PIXAR",
    accent: "symbol-aqua",
  },
  {
    id: "TOY_CHEST_TRAIL",
    label: "Toy Chest Trail",
    tag: "Pixar",
    type: "regular",
    themeGroup: "PIXAR",
    accent: "symbol-ruby",
  },
  {
    id: "WILD",
    label: "Mash-Up Mask",
    tag: "Wild",
    type: "wild",
    accent: "symbol-wild",
  },
  {
    id: "SCATTER",
    label: "Toon Theater",
    tag: "Free spins",
    type: "scatter",
    accent: "symbol-scatter",
  },
  {
    id: "BONUS",
    label: "Mystery Manor",
    tag: "Bonus round",
    type: "bonus",
    accent: "symbol-bonus",
  },
];

const THEME_PAYOUTS = {
  GREEK: { label: "Greek", payouts: { 3: 26, 4: 88, 5: 250 } },
  MYSTERY: { label: "Network", payouts: { 3: 30, 4: 96, 5: 275 } },
  SLAPSTICK: { label: "Loony", payouts: { 3: 24, 4: 82, 5: 230 } },
  DISNEY: { label: "Disney", payouts: { 3: 28, 4: 92, 5: 265 } },
  PIXAR: { label: "Pixar", payouts: { 3: 29, 4: 94, 5: 270 } },
};

const WILD_PAYOUTS = { 3: 60, 4: 210, 5: 700 };
const SCATTER_PAYOUTS = { 3: 50, 4: 130, 5: 260 };

const CONFIG = {
  gameId: "whacky-game-frontend",
  title: "Whacky Game",
  subtitle: "Frontend-owned puzzle slot engine",
  layout: {
    reels: GRID_REELS,
    rows: GRID_ROWS,
    paylines: PAYLINES,
  },
  economics: {
    spinCost: 100,
    targetRtp: 0.94,
    houseEdge: 0.06,
    hitFrequencyRange: [0.3, 0.42],
    configuredHitFrequency: 0.36,
    volatility: "medium-high",
  },
  features: {
    baseFreeSpins: 8,
    freeSpinMultiplier: 2,
    bonusRoundSpins: 5,
    bonusRoundMultiplier: 4,
    megaBonusSpins: 10,
    megaBonusMultiplier: 7,
    bonusStakeOptions: [200, 300],
    bonusStakeMultipliers: {
      200: 2,
      300: 3,
    },
  },
  presentation: {
    themeName: "Greek empire cartoon",
    overlayThemes: {
      base: "greek",
      freeSpins: "slapstick",
      bonusRound: "mystery",
      megaBonusRound: "mystery",
    },
  },
  eventDefinitions: [
    { type: "session_started", label: "Session Started", description: "A new frontend gameplay session started." },
    { type: "free_spins_started", label: "Free Spins Started", description: "A full same-family row unlocked free spins." },
    { type: "free_spins_retriggered", label: "Free Spins Retriggered", description: "Another full same-family row awarded extra free spins." },
    { type: "free_spins_completed", label: "Free Spins Completed", description: "The free-spin feature completed." },
    {
      type: "bonus_round_started",
      label: "Bonus Round Started",
      description: "A row or column plus 5+ matching family tiles unlocked a 5-spin x4 bonus.",
    },
    {
      type: "bonus_round_progress",
      label: "Bonus Round Progress",
      description: "A manual bonus spin resolved using the selected 200 or 300 stake mode.",
    },
    { type: "bonus_round_completed", label: "Bonus Round Completed", description: "The 5-spin bonus round completed." },
    {
      type: "mega_bonus_round_started",
      label: "Mega Bonus Started",
      description: "All 16 tiles matched one family, unlocking a 10-spin x7 mega bonus.",
    },
    {
      type: "mega_bonus_round_progress",
      label: "Mega Bonus Progress",
      description: "A manual mega bonus spin resolved using the selected 200 or 300 stake mode.",
    },
    { type: "mega_bonus_round_completed", label: "Mega Bonus Completed", description: "The 10-spin mega bonus completed." },
  ],
  themePayouts: THEME_PAYOUTS,
  symbols: SYMBOLS,
};

const STARTING_STATE = {
  balance: 2000,
  activeFeature: null,
  totalSpins: 0,
  totalPaid: 0,
  totalWon: 0,
};

const REGULAR_IDS = SYMBOLS.filter((symbol) => symbol.type === "regular").map((symbol) => symbol.id);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomItem(items) {
  return items[randomInt(items.length)];
}

function weightedPick(entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;

  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.type;
    }
  }

  return entries[0].type;
}

function createRandomBoard() {
  return Array.from({ length: GRID_REELS }, () =>
    Array.from({ length: GRID_ROWS }, () => randomItem(REGULAR_IDS)),
  );
}

function getWinTier(amount) {
  if (amount >= CONFIG.economics.spinCost * 4) {
    return "epic";
  }

  if (amount >= CONFIG.economics.spinCost * 2) {
    return "big";
  }

  if (amount > 0) {
    return "small";
  }

  return "none";
}

function createEvent(type, summary, payload = {}) {
  return { type, summary, payload };
}

function pickRandomThemeGroup() {
  return randomItem(["GREEK", "MYSTERY", "SLAPSTICK", "DISNEY", "PIXAR"]);
}

function getThemeFamilyForSymbols(symbolIds, symbolMap) {
  let themeGroup = null;

  for (const symbolId of symbolIds) {
    const symbol = symbolMap[symbolId];
    if (!symbol || symbol.type !== "regular") {
      return null;
    }

    if (!themeGroup) {
      themeGroup = symbol.themeGroup;
      continue;
    }

    if (symbol.themeGroup !== themeGroup) {
      return null;
    }
  }

  return themeGroup;
}

function evaluateBoard(board, multiplier) {
  const symbolMap = Object.fromEntries(SYMBOLS.map((symbol) => [symbol.id, symbol]));

  const lineWins = PAYLINES.map((payline, index) => {
    const lineSymbols = payline.map((rowIndex, reelIndex) => board[reelIndex][rowIndex]);
    let baseTheme = null;
    let consecutive = 0;

    for (const symbolId of lineSymbols) {
      const symbol = symbolMap[symbolId];

      if (consecutive === 0) {
        if (symbol.type === "scatter" || symbol.type === "bonus") {
          break;
        }

        consecutive += 1;
        baseTheme = symbol.type === "wild" ? "WILD_PENDING" : symbol.themeGroup;
        continue;
      }

      if (symbol.type === "scatter" || symbol.type === "bonus") {
        break;
      }

      if (symbol.type === "wild") {
        consecutive += 1;
        continue;
      }

      if (baseTheme === "WILD_PENDING") {
        baseTheme = symbol.themeGroup;
        consecutive += 1;
        continue;
      }

      if (symbol.themeGroup === baseTheme) {
        consecutive += 1;
        continue;
      }

      break;
    }

    const resolvedTheme = baseTheme === "WILD_PENDING" ? "WILD" : baseTheme;
    const payout =
      resolvedTheme === "WILD"
        ? WILD_PAYOUTS[consecutive]
        : THEME_PAYOUTS[resolvedTheme]?.payouts?.[consecutive];

    if (!resolvedTheme || !payout || consecutive < 3) {
      return null;
    }

    return {
      line: index + 1,
      lineSymbolId: resolvedTheme,
      displayName:
        resolvedTheme === "WILD" ? "Mash-Up Mask" : THEME_PAYOUTS[resolvedTheme].label,
      count: consecutive,
      amount: payout * multiplier,
    };
  }).filter(Boolean);

  const regularTileKeysByFamily = {
    GREEK: [],
    MYSTERY: [],
    SLAPSTICK: [],
    DISNEY: [],
    PIXAR: [],
  };

  board.forEach((column, columnIndex) => {
    column.forEach((symbolId, rowIndex) => {
      const symbol = symbolMap[symbolId];
      if (symbol?.type === "regular" && regularTileKeysByFamily[symbol.themeGroup]) {
        regularTileKeysByFamily[symbol.themeGroup].push(`${columnIndex}-${rowIndex}`);
      }
    });
  });

  const rowFamilyWins = Array.from({ length: GRID_ROWS }, (_, rowIndex) => {
    const rowSymbols = Array.from({ length: GRID_REELS }, (_, reelIndex) => board[reelIndex][rowIndex]);
    const themeGroup = getThemeFamilyForSymbols(rowSymbols, symbolMap);

    if (!themeGroup) {
      return null;
    }

    return {
      family: themeGroup,
      displayName: THEME_PAYOUTS[themeGroup]?.label ?? themeGroup,
      orientation: "row",
      index: rowIndex,
      tileKeys: Array.from({ length: GRID_REELS }, (_, reelIndex) => `${reelIndex}-${rowIndex}`),
    };
  }).filter(Boolean);

  const columnFamilyWins = Array.from({ length: GRID_REELS }, (_, columnIndex) => {
    const columnSymbols = board[columnIndex];
    const themeGroup = getThemeFamilyForSymbols(columnSymbols, symbolMap);

    if (!themeGroup) {
      return null;
    }

    return {
      family: themeGroup,
      displayName: THEME_PAYOUTS[themeGroup]?.label ?? themeGroup,
      orientation: "column",
      index: columnIndex,
      tileKeys: Array.from({ length: GRID_ROWS }, (_, rowIndex) => `${columnIndex}-${rowIndex}`),
    };
  }).filter(Boolean);

  const familyCounts = Object.fromEntries(
    Object.entries(regularTileKeysByFamily).map(([family, tileKeys]) => [family, tileKeys.length]),
  );
  const megaBonusFamily = Object.keys(familyCounts).find((family) => familyCounts[family] === GRID_REELS * GRID_ROWS) ?? null;
  const bonusTriggerMatch = [...rowFamilyWins, ...columnFamilyWins].find(
    (match) => familyCounts[match.family] >= 5 && match.family !== megaBonusFamily,
  ) ?? null;
  const freeSpinMatch = rowFamilyWins[0] ?? null;
  const scatterCount = board.flat().filter((entry) => entry === "SCATTER").length;
  const bonusCount = board.flat().filter((entry) => entry === "BONUS").length;
  const totalWin = lineWins.reduce((sum, entry) => sum + entry.amount, 0) +
    (scatterCount >= 3 ? (SCATTER_PAYOUTS[scatterCount] ?? 0) * multiplier : 0);

  return {
    lineWins,
    rowFamilyWins,
    columnFamilyWins,
    familyCounts,
    scatterCount,
    bonusCount,
    freeSpinTriggerFamily: freeSpinMatch?.displayName ?? null,
    freeSpinsAward: !megaBonusFamily && !bonusTriggerMatch && freeSpinMatch ? CONFIG.features.baseFreeSpins : 0,
    bonusTriggered: Boolean(bonusTriggerMatch),
    bonusTriggerFamily: bonusTriggerMatch?.displayName ?? null,
    bonusTriggerOrientation: bonusTriggerMatch?.orientation ?? null,
    megaBonusTriggered: Boolean(megaBonusFamily),
    megaBonusFamily: megaBonusFamily ? THEME_PAYOUTS[megaBonusFamily]?.label ?? megaBonusFamily : null,
    highlightTileKeys:
      megaBonusFamily
        ? regularTileKeysByFamily[megaBonusFamily]
        : bonusTriggerMatch
          ? regularTileKeysByFamily[bonusTriggerMatch.family]
          : freeSpinMatch
            ? freeSpinMatch.tileKeys
            : [],
    totalWin,
  };
}

function createThemeWinBoard(themeGroup, count, multiplier) {
  const themeIds = SYMBOLS.filter((symbol) => symbol.themeGroup === themeGroup).map((symbol) => symbol.id);
  const board = createRandomBoard();
  const payline = randomItem(PAYLINES);

  for (let reel = 0; reel < count; reel += 1) {
    board[reel][payline[reel]] = randomItem(themeIds);
  }

  const result = evaluateBoard(board, multiplier);
  if (result.totalWin > 0) {
    return { board, result };
  }

  return createLossBoard(multiplier);
}

function createFullRowFamilyBoard(themeGroup, multiplier) {
  const themeIds = SYMBOLS.filter((symbol) => symbol.themeGroup === themeGroup).map((symbol) => symbol.id);
  const board = createRandomBoard();
  const rowIndex = randomInt(GRID_ROWS);

  for (let reel = 0; reel < GRID_REELS; reel += 1) {
    board[reel][rowIndex] = randomItem(themeIds);
  }

  const result = evaluateBoard(board, multiplier);
  if (result.freeSpinsAward > 0) {
    return { board, result };
  }

  return createFullRowFamilyBoard(themeGroup, multiplier);
}

function createBonusFamilyBoard(themeGroup, multiplier) {
  const themeIds = SYMBOLS.filter((symbol) => symbol.themeGroup === themeGroup).map((symbol) => symbol.id);

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const board = createRandomBoard();
    const useColumn = Math.random() < 0.45;

    if (useColumn) {
      const columnIndex = randomInt(GRID_REELS);
      for (let rowIndex = 0; rowIndex < GRID_ROWS; rowIndex += 1) {
        board[columnIndex][rowIndex] = randomItem(themeIds);
      }
    } else {
      const rowIndex = randomInt(GRID_ROWS);
      for (let reelIndex = 0; reelIndex < GRID_REELS; reelIndex += 1) {
        board[reelIndex][rowIndex] = randomItem(themeIds);
      }
    }

    const extraCells = randomItem([1, 2, 2, 3]);
    for (let index = 0; index < extraCells; index += 1) {
      board[randomInt(GRID_REELS)][randomInt(GRID_ROWS)] = randomItem(themeIds);
    }

    const result = evaluateBoard(board, multiplier);
    if (result.bonusTriggered && !result.megaBonusTriggered) {
      return { board, result };
    }
  }

  return createBonusFamilyBoard(themeGroup, multiplier);
}

function createMegaBonusFamilyBoard(themeGroup, multiplier) {
  const themeIds = SYMBOLS.filter((symbol) => symbol.themeGroup === themeGroup).map((symbol) => symbol.id);
  const board = Array.from({ length: GRID_REELS }, () =>
    Array.from({ length: GRID_ROWS }, () => randomItem(themeIds)),
  );
  return { board, result: evaluateBoard(board, multiplier) };
}

function createLossBoard(multiplier) {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    const board = createRandomBoard();
    const result = evaluateBoard(board, multiplier);
    if (result.totalWin === 0 && result.freeSpinsAward === 0 && !result.bonusTriggered) {
      return { board, result };
    }
  }

  const board = createRandomBoard();
  return { board, result: evaluateBoard(board, multiplier) };
}

function addSpecialSymbols(symbolId, count, multiplier) {
  const board = createRandomBoard();
  const used = new Set();

  while (used.size < count) {
    const reel = randomInt(GRID_REELS);
    const row = randomInt(GRID_ROWS);
    const key = `${reel}-${row}`;
    if (used.has(key)) {
      continue;
    }

    used.add(key);
    board[reel][row] = symbolId;
  }

  return { board, result: evaluateBoard(board, multiplier) };
}

function createFeatureCards(state, uiState) {
  return [
    {
      title: "Slapstick Spins",
      value: state.activeFeature?.type === "free_spins" ? state.activeFeature.remaining : 0,
      note: "Triggered by a full same-family row",
    },
    {
      title:
        state.activeFeature?.type === "mega_bonus_round"
          ? "Mega Bonus"
          : "Bonus Round",
      value:
        state.activeFeature?.type === "bonus_round" || state.activeFeature?.type === "mega_bonus_round"
          ? `${state.activeFeature.remaining}/${state.activeFeature.totalSpins}`
          : "READY",
      note: "Manual 200 or 300 stake prompt each bonus spin",
    },
    {
      title: "Excitement",
      value: uiState.flashTier === "none" ? "WARMING" : uiState.flashTier.toUpperCase(),
      note: "Frontend visuals react directly to the resolved game state",
    },
  ];
}

function createUiState(state, result, events, resultMessage) {
  const lastWin = result?.totalWin ?? 0;
  const flashTier = getWinTier(lastWin);
  const activeFeature = state.activeFeature;
  const overlayTheme =
    activeFeature?.type === "mega_bonus_round"
      ? CONFIG.presentation.overlayThemes.megaBonusRound
      : activeFeature?.type === "bonus_round"
      ? CONFIG.presentation.overlayThemes.bonusRound
      : activeFeature?.type === "free_spins"
        ? CONFIG.presentation.overlayThemes.freeSpins
        : CONFIG.presentation.overlayThemes.base;
  const celebrationLabel =
    events.find((event) => event.type === "mega_bonus_round_started")
      ? "MEGA BONUS"
      : events.find((event) => event.type === "bonus_round_started")
      ? "BONUS ROUND"
      : events.find((event) => event.type === "free_spins_started")
        ? "FREE SPINS"
        : flashTier === "epic"
          ? "EPIC WIN"
          : flashTier === "big"
            ? "BIG WIN"
            : lastWin > 0
              ? "NICE HIT"
              : "";

  const specialState =
    activeFeature?.type === "free_spins"
      ? {
          active: true,
          type: "free_spins",
          title: "Free Spins",
          subtitle: `${activeFeature.remaining} free spins remain. Press Play to use the next one at 0 coins.`,
          progressLabel: `${activeFeature.played}/${activeFeature.totalAwarded} spins played`,
          manualPlay: true,
        }
      : activeFeature?.type === "bonus_round" || activeFeature?.type === "mega_bonus_round"
        ? {
            active: true,
            type: activeFeature.type,
            title: activeFeature.type === "mega_bonus_round" ? "Mega Bonus Round" : "Bonus Round",
            subtitle:
              activeFeature.type === "mega_bonus_round"
                ? activeFeature.selectedStakeChoice
                  ? `${activeFeature.remaining} mega bonus spins remain at x${activeFeature.featureMultiplier} using ${activeFeature.selectedStakeChoice}-coin mode.`
                  : `${activeFeature.remaining} mega bonus spins remain at x${activeFeature.featureMultiplier}.`
                : activeFeature.selectedStakeChoice
                  ? `${activeFeature.remaining} bonus spins remain at x${activeFeature.featureMultiplier} using ${activeFeature.selectedStakeChoice}-coin mode.`
                  : `${activeFeature.remaining} bonus spins remain at x${activeFeature.featureMultiplier}.`,
            progressLabel: `${activeFeature.played}/${activeFeature.totalSpins} spins played`,
            manualChoice: !activeFeature.selectedStakeChoice,
            availableStakeOptions: CONFIG.features.bonusStakeOptions,
            choiceMultipliers: CONFIG.features.bonusStakeMultipliers,
            featureMultiplier: activeFeature.featureMultiplier,
            selectedStakeChoice: activeFeature.selectedStakeChoice ?? null,
            selectedStakeMultiplier: activeFeature.selectedStakeMultiplier ?? null,
            lastStakeChoice: activeFeature.lastStakeChoice ?? null,
            lastStakeMultiplier: activeFeature.lastStakeMultiplier ?? null,
            promptLabel: activeFeature.selectedStakeChoice
              ? `Locked to ${activeFeature.selectedStakeChoice} mode for the rest of this feature`
              : "Choose 200 or 300 once for this feature",
          }
        : null;

  const uiState = {
    modeLabel: specialState ? "Special Feature" : "Base Game",
    multiplierValue: activeFeature?.type === "free_spins" ? CONFIG.features.freeSpinMultiplier : 1,
    featureBadge:
      activeFeature?.type === "mega_bonus_round"
        ? "Mega bonus live"
        : activeFeature?.type === "bonus_round"
          ? "Bonus round live"
        : activeFeature?.type === "free_spins"
          ? `${activeFeature.remaining} slapstick spins active`
          : "Base reels hot",
    flashTier,
    celebrationLabel,
    stageTitle: celebrationLabel || (specialState ? "Feature active" : "Align the reels"),
    stageSubcopy: specialState
      ? activeFeature?.type === "free_spins"
        ? "A full same-family row unlocked free spins. Press Play to use each free spin at 0 coins."
        : activeFeature?.type === "mega_bonus_round"
          ? activeFeature?.selectedStakeChoice
            ? `All 16 tiles matched one family. Press Play to run each mega bonus spin with ${activeFeature.selectedStakeChoice} mode.`
            : "All 16 tiles matched one family. Choose 200 or 300 to lock the mega bonus round mode."
          : activeFeature?.selectedStakeChoice
            ? `A row or column plus 5 matching family tiles unlocked a bonus round. Press Play to run each bonus spin with ${activeFeature.selectedStakeChoice} mode.`
            : "A row or column plus 5 matching family tiles unlocked a bonus round. Choose 200 or 300 to lock the bonus round mode."
      : "The frontend resolves regular wins, losses, free spins, and bonus rounds directly.",
    resultMessage,
    lastWin,
    winBannerLabel: celebrationLabel
      || (activeFeature?.type === "free_spins"
        ? "FREE SPIN READY"
        : activeFeature?.type === "mega_bonus_round"
          ? "MEGA BONUS READY"
          : activeFeature?.type === "bonus_round"
            ? "BONUS READY"
            : lastWin > 0
              ? "WIN CONFIRMED"
              : "SPIN READY"),
    lineWins: result?.lineWins ?? [],
    highlightTileKeys: result?.highlightTileKeys ?? [],
    overlayTheme,
    featureCards: [],
    specialState,
    sessionSummary: {
      totalSpins: state.totalSpins,
      totalPaid: state.totalPaid,
      totalWon: state.totalWon,
      liveRtp: state.totalPaid > 0 ? ((state.totalWon / state.totalPaid) * 100).toFixed(1) : "--",
      sessionNet: state.totalWon - state.totalPaid,
    },
  };

  uiState.featureCards = createFeatureCards(state, uiState);
  return uiState;
}

function createInitialPayload(initialBalance = STARTING_STATE.balance) {
  const state = clone(STARTING_STATE);
  state.balance = initialBalance;
  const board = createRandomBoard();
  const events = [createEvent("session_started", "Frontend gameplay session started.")];

  return {
    sessionId: `frontend-live-session-${Date.now()}`,
    state,
    board,
    events,
    uiState: createUiState(
      state,
      { totalWin: 0, lineWins: [] },
      events,
      "",
    ),
  };
}

export function getGameConfig() {
  return clone(CONFIG);
}

export function createGameSession(initialBalance = STARTING_STATE.balance) {
  return createInitialPayload(initialBalance);
}

export function runGameSpin(currentState) {
  const state = clone(currentState ?? STARTING_STATE);
  if (state.activeFeature) {
    throw new Error("Finish the active feature flow before starting a new base spin.");
  }

  if (state.balance < CONFIG.economics.spinCost) {
    throw new Error("Not enough balance for the next spin.");
  }

  state.balance -= CONFIG.economics.spinCost;
  state.totalPaid += CONFIG.economics.spinCost;
  state.totalSpins += 1;

  const outcomeType = weightedPick([
    { type: "lose", weight: 57 },
    { type: "greekWin", weight: 10 },
    { type: "mysteryWin", weight: 8 },
    { type: "slapstickWin", weight: 7 },
    { type: "disneyWin", weight: 6 },
    { type: "pixarWin", weight: 6 },
    { type: "freeSpins", weight: 4 },
    { type: "bonusRound", weight: 0.8 },
    { type: "megaBonusRound", weight: 0.2 },
  ]);

  let boardPayload;
  if (outcomeType === "lose") {
    boardPayload = createLossBoard(1);
  } else if (outcomeType === "freeSpins") {
    boardPayload = createFullRowFamilyBoard(pickRandomThemeGroup(), 1);
  } else if (outcomeType === "bonusRound") {
    boardPayload = createBonusFamilyBoard(pickRandomThemeGroup(), 1);
  } else if (outcomeType === "megaBonusRound") {
    boardPayload = createMegaBonusFamilyBoard(pickRandomThemeGroup(), 1);
  } else if (outcomeType === "greekWin") {
    boardPayload = createThemeWinBoard("GREEK", randomItem([3, 3, 4]), 1);
  } else if (outcomeType === "mysteryWin") {
    boardPayload = createThemeWinBoard("MYSTERY", randomItem([3, 4, 4]), 1);
  } else if (outcomeType === "disneyWin") {
    boardPayload = createThemeWinBoard("DISNEY", randomItem([3, 3, 4]), 1);
  } else if (outcomeType === "pixarWin") {
    boardPayload = createThemeWinBoard("PIXAR", randomItem([3, 3, 4]), 1);
  } else {
    boardPayload = createThemeWinBoard("SLAPSTICK", randomItem([3, 3, 4]), 1);
  }

  const result = boardPayload.result;
  state.balance += result.totalWin;
  state.totalWon += result.totalWin;

  let events = [];
  if (result.megaBonusTriggered) {
    state.activeFeature = {
      type: "mega_bonus_round",
      remaining: CONFIG.features.megaBonusSpins,
      totalSpins: CONFIG.features.megaBonusSpins,
      played: 0,
      featureMultiplier: CONFIG.features.megaBonusMultiplier,
      stakeOptions: CONFIG.features.bonusStakeOptions,
      selectedStakeChoice: null,
      selectedStakeMultiplier: null,
      totalFeatureWin: 0,
    };
    events = [
      createEvent(
        "mega_bonus_round_started",
        `${result.megaBonusFamily ?? "Family"} filled all 16 tiles and unlocked a 10-spin x7 mega bonus.`,
      ),
    ];
  } else if (result.bonusTriggered) {
    state.activeFeature = {
      type: "bonus_round",
      remaining: CONFIG.features.bonusRoundSpins,
      totalSpins: CONFIG.features.bonusRoundSpins,
      played: 0,
      featureMultiplier: CONFIG.features.bonusRoundMultiplier,
      stakeOptions: CONFIG.features.bonusStakeOptions,
      selectedStakeChoice: null,
      selectedStakeMultiplier: null,
      totalFeatureWin: 0,
    };
    events = [
      createEvent(
        "bonus_round_started",
        `${result.bonusTriggerFamily ?? "Family"} formed a ${result.bonusTriggerOrientation ?? "line"} and 5+ tiles to unlock a 5-spin x4 bonus.`,
      ),
    ];
  } else if (result.freeSpinsAward > 0) {
    state.activeFeature = {
      type: "free_spins",
      remaining: result.freeSpinsAward,
      totalAwarded: result.freeSpinsAward,
      played: 0,
    };
    events = [
      createEvent(
        "free_spins_started",
        `${result.freeSpinsAward} free spins started from a full ${result.freeSpinTriggerFamily ?? "family"} row.`,
      ),
    ];
  }

  const message =
    result.megaBonusTriggered
      ? `${result.megaBonusFamily ?? "Family"} filled the entire screen. Mega Bonus Round unlocked.`
      : result.bonusTriggered
        ? `${result.bonusTriggerFamily ?? "Family"} triggered a Bonus Round. Choose 200 or 300 to lock the round mode.`
        : result.freeSpinsAward > 0
          ? `${result.freeSpinTriggerFamily ?? "Family"} row complete. ${result.freeSpinsAward} free spins unlocked.`
          : result.totalWin > 0
            ? `Regular win: ${result.lineWins[0]?.displayName ?? "Theme"} paid ${result.totalWin} coins.`
            : "No payout this spin. Balance updated.";

  return {
    sessionId: `frontend-live-session-${state.totalSpins}`,
    state,
    board: boardPayload.board,
    events,
    uiState: createUiState(state, result, events, message),
  };
}

export function runGameFeature(currentState, currentBoard, stakeChoice = null) {
  const state = clone(currentState);
  const activeFeature = state.activeFeature;

  if (!activeFeature) {
    throw new Error("No feature is currently active.");
  }

  if (activeFeature.type === "free_spins") {
    const boardPayload = weightedPick([
      { type: "lose", weight: 49 },
      { type: "greekWin", weight: 11 },
      { type: "mysteryWin", weight: 10 },
      { type: "slapstickWin", weight: 9 },
      { type: "disneyWin", weight: 9 },
      { type: "pixarWin", weight: 10 },
      { type: "retrigger", weight: 2 },
    ]);

    let resultPayload;
    if (boardPayload === "lose") {
      resultPayload = createLossBoard(CONFIG.features.freeSpinMultiplier);
    } else if (boardPayload === "retrigger") {
      resultPayload = createFullRowFamilyBoard(pickRandomThemeGroup(), CONFIG.features.freeSpinMultiplier);
    } else if (boardPayload === "greekWin") {
      resultPayload = createThemeWinBoard("GREEK", randomItem([3, 4, 4]), CONFIG.features.freeSpinMultiplier);
    } else if (boardPayload === "mysteryWin") {
      resultPayload = createThemeWinBoard("MYSTERY", randomItem([3, 4, 4]), CONFIG.features.freeSpinMultiplier);
    } else if (boardPayload === "disneyWin") {
      resultPayload = createThemeWinBoard("DISNEY", randomItem([3, 4, 4]), CONFIG.features.freeSpinMultiplier);
    } else if (boardPayload === "pixarWin") {
      resultPayload = createThemeWinBoard("PIXAR", randomItem([3, 4, 4]), CONFIG.features.freeSpinMultiplier);
    } else {
      resultPayload = createThemeWinBoard("SLAPSTICK", randomItem([3, 4, 4]), CONFIG.features.freeSpinMultiplier);
    }

    const result = resultPayload.result;
    state.totalSpins += 1;
    state.balance += result.totalWin;
    state.totalWon += result.totalWin;
    activeFeature.played += 1;
    activeFeature.remaining -= 1;

    const events = [];
    if (result.freeSpinsAward > 0) {
      activeFeature.remaining += result.freeSpinsAward;
      activeFeature.totalAwarded += result.freeSpinsAward;
      events.push(
        createEvent(
          "free_spins_retriggered",
          `${result.freeSpinsAward} extra free spins added from a full ${result.freeSpinTriggerFamily ?? "family"} row.`,
        ),
      );
    }

    if (activeFeature.remaining <= 0) {
      state.activeFeature = null;
      events.push(createEvent("free_spins_completed", "Free-spin feature completed."));
    }

    return {
      sessionId: `frontend-live-session-${state.totalSpins}`,
      state,
      board: resultPayload.board,
      events,
      uiState: createUiState(
        state,
        result,
        events,
        result.freeSpinsAward > 0
          ? `${result.freeSpinTriggerFamily ?? "Family"} row retriggered ${result.freeSpinsAward} extra free spins.`
          : result.totalWin > 0
            ? `Free spin paid ${result.totalWin} coins.`
            : "Free spin resolved with no payout.",
      ),
    };
  }

  if (activeFeature.type !== "bonus_round" && activeFeature.type !== "mega_bonus_round") {
    throw new Error("Unknown feature type.");
  }

  const resolvedStakeChoice = stakeChoice ?? activeFeature.selectedStakeChoice;
  const stakeMultiplier = CONFIG.features.bonusStakeMultipliers[resolvedStakeChoice];
  if (!stakeMultiplier) {
    throw new Error("Choose 200 or 300 before starting the bonus spin.");
  }
  if (state.balance < resolvedStakeChoice) {
    throw new Error(`Not enough balance to use ${resolvedStakeChoice} mode for this bonus spin.`);
  }

  state.balance -= resolvedStakeChoice;
  state.totalPaid += resolvedStakeChoice;

  const roundType = weightedPick([
    { type: "lose", weight: 46 },
    { type: "greekWin", weight: 11 },
    { type: "mysteryWin", weight: 10 },
    { type: "slapstickWin", weight: 10 },
    { type: "disneyWin", weight: 10 },
    { type: "pixarWin", weight: 13 },
  ]);

  let resultPayload;
  const combinedMultiplier = activeFeature.featureMultiplier * stakeMultiplier;
  if (roundType === "lose") {
    resultPayload = createLossBoard(combinedMultiplier);
  } else if (roundType === "greekWin") {
    resultPayload = createThemeWinBoard("GREEK", randomItem([3, 4, 4]), combinedMultiplier);
  } else if (roundType === "mysteryWin") {
    resultPayload = createThemeWinBoard("MYSTERY", randomItem([3, 4, 4]), combinedMultiplier);
  } else if (roundType === "disneyWin") {
    resultPayload = createThemeWinBoard("DISNEY", randomItem([3, 4, 4]), combinedMultiplier);
  } else if (roundType === "pixarWin") {
    resultPayload = createThemeWinBoard("PIXAR", randomItem([3, 4, 4]), combinedMultiplier);
  } else {
    resultPayload = createThemeWinBoard("SLAPSTICK", randomItem([3, 4, 4]), combinedMultiplier);
  }

  const result = resultPayload.result;
  state.totalSpins += 1;
  state.balance += result.totalWin;
  state.totalWon += result.totalWin;
  activeFeature.played += 1;
  activeFeature.remaining -= 1;
  activeFeature.totalFeatureWin += result.totalWin;
  activeFeature.selectedStakeChoice = activeFeature.selectedStakeChoice ?? resolvedStakeChoice;
  activeFeature.selectedStakeMultiplier = activeFeature.selectedStakeMultiplier ?? stakeMultiplier;
  activeFeature.lastStakeChoice = resolvedStakeChoice;
  activeFeature.lastStakeMultiplier = stakeMultiplier;

  const progressEventType = activeFeature.type === "mega_bonus_round" ? "mega_bonus_round_progress" : "bonus_round_progress";
  const completedEventType = activeFeature.type === "mega_bonus_round" ? "mega_bonus_round_completed" : "bonus_round_completed";
  const featureLabel = activeFeature.type === "mega_bonus_round" ? "Mega bonus" : "Bonus round";
  const events = [
    createEvent(
      progressEventType,
      `${featureLabel} spin used ${resolvedStakeChoice} mode for ${stakeMultiplier}x on top of x${activeFeature.featureMultiplier}.`,
    ),
  ];

  if (activeFeature.remaining <= 0) {
    state.activeFeature = null;
    events.push(createEvent(completedEventType, `${featureLabel} completed.`));
  }

  return {
    sessionId: `frontend-live-session-${state.totalSpins}`,
    state,
    board: resultPayload.board,
    events,
    uiState: createUiState(
      state,
      result,
      events,
      result.totalWin > 0
        ? `${featureLabel} spin used ${resolvedStakeChoice} coins and paid ${result.totalWin} coins with the selected bet multiplier plus x${activeFeature.featureMultiplier}.`
        : `${featureLabel} spin used ${resolvedStakeChoice} coins with the selected bet multiplier plus x${activeFeature.featureMultiplier} and paid no coins.`,
    ),
  };
}

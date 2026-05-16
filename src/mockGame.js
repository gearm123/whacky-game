const PAYLINES = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 1, 1, 0],
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
};

const WILD_PAYOUTS = { 3: 60, 4: 210, 5: 700 };
const SCATTER_PAYOUTS = { 3: 50, 4: 130, 5: 260 };

const CONFIG = {
  gameId: "whacky-slot-frontend",
  title: "Whacky Slot",
  subtitle: "Frontend-owned puzzle slot engine",
  layout: {
    reels: 5,
    rows: 3,
    paylines: PAYLINES,
  },
  economics: {
    spinCost: 100,
    targetRtp: 0.98,
    houseEdge: 0.02,
    hitFrequencyRange: [0.34, 0.44],
    configuredHitFrequency: 0.38,
    volatility: "medium-high",
  },
  features: {
    baseFreeSpins: 8,
    freeSpinMultiplier: 2,
    bonusPicks: 3,
  },
  presentation: {
    themeName: "Greek empire cartoon",
    overlayThemes: {
      base: "greek",
      freeSpins: "slapstick",
      bonusRound: "mystery",
    },
  },
  eventDefinitions: [
    { type: "session_started", label: "Session Started", description: "A new frontend gameplay session started." },
    { type: "free_spins_started", label: "Free Spins Started", description: "The free-spin feature started." },
    { type: "free_spins_retriggered", label: "Free Spins Retriggered", description: "Additional free spins were awarded." },
    { type: "free_spins_completed", label: "Free Spins Completed", description: "The free-spin feature completed." },
    { type: "bonus_round_started", label: "Bonus Round Started", description: "The mystery bonus feature started." },
    { type: "bonus_round_progress", label: "Bonus Round Progress", description: "A bonus reward step resolved." },
    { type: "bonus_round_completed", label: "Bonus Round Completed", description: "The mystery bonus feature completed." },
  ],
  themePayouts: THEME_PAYOUTS,
  symbols: SYMBOLS,
};

const STARTING_STATE = {
  balance: 5000,
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
  return Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => randomItem(REGULAR_IDS)));
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

  const scatterCount = board.flat().filter((entry) => entry === "SCATTER").length;
  const bonusCount = board.flat().filter((entry) => entry === "BONUS").length;
  const totalWin = lineWins.reduce((sum, entry) => sum + entry.amount, 0) +
    (scatterCount >= 3 ? (SCATTER_PAYOUTS[scatterCount] ?? 0) * multiplier : 0);

  return {
    lineWins,
    scatterCount,
    bonusCount,
    freeSpinsAward: scatterCount >= 3 ? CONFIG.features.baseFreeSpins + (scatterCount - 3) * 2 : 0,
    bonusTriggered: bonusCount >= 3,
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
    const reel = randomInt(5);
    const row = randomInt(3);
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
      note: "Triggered by Toon Theater",
    },
    {
      title: "Mystery Round",
      value:
        state.activeFeature?.type === "bonus_round"
          ? `${state.activeFeature.remainingSteps}/${state.activeFeature.totalSteps}`
          : "READY",
      note: "Auto mystery-caper sequence",
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
    activeFeature?.type === "bonus_round"
      ? CONFIG.presentation.overlayThemes.bonusRound
      : activeFeature?.type === "free_spins"
        ? CONFIG.presentation.overlayThemes.freeSpins
        : CONFIG.presentation.overlayThemes.base;
  const celebrationLabel =
    events.find((event) => event.type === "bonus_round_started")
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
          subtitle: `${activeFeature.remaining} free spins remain.`,
          progressLabel: `${activeFeature.played}/${activeFeature.totalAwarded} spins played`,
          autoAdvanceMs: 1000,
        }
      : activeFeature?.type === "bonus_round"
        ? {
            active: true,
            type: "bonus_round",
            title: "Bonus Round",
            subtitle: `${activeFeature.remainingSteps} bonus reveals remain.`,
            progressLabel: `${activeFeature.totalSteps - activeFeature.remainingSteps}/${activeFeature.totalSteps} reveals opened`,
            autoAdvanceMs: 1000,
            revealedRewards: activeFeature.revealedRewards,
          }
        : null;

  const uiState = {
    modeLabel: specialState ? "Special Feature" : "Base Game",
    multiplierValue: activeFeature?.type === "free_spins" ? CONFIG.features.freeSpinMultiplier : 1,
    featureBadge:
      activeFeature?.type === "bonus_round"
        ? "Mystery bonus live"
        : activeFeature?.type === "free_spins"
          ? `${activeFeature.remaining} slapstick spins active`
          : "Base reels hot",
    flashTier,
    celebrationLabel,
    stageTitle: celebrationLabel || (specialState ? "Feature active" : "Align the reels"),
    stageSubcopy: specialState
      ? "The frontend is auto-running the special feature and updating the board in real time."
      : "The frontend resolves regular wins, losses, free spins, and bonus rounds directly.",
    resultMessage,
    lastWin,
    winBannerLabel: celebrationLabel || (lastWin > 0 ? "WIN CONFIRMED" : "SPIN READY"),
    lineWins: result?.lineWins ?? [],
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
      "Frontend gameplay is active. Spin to resolve the next board and event sequence.",
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
    { type: "lose", weight: 60 },
    { type: "greekWin", weight: 11 },
    { type: "mysteryWin", weight: 9 },
    { type: "slapstickWin", weight: 8 },
    { type: "freeSpins", weight: 8 },
    { type: "bonusRound", weight: 4 },
  ]);

  let boardPayload;
  if (outcomeType === "lose") {
    boardPayload = createLossBoard(1);
  } else if (outcomeType === "freeSpins") {
    boardPayload = addSpecialSymbols("SCATTER", randomItem([3, 4]), 1);
  } else if (outcomeType === "bonusRound") {
    boardPayload = addSpecialSymbols("BONUS", 3, 1);
  } else if (outcomeType === "greekWin") {
    boardPayload = createThemeWinBoard("GREEK", randomItem([3, 3, 3, 4]), 1);
  } else if (outcomeType === "mysteryWin") {
    boardPayload = createThemeWinBoard("MYSTERY", randomItem([3, 3, 4, 4]), 1);
  } else {
    boardPayload = createThemeWinBoard("SLAPSTICK", randomItem([3, 3, 3, 4]), 1);
  }

  const result = boardPayload.result;
  state.balance += result.totalWin;
  state.totalWon += result.totalWin;

  let events = [];
  if (result.freeSpinsAward > 0) {
    state.activeFeature = {
      type: "free_spins",
      remaining: result.freeSpinsAward,
      totalAwarded: result.freeSpinsAward,
      played: 0,
    };
    events = [createEvent("free_spins_started", `${result.freeSpinsAward} free spins started.`)];
  } else if (result.bonusTriggered) {
    const rewards = [90, 120, 180, 320].slice().sort(() => Math.random() - 0.5);
    state.activeFeature = {
      type: "bonus_round",
      totalSteps: rewards.length,
      remainingSteps: rewards.length,
      rewards,
      revealedRewards: [],
      totalBonusWin: 0,
    };
    events = [createEvent("bonus_round_started", "Mystery bonus started.")];
  }

  const message =
    result.totalWin > 0
      ? `Regular win: ${result.lineWins[0]?.displayName ?? "Theme"} paid ${result.totalWin} coins.`
      : result.freeSpinsAward > 0
        ? `Free-spin feature started with ${result.freeSpinsAward} spins.`
        : result.bonusTriggered
          ? "Mystery bonus event started."
          : "No payout this spin. Balance updated.";

  return {
    sessionId: `frontend-live-session-${state.totalSpins}`,
    state,
    board: boardPayload.board,
    events,
    uiState: createUiState(state, result, events, message),
  };
}

export function runGameFeature(currentState, currentBoard) {
  const state = clone(currentState);
  const activeFeature = state.activeFeature;

  if (!activeFeature) {
    throw new Error("No feature is currently active.");
  }

  if (activeFeature.type === "free_spins") {
    const boardPayload = weightedPick([
      { type: "lose", weight: 50 },
      { type: "greekWin", weight: 16 },
      { type: "mysteryWin", weight: 14 },
      { type: "slapstickWin", weight: 12 },
      { type: "retrigger", weight: 8 },
    ]);

    let resultPayload;
    if (boardPayload === "lose") {
      resultPayload = createLossBoard(CONFIG.features.freeSpinMultiplier);
    } else if (boardPayload === "retrigger") {
      resultPayload = addSpecialSymbols("SCATTER", 3, CONFIG.features.freeSpinMultiplier);
    } else if (boardPayload === "greekWin") {
      resultPayload = createThemeWinBoard("GREEK", randomItem([3, 3, 4, 4]), CONFIG.features.freeSpinMultiplier);
    } else if (boardPayload === "mysteryWin") {
      resultPayload = createThemeWinBoard("MYSTERY", randomItem([3, 4, 4, 5]), CONFIG.features.freeSpinMultiplier);
    } else {
      resultPayload = createThemeWinBoard("SLAPSTICK", randomItem([3, 3, 4, 4]), CONFIG.features.freeSpinMultiplier);
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
      events.push(createEvent("free_spins_retriggered", `${result.freeSpinsAward} extra free spins added.`));
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
        result.totalWin > 0
          ? `Free spin paid ${result.totalWin} coins.`
          : "Free spin resolved with no payout.",
      ),
    };
  }

  const reward = activeFeature.rewards[activeFeature.totalSteps - activeFeature.remainingSteps];
  activeFeature.remainingSteps -= 1;
  activeFeature.revealedRewards.push(reward);
  activeFeature.totalBonusWin += reward;
  state.balance += reward;
  state.totalWon += reward;

  const events = [createEvent("bonus_round_progress", `Mystery bonus paid ${reward} coins.`)];
  if (activeFeature.remainingSteps <= 0) {
    state.activeFeature = null;
    events.push(createEvent("bonus_round_completed", "Mystery bonus completed."));
  }

  return {
    sessionId: `frontend-live-session-${state.totalSpins}`,
    state,
    board: currentBoard,
    events,
    uiState: createUiState(state, { totalWin: reward, lineWins: [] }, events, `Mystery bonus paid ${reward} coins.`),
  };
}

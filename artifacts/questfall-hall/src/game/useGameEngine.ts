import { useCallback, useEffect, useRef, useState } from "react";
import type {
  EnemyKind,
  EnemyState,
  GameCommand,
  GameSnapshot,
  PickupState,
  Platform,
  ProjectileState,
  WorldTheme,
  WeaponType,
} from "@/game/types";
import { updateEnemy } from "@/game/enemyAI";

const VIEW_HEIGHT = 720;
const GROUND_Y = 620;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 76;
const GRAVITY = 1_600;
const MOVE_SPEED = 300;
const JUMP_SPEED = 650;
const STORAGE_KEY = "questfall-hall-best-score";

type StageSeed = {
  name: string;
  subtitle: string;
  theme: WorldTheme;
  worldWidth: number;
  ledges: Array<Omit<Platform, "kind"> & { kind: Platform["kind"] }>;
  enemies: Array<{ x: number; kind: EnemyKind }>;
  chests: Array<{
    x: number;
    weapon?: WeaponType;
    value: number;
  }>;
  specialPickups: Array<{
    x: number;
    kind: "potion" | "silver";
    value: number;
  }>;
};

const STAGES: StageSeed[] = [
  {
    name: "The Sunlit Approach",
    subtitle: "A warm-up through the whispering dunes",
    theme: "oasis",
    worldWidth: 3_350,
    ledges: [
      { x: 390, y: 520, width: 210, height: 30, kind: "stone" },
      { x: 860, y: 455, width: 195, height: 30, kind: "wood" },
      { x: 1_280, y: 515, width: 245, height: 30, kind: "stone" },
      { x: 1_830, y: 445, width: 220, height: 30, kind: "wood" },
      { x: 2_360, y: 515, width: 230, height: 30, kind: "stone" },
      { x: 2_830, y: 460, width: 210, height: 30, kind: "wood" },
    ],
    enemies: [
      { x: 620, kind: "scarab" },
      { x: 1_100, kind: "sandling" },
      { x: 1_700, kind: "scarab" },
      { x: 2_220, kind: "sandling" },
      { x: 2_720, kind: "scarab" },
    ],
    chests: [
      { x: 1_420, weapon: "spear", value: 22 },
      { x: 2_790, value: 18 },
    ],
    specialPickups: [{ x: 2_050, kind: "potion", value: 1 }],
  },
  {
    name: "The Caravan Walkways",
    subtitle: "Keep your footing above the market",
    theme: "caravan",
    worldWidth: 3_650,
    ledges: [
      { x: 250, y: 540, width: 245, height: 28, kind: "wood" },
      { x: 650, y: 470, width: 225, height: 28, kind: "wood" },
      { x: 1_040, y: 400, width: 230, height: 28, kind: "wood" },
      { x: 1_430, y: 505, width: 250, height: 28, kind: "stone" },
      { x: 1_850, y: 430, width: 220, height: 28, kind: "wood" },
      { x: 2_250, y: 365, width: 245, height: 28, kind: "wood" },
      { x: 2_700, y: 490, width: 250, height: 28, kind: "stone" },
      { x: 3_100, y: 420, width: 220, height: 28, kind: "wood" },
    ],
    enemies: [
      { x: 540, kind: "bat" },
      { x: 970, kind: "sandling" },
      { x: 1_620, kind: "scarab" },
      { x: 2_050, kind: "bat" },
      { x: 2_670, kind: "sandling" },
      { x: 3_160, kind: "scarab" },
    ],
    chests: [
      { x: 1_190, weapon: "ember-staff", value: 30 },
      { x: 2_960, value: 26 },
    ],
    specialPickups: [
      { x: 1_740, kind: "silver", value: 15 },
      { x: 2_360, kind: "potion", value: 1 },
    ],
  },
  {
    name: "The Sunken Archive",
    subtitle: "Old stone. New trouble.",
    theme: "sun-temple",
    worldWidth: 3_850,
    ledges: [
      { x: 300, y: 500, width: 230, height: 34, kind: "stone" },
      { x: 690, y: 415, width: 250, height: 34, kind: "stone" },
      { x: 1_100, y: 490, width: 205, height: 34, kind: "wood" },
      { x: 1_490, y: 390, width: 260, height: 34, kind: "stone" },
      { x: 1_920, y: 470, width: 250, height: 34, kind: "stone" },
      { x: 2_370, y: 385, width: 220, height: 34, kind: "wood" },
      { x: 2_760, y: 475, width: 265, height: 34, kind: "stone" },
      { x: 3_220, y: 390, width: 230, height: 34, kind: "stone" },
    ],
    enemies: [
      { x: 580, kind: "bat" },
      { x: 960, kind: "sentinel" },
      { x: 1_390, kind: "bat" },
      { x: 1_800, kind: "sentinel" },
      { x: 2_250, kind: "scarab" },
      { x: 2_690, kind: "bat" },
      { x: 3_120, kind: "sentinel" },
      { x: 3_500, kind: "scarab" },
    ],
    chests: [
      { x: 1_600, value: 38 },
      { x: 3_000, value: 32 },
    ],
    specialPickups: [
      { x: 1_060, kind: "silver", value: 25 },
      { x: 2_510, kind: "potion", value: 1 },
    ],
  },
  {
    name: "The Warden's Arena",
    subtitle: "One brave warrior. One very large problem.",
    theme: "arena",
    worldWidth: 2_900,
    ledges: [
      { x: 360, y: 515, width: 250, height: 34, kind: "stone" },
      { x: 810, y: 450, width: 230, height: 34, kind: "stone" },
      { x: 1_260, y: 495, width: 245, height: 34, kind: "wood" },
      { x: 1_720, y: 430, width: 250, height: 34, kind: "stone" },
      { x: 2_180, y: 500, width: 240, height: 34, kind: "stone" },
    ],
    enemies: [
      { x: 620, kind: "sentinel" },
      { x: 1_120, kind: "scarab" },
      { x: 1_620, kind: "bat" },
      { x: 2_060, kind: "sentinel" },
      { x: 2_460, kind: "warden" },
    ],
    chests: [{ x: 1_510, value: 45 }],
    specialPickups: [{ x: 2_220, kind: "potion", value: 1 }],
  },
];

const ENEMY_SIZE: Record<EnemyKind, { width: number; height: number }> = {
  scarab: { width: 58, height: 43 },
  sandling: { width: 48, height: 66 },
  bat: { width: 54, height: 42 },
  sentinel: { width: 55, height: 76 },
  warden: { width: 184, height: 200 },
};

const WEAPON_DAMAGE: Record<WeaponType, number> = {
  blade: 2,
  spear: 2,
  "ember-staff": 1.5,
};

function readBestScore() {
  if (typeof window === "undefined") return 0;
  try {
    return Number(window.localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function storeBestScore(score: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(score));
  } catch {
    // The game remains playable when browser storage is unavailable.
  }
}

function getSurfaceY(platforms: Platform[], x: number) {
  const surfaces = platforms.filter(
    (platform) =>
      x >= platform.x && x <= platform.x + platform.width,
  );
  return surfaces.reduce((highest, platform) => Math.min(highest, platform.y), GROUND_Y);
}

function makeEnemy(
  id: string,
  kind: EnemyKind,
  x: number,
  y: number,
): EnemyState {
  const size = ENEMY_SIZE[kind];
  const boss = kind === "warden";
  const patrolDirection = Number(id.slice(-1)) % 2 === 0 ? 1 : -1;
  const aiState =
    kind === "sandling" || kind === "warden"
      ? "stalk"
      : kind === "bat"
        ? "hover"
        : "patrol";
  return {
    id,
    kind,
    x,
    y: y - size.height,
    width: size.width,
    height: size.height,
    facing: -1,
    vx: boss ? -58 : -72,
    attackCooldown: boss ? 1.2 : 0,
    abilityCooldown:
      kind === "scarab" ? 0.7 : kind === "bat" ? 1.1 : kind === "warden" ? 1.3 : 0.9,
    aiState,
    aiTimer: 0,
    patrolDirection: patrolDirection as -1 | 1,
    attackDirection: -1,
    health: boss ? 28 : kind === "sentinel" ? 4 : 2,
    maxHealth: boss ? 28 : kind === "sentinel" ? 4 : 2,
    hurtFlash: 0,
    boss,
  };
}

function makePickup(
  id: string,
  kind: PickupState["kind"],
  x: number,
  y: number,
  value?: number,
  weapon?: WeaponType,
): PickupState {
  return { id, kind, x, y, value, weapon };
}

function buildScene(
  stageIndex: number,
  mode: GameSnapshot["mode"],
  carry?: Partial<GameSnapshot>,
): GameSnapshot {
  const stage = STAGES[stageIndex];
  const platforms: Platform[] = [
    { x: 0, y: GROUND_Y, width: stage.worldWidth, height: 100, kind: "ground" },
    ...stage.ledges,
  ];
  const enemies = stage.enemies.map(({ x, kind }, index) =>
    makeEnemy(`enemy-${stageIndex}-${index}`, kind, x, getSurfaceY(platforms, x)),
  );
  const pickups: PickupState[] = [];

  stage.chests.forEach((chest, index) => {
    const y = getSurfaceY(platforms, chest.x);
    pickups.push(
      makePickup(
        `chest-${stageIndex}-${index}`,
        "chest",
        chest.x,
        y - 34,
        chest.value,
        chest.weapon,
      ),
    );
  });

  stage.specialPickups.forEach((item, index) => {
    const y = getSurfaceY(platforms, item.x);
    pickups.push(
      makePickup(
        `special-${stageIndex}-${index}`,
        item.kind,
        item.x,
        y - 64,
        item.value,
      ),
    );
  });

  for (let x = 250, index = 0; x < stage.worldWidth - 260; x += 150, index += 1) {
    const surfaceY = getSurfaceY(platforms, x);
    const hover = index % 3 === 1 ? 82 : 48;
    pickups.push(
      makePickup(`coin-${stageIndex}-${index}`, "coin", x, surfaceY - hover),
    );
  }

  const boss = enemies.find((enemy) => enemy.boss);
  const playerHealth = carry?.player?.health ?? 6;
  const playerMaxHealth = carry?.player?.maxHealth ?? 6;
  const playerX = 120;
  const maxScore = carry?.score ?? 0;
  const bestScore = Math.max(carry?.bestScore ?? 0, maxScore, readBestScore());

  return {
    mode,
    level: {
      number: stageIndex + 1,
      name: stage.name,
      subtitle: stage.subtitle,
      theme: stage.theme,
    },
    score: maxScore,
    bestScore,
    gold: carry?.gold ?? 0,
    silver: carry?.silver ?? 0,
    qft: carry?.qft ?? 0,
    lives: carry?.lives ?? 3,
    player: {
      x: playerX,
      y: GROUND_Y - PLAYER_HEIGHT,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      facing: 1,
      vx: 0,
      vy: 0,
      health: playerHealth,
      maxHealth: playerMaxHealth,
      grounded: true,
      weapon: carry?.player?.weapon ?? "blade",
      magic: carry?.player?.magic ?? 100,
      maxMagic: 100,
      attackFlash: 0,
      attackStyle: null,
      hurtFlash: 0,
    },
    platforms,
    enemies,
    pickups,
    projectiles: [],
    cameraX: 0,
    worldWidth: stage.worldWidth,
    message: stageIndex === 3 && boss ? "Find the Warden and claim its hoard." : "",
  };
}

function createInitialSnapshot() {
  return buildScene(0, "title");
}

function damageEnemies(
  snapshot: GameSnapshot,
  range: number,
  damage: number,
): GameSnapshot {
  const { player } = snapshot;
  const reach = player.weapon === "spear" ? range * 1.45 : range;
  const playerCenter = player.x + player.width / 2;
  let shieldBlocked = false;
  const enemies = snapshot.enemies.map((enemy) => {
    const enemyCenter = enemy.x + enemy.width / 2;
    const inFront = (enemyCenter - playerCenter) * player.facing >= -8;
    const inRange = Math.abs(enemyCenter - playerCenter) <= reach;
    const aligned =
      Math.abs(enemy.y + enemy.height / 2 - (player.y + player.height / 2)) <
      (enemy.boss ? 180 : 105);
    if (!inFront || !inRange || !aligned) return enemy;
    if (
      enemy.kind === "sentinel" &&
      enemy.aiState === "guard" &&
      enemy.facing === (playerCenter < enemyCenter ? -1 : 1)
    ) {
      shieldBlocked = true;
      return { ...enemy, hurtFlash: 0.12 };
    }
    return {
      ...enemy,
      health: enemy.health - damage,
      hurtFlash: 0.18,
      vx: player.facing * (enemy.boss ? 28 : 110),
    };
  });

  return settleEnemyHits(
    {
      ...snapshot,
      message: shieldBlocked ? "The Sentinel turns its shield into your strike." : snapshot.message,
      player: {
        ...player,
        attackFlash: 0.2,
        attackStyle:
          player.weapon === "spear"
            ? "spear"
            : player.weapon === "ember-staff"
              ? "staff"
              : "blade",
      },
    },
    enemies,
  );
}

function settleEnemyHits(
  snapshot: GameSnapshot,
  enemies: EnemyState[],
): GameSnapshot {
  const defeated = enemies.filter((enemy) => enemy.health <= 0);
  const survivors = enemies.filter((enemy) => enemy.health > 0);
  const pickups = [...snapshot.pickups];
  let message = snapshot.message;
  let score = snapshot.score;

  for (const enemy of defeated) {
    score += enemy.boss ? 5_000 : 250;
    if (!enemy.boss) continue;
    pickups.push(
      makePickup(
        `warden-hoard-${snapshot.level.number}`,
        "chest",
        enemy.x + enemy.width / 2,
        GROUND_Y - 34,
        100,
      ),
      makePickup("warden-silver", "silver", enemy.x + enemy.width / 2, GROUND_Y - 54, 250),
      makePickup("warden-qft", "qft", enemy.x + enemy.width / 2, GROUND_Y - 74, 1),
    );
    message = "THE WARDEN FALLS! Its great hoard is yours.";
  }

  return {
    ...snapshot,
    enemies: survivors,
    pickups,
    score,
    message,
  };
}

function collectPickups(snapshot: GameSnapshot): GameSnapshot {
  const playerCenter = snapshot.player.x + snapshot.player.width / 2;
  const playerBottom = snapshot.player.y + snapshot.player.height;
  const remaining: PickupState[] = [];
  let score = snapshot.score;
  let gold = snapshot.gold;
  let silver = snapshot.silver;
  let qft = snapshot.qft;
  let health = snapshot.player.health;
  let magic = snapshot.player.magic;
  let weapon = snapshot.player.weapon;
  let message = snapshot.message;
  let gotBossChest = false;

  for (const pickup of snapshot.pickups) {
    const closeEnough =
      Math.abs(pickup.x - playerCenter) < 46 &&
      Math.abs(pickup.y + 20 - playerBottom) < 128;
    if (!closeEnough) {
      remaining.push(pickup);
      continue;
    }

    switch (pickup.kind) {
      case "coin":
        gold += 1;
        score += 100;
        break;
      case "gold":
        gold += pickup.value ?? 5;
        score += 200;
        break;
      case "silver":
        silver += pickup.value ?? 10;
        score += 250;
        break;
      case "qft":
        qft += pickup.value ?? 1;
        score += 1_000;
        message = "A QFT token! A rare prize from the Hall.";
        break;
      case "chest":
        gold += pickup.value ?? 10;
        score += 500;
        if (pickup.weapon) weapon = pickup.weapon;
        if (pickup.id.startsWith("warden-hoard")) {
          gotBossChest = true;
          silver += 100;
          message = "WARDEN'S HOARD: 100 Gold, bonus Silver, and a QFT token!";
        } else if (pickup.weapon === "spear") {
          message = "Spear found! Your strikes now reach farther.";
        } else if (pickup.weapon === "ember-staff") {
          message = "Ember staff found! Your fire magic is ready.";
        } else {
          message = `Chest opened! ${pickup.value ?? 10} Gold inside.`;
        }
        break;
      case "potion":
        health = Math.min(snapshot.player.maxHealth, health + 2);
        magic = Math.min(snapshot.player.maxMagic, magic + 35);
        score += 150;
        message = "Oasis potion: health and magic restored.";
        break;
    }
  }

  const bossAlive = snapshot.enemies.some((enemy) => enemy.boss);
  const won = snapshot.level.number === 4 && gotBossChest && !bossAlive;
  return {
    ...snapshot,
    score,
    bestScore: Math.max(snapshot.bestScore, score),
    gold,
    silver,
    qft,
    pickups: remaining,
    message,
    mode: won ? "victory" : snapshot.mode,
    player: { ...snapshot.player, health, magic, weapon },
  };
}

function resolvePlayerPlatforms(
  x: number,
  oldY: number,
  y: number,
  vy: number,
  width: number,
  height: number,
  platforms: Platform[],
) {
  if (vy < 0) return { y, vy, grounded: false };
  const oldBottom = oldY + height;
  const bottom = y + height;
  const landing = platforms
    .filter(
      (platform) =>
        x + width > platform.x &&
        x < platform.x + platform.width &&
        oldBottom <= platform.y + 10 &&
        bottom >= platform.y,
    )
    .sort((a, b) => a.y - b.y)[0];
  if (landing) return { y: landing.y - height, vy: 0, grounded: true };
  return { y, vy, grounded: false };
}

function tick(snapshot: GameSnapshot, dt: number, direction: number): GameSnapshot {
  if (snapshot.mode !== "playing") return snapshot;

  let { player } = snapshot;
  const oldY = player.y;
  let vx = direction * MOVE_SPEED;
  let vy = player.grounded ? 0 : Math.min(1_100, player.vy + GRAVITY * dt);
  let x = Math.max(0, Math.min(snapshot.worldWidth - player.width, player.x + vx * dt));
  let y = player.y + vy * dt;
  const resolved = resolvePlayerPlatforms(
    x,
    oldY,
    y,
    vy,
    player.width,
    player.height,
    snapshot.platforms,
  );
  y = resolved.y;
  vy = resolved.vy;
  const grounded = resolved.grounded;
  player = {
    ...player,
    x,
    y,
    vx,
    vy,
    grounded,
    magic: Math.min(player.maxMagic, player.magic + dt * 2.8),
    facing: direction ? (direction < 0 ? -1 : 1) : player.facing,
    hurtFlash: Math.max(0, player.hurtFlash - dt),
    attackFlash: Math.max(0, player.attackFlash - dt),
    attackStyle: player.attackFlash > dt ? player.attackStyle : null,
  };

  const enemyProjectiles: ProjectileState[] = [];
  let enemies = snapshot.enemies.map((sourceEnemy) => {
    const update = updateEnemy(
      sourceEnemy,
      player,
      dt,
      snapshot.platforms,
      snapshot.worldWidth,
    );
    enemyProjectiles.push(...update.projectiles);
    return update.enemy;
  });
  let projectiles = [
    ...snapshot.projectiles.map((projectile) => ({
      ...projectile,
      x: projectile.x + projectile.vx * dt,
      y: projectile.y + projectile.vy * dt,
    })),
    ...enemyProjectiles,
  ];
  let message = snapshot.message;

  const hitIds = new Set<string>();
  const hitDamage = new Map<string, number>();
  projectiles = projectiles.filter((projectile) => {
    if (
      projectile.x < snapshot.cameraX - 120 ||
      projectile.x > snapshot.cameraX + 1_400 ||
      projectile.y < -40 ||
      projectile.y > VIEW_HEIGHT + 80
    ) {
      return false;
    }
    if (projectile.owner === "player") {
      const target = enemies.find(
        (enemy) =>
          projectile.x + projectile.radius > enemy.x &&
          projectile.x - projectile.radius < enemy.x + enemy.width &&
          projectile.y + projectile.radius > enemy.y &&
          projectile.y - projectile.radius < enemy.y + enemy.height,
      );
      if (target) {
        hitIds.add(target.id);
        hitDamage.set(
          target.id,
          (hitDamage.get(target.id) ?? 0) + projectile.damage,
        );
        return false;
      }
    } else if (
      player.hurtFlash <= 0 &&
      projectile.x + projectile.radius > player.x &&
      projectile.x - projectile.radius < player.x + player.width &&
      projectile.y + projectile.radius > player.y &&
      projectile.y - projectile.radius < player.y + player.height
    ) {
      player = {
        ...player,
        health: player.health - projectile.damage,
        hurtFlash: 1,
      };
      message =
        projectile.kind === "sonic-wave"
          ? "The bat's sonic screech catches you!"
          : projectile.kind === "blade-wave"
            ? "A blade of sand cuts across your path!"
            : projectile.kind === "arc-bolt"
              ? "The Sandling's charged bolt catches you!"
              : "The Warden's sand shot caught you!";
      return false;
    }
    return true;
  });

  let pickups = snapshot.pickups;
  let score = snapshot.score;
  if (hitIds.size) {
    const damagedEnemies = enemies.map((enemy) =>
      hitIds.has(enemy.id)
        ? {
            ...enemy,
              health: enemy.health - (hitDamage.get(enemy.id) ?? 0),
              hurtFlash: 0.2,
          }
        : enemy,
    );
    const hitsSettled = settleEnemyHits(
      { ...snapshot, player, enemies, pickups, score, message },
      damagedEnemies,
    );
    enemies = hitsSettled.enemies;
    pickups = hitsSettled.pickups;
    score = hitsSettled.score;
    message = hitsSettled.message;
  }

  const playerContact = enemies.find(
    (enemy) =>
      player.hurtFlash <= 0 &&
      player.x + player.width > enemy.x + 8 &&
      player.x < enemy.x + enemy.width - 8 &&
      player.y + player.height > enemy.y + 12 &&
      player.y < enemy.y + enemy.height,
  );
  if (playerContact) {
    player = {
      ...player,
      health: player.health - (playerContact.boss ? 2 : 1),
      hurtFlash: 0.95,
    };
    message = playerContact.boss
      ? "Keep moving! The Warden hits hard up close."
      : "Ouch! A little space should help.";
  }

  let next: GameSnapshot = {
    ...snapshot,
    player,
    enemies,
    projectiles,
    pickups,
    score,
    message,
    cameraX: Math.max(
      0,
      Math.min(snapshot.worldWidth - 1_280, player.x + player.width / 2 - 640),
    ),
  };

  if (player.health <= 0) {
    const lives = next.lives - 1;
    if (lives <= 0) {
      next = { ...next, mode: "game-over", lives: 0 };
    } else {
      next = {
        ...next,
        lives,
        player: {
          ...next.player,
          x: Math.max(80, next.cameraX + 220),
          y: GROUND_Y - PLAYER_HEIGHT,
          vx: 0,
          vy: 0,
          health: next.player.maxHealth,
          magic: Math.max(next.player.magic, 60),
          hurtFlash: 1.2,
          grounded: true,
        },
        message: "Catch your breath. The adventure continues!",
      };
    }
    return next;
  }

  next = collectPickups(next);
  const bossAlive = next.enemies.some((enemy) => enemy.boss);
  const nearExit = next.player.x >= next.worldWidth - 170;
  if (nearExit && next.level.number < 4) {
    return {
      ...next,
      mode: "stage-clear",
      message: "Stage clear! Onward through the Hall.",
    };
  }
  return next;
}

export function useGameEngine() {
  const [snapshot, setSnapshot] = useState(createInitialSnapshot);
  const snapshotRef = useRef(snapshot);
  const directionRef = useRef(0);
  const clockRef = useRef(0);
  const attackCooldownRef = useRef(0);
  const castCooldownRef = useRef(0);

  const commit = useCallback((next: GameSnapshot) => {
    snapshotRef.current = next;
    if (next.score > next.bestScore) {
      next.bestScore = next.score;
    }
    if (next.bestScore > 0) storeBestScore(next.bestScore);
    setSnapshot(next);
  }, []);

  const command = useCallback(
    (action: GameCommand) => {
      const current = snapshotRef.current;
      if (action === "restart") {
        attackCooldownRef.current = 0;
        castCooldownRef.current = 0;
        commit(buildScene(0, "playing"));
        return;
      }
      if (action === "start") {
        if (current.mode === "title") commit({ ...current, mode: "playing" });
        return;
      }
      if (action === "pause") {
        if (current.mode === "playing") commit({ ...current, mode: "paused" });
        else if (current.mode === "paused") commit({ ...current, mode: "playing" });
        return;
      }
      if (action === "continue") {
        if (current.mode === "paused") commit({ ...current, mode: "playing" });
        else if (current.mode === "stage-clear") {
          const nextIndex = current.level.number;
          if (nextIndex < STAGES.length) {
            commit(buildScene(nextIndex, "playing", current));
          }
        } else if (current.mode === "game-over" || current.mode === "victory") {
          commit(buildScene(0, "playing"));
        }
        return;
      }
      if (current.mode !== "playing") return;
      if (action === "jump" && current.player.grounded) {
        commit({
          ...current,
          player: { ...current.player, grounded: false, vy: -JUMP_SPEED },
        });
      } else if (action === "attack" && attackCooldownRef.current <= 0) {
        attackCooldownRef.current = 0.32;
        const reach = current.player.weapon === "spear" ? 150 : 106;
        commit(damageEnemies(current, reach, WEAPON_DAMAGE[current.player.weapon]));
      } else if (action === "cast" && castCooldownRef.current <= 0) {
        if (current.player.magic < 24) {
          commit({ ...current, message: "Not enough magic. Find a potion!" });
          return;
        }
        castCooldownRef.current = 0.48;
        const direction = current.player.facing;
        const projectile: ProjectileState = {
          id: `fireball-${Date.now()}`,
          owner: "player",
          kind: "fireball",
          x: current.player.x + (direction > 0 ? current.player.width : 0),
          y: current.player.y + 34,
          vx: direction * 600,
          vy: -28,
          radius: 18,
          damage: current.player.weapon === "ember-staff" ? 2 : 1.5,
        };
        commit({
          ...current,
          projectiles: [...current.projectiles, projectile],
          player: {
            ...current.player,
            magic: current.player.magic - 24,
            attackFlash: 0.2,
            attackStyle: "cast",
          },
          message: "Fireball away!",
        });
      }
    },
    [commit],
  );

  const move = useCallback((direction: -1 | 0 | 1) => {
    directionRef.current = direction;
  }, []);

  useEffect(() => {
    let previous = performance.now();
    let accumulated = 0;
    let frame = 0;
    const update = (now: number) => {
      const elapsed = Math.min((now - previous) / 1_000, 0.05);
      previous = now;
      accumulated += elapsed;
      if (accumulated >= 1 / 30) {
        const dt = Math.min(accumulated, 0.05);
        accumulated = 0;
        clockRef.current += dt;
        attackCooldownRef.current = Math.max(0, attackCooldownRef.current - dt);
        castCooldownRef.current = Math.max(0, castCooldownRef.current - dt);
        const current = snapshotRef.current;
        if (current.mode === "playing") {
          const next = tick(current, dt, directionRef.current);
          commit(next);
        }
      }
      frame = window.requestAnimationFrame(update);
    };
    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, [commit]);

  useEffect(() => {
    const keys = new Set<string>();
    const syncDirection = () => {
      const left = keys.has("arrowleft") || keys.has("a");
      const right = keys.has("arrowright") || keys.has("d");
      directionRef.current = Number(right) - Number(left);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (
        ["arrowleft", "arrowright", "arrowup", " ", "escape"].includes(key)
      ) {
        event.preventDefault();
      }
      keys.add(key);
      syncDirection();
      if (event.repeat) return;
      if (key === " " || key === "arrowup" || key === "w") command("jump");
      else if (key === "j" || key === "z") command("attack");
      else if (key === "k" || key === "x") command("cast");
      else if (key === "escape" || key === "p") command("pause");
      else if (key === "enter") {
        const mode = snapshotRef.current.mode;
        if (mode === "title") command("start");
        else if (mode !== "playing") command("continue");
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.key.toLowerCase());
      syncDirection();
    };
    const onBlur = () => {
      keys.clear();
      directionRef.current = 0;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [command]);

  return { snapshot, onCommand: command, onMove: move };
}
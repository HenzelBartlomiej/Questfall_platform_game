export type GameMode =
  | "title"
  | "playing"
  | "paused"
  | "stage-clear"
  | "victory"
  | "game-over";

export type WeaponType = "blade" | "spear" | "ember-staff";

export type EnemyKind = "scarab" | "sandling" | "bat" | "sentinel" | "warden";

export type EnemyAIState =
  | "patrol"
  | "stalk"
  | "guard"
  | "windup"
  | "charge"
  | "cast"
  | "hover"
  | "swoop"
  | "recover";

export type WorldTheme = "oasis" | "caravan" | "sun-temple" | "arena";

export type Platform = {
  x: number;
  y: number;
  width: number;
  height: number;
  kind: "ground" | "stone" | "wood" | "ledge";
};

export type PlayerState = {
  x: number;
  y: number;
  width: number;
  height: number;
  facing: -1 | 1;
  vx: number;
  vy: number;
  health: number;
  maxHealth: number;
  grounded: boolean;
  weapon: WeaponType;
  magic: number;
  maxMagic: number;
  attackFlash: number;
  attackStyle: "blade" | "spear" | "staff" | "cast" | null;
  hurtFlash: number;
};

export type EnemyState = {
  id: string;
  kind: EnemyKind;
  x: number;
  y: number;
  width: number;
  height: number;
  facing: -1 | 1;
  vx: number;
  attackCooldown: number;
  abilityCooldown: number;
  aiState: EnemyAIState;
  aiTimer: number;
  patrolDirection: -1 | 1;
  attackDirection: -1 | 1;
  health: number;
  maxHealth: number;
  hurtFlash: number;
  boss?: boolean;
};

export type PickupState = {
  id: string;
  kind: "coin" | "gold" | "silver" | "qft" | "chest" | "weapon" | "potion";
  x: number;
  y: number;
  value?: number;
  weapon?: WeaponType;
  opened?: boolean;
};

export type ProjectileState = {
  id: string;
  owner: "player" | "enemy";
  kind: "fireball" | "sand-shot" | "arc-bolt" | "sonic-wave" | "blade-wave";
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
};

export type GameSnapshot = {
  mode: GameMode;
  level: {
    number: number;
    name: string;
    subtitle: string;
    theme: WorldTheme;
  };
  score: number;
  bestScore: number;
  gold: number;
  silver: number;
  qft: number;
  lives: number;
  player: PlayerState;
  platforms: Platform[];
  enemies: EnemyState[];
  pickups: PickupState[];
  projectiles: ProjectileState[];
  cameraX: number;
  worldWidth: number;
  message: string;
};

export type GameCommand =
  | "jump"
  | "attack"
  | "cast"
  | "pause"
  | "start"
  | "continue"
  | "restart";
import type {
  EnemyAIState,
  EnemyState,
  Platform,
  PlayerState,
  ProjectileState,
} from "@/game/types";

let projectileSequence = 0;

type EnemyUpdate = {
  enemy: EnemyState;
  projectiles: ProjectileState[];
};

function sign(value: number, fallback: -1 | 1): -1 | 1 {
  return value === 0 ? fallback : value < 0 ? -1 : 1;
}

function projectileFromEnemy(
  enemy: EnemyState,
  player: PlayerState,
  kind: ProjectileState["kind"],
  speed: number,
  radius: number,
  damage: number,
  spread = 0,
): ProjectileState {
  const direction = enemy.attackDirection;
  const x = enemy.x + enemy.width / 2 + direction * enemy.width * 0.24;
  const y = enemy.y + enemy.height * 0.38;
  const targetX = player.x + player.width / 2;
  const targetY = player.y + player.height * 0.48;
  const aim = Math.atan2(targetY - y, targetX - x) + spread;

  return {
    id: `${enemy.id}-${kind}-${++projectileSequence}`,
    owner: "enemy",
    kind,
    x,
    y,
    vx: Math.cos(aim) * speed,
    vy: Math.sin(aim) * speed,
    radius,
    damage,
  };
}

function moveOnPlatforms(
  enemy: EnemyState,
  nextX: number,
  vx: number,
  dt: number,
  platforms: Platform[],
) {
  const nextY = enemy.y + 820 * dt;
  const oldBottom = enemy.y + enemy.height;
  const nextBottom = nextY + enemy.height;
  const landing = platforms
    .filter(
      (platform) =>
        nextX + enemy.width > platform.x &&
        nextX < platform.x + platform.width &&
        oldBottom <= platform.y + 10 &&
        nextBottom >= platform.y,
    )
    .sort((a, b) => a.y - b.y)[0];

  return {
    x: nextX,
    y: landing ? landing.y - enemy.height : nextY,
    vx,
  };
}

function moveHoveringEnemy(
  enemy: EnemyState,
  player: PlayerState,
  dt: number,
  worldWidth: number,
  dive = false,
) {
  const playerCenter = player.x + player.width / 2;
  const enemyCenter = enemy.x + enemy.width / 2;
  const orbit = enemy.patrolDirection;
  const targetX = dive
    ? playerCenter + enemy.attackDirection * 18
    : playerCenter + orbit * 100;
  const targetY = dive
    ? player.y + player.height * 0.52
    : Math.max(90, player.y - 58);
  const vx = Math.max(-210, Math.min(210, (targetX - enemyCenter) * (dive ? 2.2 : 1.05)));
  const vy = Math.max(
    -225,
    Math.min(225, (targetY - (enemy.y + enemy.height / 2)) * (dive ? 2.1 : 1.5)),
  );

  return {
    x: Math.max(0, Math.min(worldWidth - enemy.width, enemy.x + vx * dt)),
    y: Math.max(74, Math.min(520, enemy.y + vy * dt)),
    vx,
  };
}

function transition(state: EnemyAIState, seconds: number) {
  return { aiState: state, aiTimer: seconds };
}

export function updateEnemy(
  source: EnemyState,
  player: PlayerState,
  dt: number,
  platforms: Platform[],
  worldWidth: number,
): EnemyUpdate {
  const playerCenter = player.x + player.width / 2;
  const enemyCenter = source.x + source.width / 2;
  const delta = playerCenter - enemyCenter;
  const distance = Math.abs(delta);
  const direction = sign(delta, source.facing);
  let enemy: EnemyState = {
    ...source,
    facing: direction,
    hurtFlash: Math.max(0, source.hurtFlash - dt),
    attackCooldown: Math.max(0, source.attackCooldown - dt),
    abilityCooldown: Math.max(0, source.abilityCooldown - dt),
    aiTimer: Math.max(0, source.aiTimer - dt),
  };
  let projectiles: ProjectileState[] = [];
  let vx = 0;

  switch (enemy.kind) {
    case "scarab": {
      if (enemy.aiState === "patrol") {
        if (distance > 96 && distance < 430 && enemy.abilityCooldown <= 0) {
          enemy = {
            ...enemy,
            attackDirection: direction,
            ...transition("windup", 0.52),
          };
        } else {
          if (distance > 620) enemy = { ...enemy, patrolDirection: direction };
          vx = distance < 115 ? -direction * 42 : enemy.patrolDirection * 50;
        }
      } else if (enemy.aiState === "windup") {
        if (enemy.aiTimer <= 0) {
          enemy = {
            ...enemy,
            ...transition("charge", 0.6),
            abilityCooldown: 2.65,
          };
        }
      } else if (enemy.aiState === "charge") {
        vx = enemy.attackDirection * 300;
        if (enemy.aiTimer <= 0) enemy = { ...enemy, ...transition("recover", 0.9) };
      } else if (enemy.aiState === "recover" && enemy.aiTimer <= 0) {
        enemy = { ...enemy, ...transition("patrol", 0) };
      }
      break;
    }

    case "sandling": {
      if (enemy.aiState === "stalk") {
        if (distance > 165 && distance < 535 && enemy.abilityCooldown <= 0) {
          enemy = { ...enemy, attackDirection: direction, ...transition("cast", 0.56) };
        } else if (distance < 175) {
          vx = -direction * 82;
        } else if (distance > 380) {
          vx = direction * 64;
        } else {
          vx = enemy.patrolDirection * 18;
        }
      } else if (enemy.aiState === "cast") {
        if (enemy.aiTimer <= 0) {
          projectiles.push(
            projectileFromEnemy(enemy, player, "arc-bolt", 320, 13, 1),
          );
          enemy = {
            ...enemy,
            ...transition("recover", 0.3),
            abilityCooldown: 2.05,
          };
        }
      } else if (enemy.aiState === "recover" && enemy.aiTimer <= 0) {
        enemy = { ...enemy, ...transition("stalk", 0) };
      }
      break;
    }

    case "bat": {
      if (enemy.aiState === "hover" && distance < 390 && enemy.abilityCooldown <= 0) {
        enemy = {
          ...enemy,
          attackDirection: direction,
          ...transition("cast", 0.42),
        };
      } else if (enemy.aiState === "cast" && enemy.aiTimer <= 0) {
        projectiles.push(
          projectileFromEnemy(enemy, player, "sonic-wave", 290, 15, 1),
        );
        enemy = {
          ...enemy,
          ...transition("swoop", 0.56),
          abilityCooldown: 2.3,
        };
      } else if (enemy.aiState === "swoop" && enemy.aiTimer <= 0) {
        enemy = { ...enemy, ...transition("hover", 0) };
      }
      const movement = moveHoveringEnemy(
        enemy,
        player,
        dt,
        worldWidth,
        enemy.aiState === "swoop",
      );
      return {
        enemy: {
          ...enemy,
          ...movement,
          facing: direction,
        },
        projectiles,
      };
    }

    case "sentinel": {
      if (enemy.aiState === "patrol") {
        if (distance < 295 && enemy.abilityCooldown <= 0) {
          enemy = {
            ...enemy,
            attackDirection: direction,
            ...transition("windup", 0.48),
          };
        } else if (distance > 132) {
          vx = direction * Math.min(62, distance * 0.32);
        }
      } else if (enemy.aiState === "windup" && enemy.aiTimer <= 0) {
        enemy = {
          ...enemy,
          ...transition("charge", 0.42),
          abilityCooldown: 2.6,
        };
      } else if (enemy.aiState === "charge") {
        vx = enemy.attackDirection * 268;
        if (enemy.aiTimer <= 0) {
          projectiles.push(
            projectileFromEnemy(enemy, player, "blade-wave", 330, 17, 1),
          );
          enemy = { ...enemy, ...transition("recover", 0.72) };
        }
      } else if (enemy.aiState === "recover" && enemy.aiTimer <= 0) {
        enemy = { ...enemy, ...transition("guard", 0.72) };
      } else if (enemy.aiState === "guard") {
        if (enemy.aiTimer <= 0) enemy = { ...enemy, ...transition("patrol", 0) };
        else if (distance > 240) vx = direction * 24;
      }
      break;
    }

    case "warden": {
      const enraged = enemy.health <= enemy.maxHealth * 0.5;
      if (enemy.aiState === "stalk") {
        if (distance < 188 && enemy.abilityCooldown <= 0) {
          enemy = {
            ...enemy,
            attackDirection: direction,
            ...transition("windup", enraged ? 0.38 : 0.52),
          };
        } else if (distance > 168 && distance < 640 && enemy.abilityCooldown <= 0) {
          enemy = {
            ...enemy,
            attackDirection: direction,
            ...transition("cast", enraged ? 0.38 : 0.58),
          };
        } else if (distance > 260) {
          vx = direction * (enraged ? 76 : 52);
        }
      } else if (enemy.aiState === "cast" && enemy.aiTimer <= 0) {
        const spread = enraged ? 0.19 : 0.14;
        for (const angle of [-spread, 0, spread]) {
          projectiles.push(
            projectileFromEnemy(enemy, player, "sand-shot", enraged ? 310 : 265, 16, 1, angle),
          );
        }
        enemy = {
          ...enemy,
          ...transition("recover", 0.54),
          abilityCooldown: enraged ? 1.8 : 2.5,
        };
      } else if (enemy.aiState === "windup" && enemy.aiTimer <= 0) {
        enemy = {
          ...enemy,
          ...transition("charge", 0.5),
          abilityCooldown: enraged ? 2.15 : 3.0,
        };
      } else if (enemy.aiState === "charge") {
        vx = enemy.attackDirection * (enraged ? 350 : 290);
        if (enemy.aiTimer <= 0) {
          projectiles.push(
            projectileFromEnemy(enemy, player, "blade-wave", 360, 22, 2),
          );
          enemy = { ...enemy, ...transition("recover", 0.88) };
        }
      } else if (enemy.aiState === "recover" && enemy.aiTimer <= 0) {
        enemy = { ...enemy, ...transition("stalk", 0) };
      }
      break;
    }
  }

  const nextX = Math.max(
    0,
    Math.min(worldWidth - enemy.width, enemy.x + vx * dt),
  );
  const movement = moveOnPlatforms(enemy, nextX, vx, dt, platforms);

  return {
    enemy: { ...enemy, ...movement },
    projectiles,
  };
}
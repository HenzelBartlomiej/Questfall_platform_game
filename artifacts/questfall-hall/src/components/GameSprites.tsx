import type { EnemyState, PlayerState } from "@/game/types";

const ART_BASE = `${import.meta.env.BASE_URL}art/`;

type HeroSpriteProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  facing: -1 | 1;
  hurt: number;
  attackStyle: PlayerState["attackStyle"];
  weapon: PlayerState["weapon"];
  moving: boolean;
  grounded: boolean;
};

export function HeroSprite({
  x,
  y,
  width,
  height,
  facing,
  hurt,
  attackStyle,
  weapon,
  moving,
  grounded,
}: HeroSpriteProps) {
  const pose = !grounded ? "jump" : moving ? "run" : "idle";
  const actionClass = attackStyle ? `qf-hero-action--${attackStyle}` : "";
  const weaponStyle =
    weapon === "spear" ? "spear" : weapon === "ember-staff" ? "staff" : "blade";

  return (
    <g transform={`translate(${x + width / 2} ${y + height})`}>
      <ellipse cx="0" cy="3" rx="25" ry="5" fill="#201720" opacity=".56" />
      <g transform={facing < 0 ? "scale(-1 1)" : undefined}>
        {moving && grounded && (
          <g className="qf-hero-dust" pointerEvents="none">
            <path d="M-18 -2h-13m7 6h-11" stroke="#ffe1a1" strokeWidth="1.7" strokeLinecap="round" />
            <circle className="qf-hero-dust-puff" cx="-27" cy="0" r="4" />
            <circle className="qf-hero-dust-puff qf-hero-dust-puff--late" cx="-38" cy="2" r="2.8" />
          </g>
        )}
        <g
          className={`qf-hero-rig qf-hero-rig--${pose} ${actionClass} ${hurt > 0 ? "qf-hero-rig--hurt" : ""}`}
          aria-hidden="true"
        >
          <path
            className="qf-hero-cape"
            d="M-12 -72Q-27 -69 -30 -53L-36 -24Q-24 -29 -11 -18L-5 -44Z"
            fill="#285574"
            stroke="#172a3c"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M-26 -48Q-19 -44 -16 -31" fill="none" stroke="#6eb2b5" strokeWidth="2" opacity=".9" />
          <path className="qf-hero-sash" d="M-15 -54Q-34 -50 -42 -43L-34 -37Q-25 -43 -12 -42Z" fill="#dc7345" stroke="#613c3a" strokeWidth="2" />

          <g transform="translate(-8 -39)">
            <g className="qf-hero-limb qf-hero-leg--back">
              <path d="M0 0Q-10 6 -17 17L-23 31L-13 36L-2 27Q7 17 8 7Z" fill="#e8d3aa" stroke="#302938" strokeWidth="2.6" strokeLinejoin="round" />
              <path d="M-22 29Q-28 34 -27 40L-7 40L-4 35L-13 32Z" fill="#563a33" stroke="#211f29" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M-24 36h14" stroke="#c28a58" strokeWidth="2" />
            </g>
          </g>
          <g transform="translate(5 -39)">
            <g className="qf-hero-limb qf-hero-leg--front">
              <path d="M0 0Q10 7 11 17L15 30L22 34L18 40L0 39L-5 34L-8 13Z" fill="#f1dfbd" stroke="#302938" strokeWidth="2.8" strokeLinejoin="round" />
              <path d="M13 31Q21 30 26 37L25 42L4 42L0 38Z" fill="#684339" stroke="#211f29" strokeWidth="2.6" strokeLinejoin="round" />
              <path d="M7 36h14" stroke="#d39b5c" strokeWidth="2.2" />
            </g>
          </g>

          <g className="qf-hero-torso">
            <path d="M-14 -73Q-20 -68 -19 -57L-15 -39Q0 -32 16 -39L18 -58Q17 -70 10 -74Z" fill="#d0a05e" stroke="#302938" strokeWidth="3" strokeLinejoin="round" />
            <path d="M-13 -65Q-3 -60 14 -66L17 -55Q3 -47 -15 -54Z" fill="#ecce8e" stroke="#805a43" strokeWidth="2" />
            <path d="M-11 -48Q0 -43 14 -49L12 -37Q0 -33 -14 -38Z" fill="#31716f" stroke="#263344" strokeWidth="2.3" />
            <path d="M-13 -58L-7 -54L-13 -49M12 -58L7 -54L13 -49" fill="none" stroke="#f8ddaa" strokeWidth="1.7" />
            <path d="M-8 -39L-6 -34L-12 -31M8 -39L6 -34L12 -31" fill="none" stroke="#302938" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M-16 -42L17 -42" stroke="#db9854" strokeWidth="3" />
            <path d="M-2 -43L0 -33L5 -43" fill="#f3c46b" stroke="#664638" strokeWidth="1.7" />
          </g>

          <g transform="translate(-13 -68)">
            <g className="qf-hero-limb qf-hero-arm--back">
              <path d="M1 0Q-8 3 -11 11L-13 18L-7 23L0 17L7 8Z" fill="#c58f54" stroke="#302938" strokeWidth="2.6" strokeLinejoin="round" />
              <path d="M-13 17L-8 24L-3 20L-7 14Z" fill="#d9b37b" stroke="#302938" strokeWidth="2" />
            </g>
          </g>
          <g transform="translate(12 -67)">
            <g className="qf-hero-limb qf-hero-arm--front">
              <path d="M0 0Q10 1 14 9L20 18L14 24L7 19L1 11Z" fill="#e0b76f" stroke="#302938" strokeWidth="2.8" strokeLinejoin="round" />
              <path d="M15 17Q22 16 23 22L19 27L13 23Z" fill="#dcb47d" stroke="#302938" strokeWidth="2" />
              <path d="M2 4L13 10" stroke="#fff0c4" strokeWidth="1.8" opacity=".8" />
            </g>
          </g>

          <g className="qf-hero-head">
            <path d="M-11 -78Q-14 -91 -8 -98Q0 -105 10 -98Q15 -92 12 -79L9 -71L-7 -71Z" fill="#d4a46d" stroke="#302938" strokeWidth="2.8" />
            <path d="M-12 -91Q-5 -104 9 -98L17 -92Q8 -88 -4 -89L-12 -84Z" fill="#285d70" stroke="#172f41" strokeWidth="2.8" strokeLinejoin="round" />
            <path d="M-8 -94Q1 -99 11 -94" fill="none" stroke="#74b8b0" strokeWidth="2" />
            <path d="M7 -96L11 -91L7 -88L3 -91Z" fill="#e8bd64" stroke="#805b3e" strokeWidth="1.4" />
            <path d="M-7 -83L-1 -84M5 -84L9 -83" stroke="#3b2d32" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M-1 -81L-3 -77L2 -77" fill="none" stroke="#85553f" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M-4 -73Q1 -70 6 -73" fill="none" stroke="#583c38" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          <g className={`qf-hero-weapon qf-hero-weapon--${weaponStyle}`}>
            {weaponStyle === "blade" && (
              <g transform="translate(19 -54)">
                <path d="M0 0L6 3L13 -2L10 -7L4 -4Z" fill="#815039" stroke="#302938" strokeWidth="2" />
                <path d="M3 -5L10 -12" stroke="#d5a458" strokeWidth="4" strokeLinecap="round" />
                <path d="M9 -11Q23 -25 24 -41Q13 -36 8 -19L4 -11Z" fill="#d8e3db" stroke="#45565a" strokeWidth="2.4" strokeLinejoin="round" />
                <path d="M9 -19Q17 -31 22 -37" stroke="#fff8dc" strokeWidth="2" />
                <path d="M3 -7L14 -15" stroke="#e8c26f" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}
            {weaponStyle === "spear" && (
              <g transform="translate(12 -45)">
                <path d="M0 0L29 -54" stroke="#5a392d" strokeWidth="5" strokeLinecap="round" />
                <path d="M0 0L29 -54" stroke="#d9b36b" strokeWidth="2" />
                <path d="M25 -49L29 -67L36 -55L30 -51Z" fill="#e7e1ce" stroke="#526269" strokeWidth="2" />
                <path d="M-4 -4L4 2" stroke="#e9c778" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}
            {weaponStyle === "staff" && (
              <g transform="translate(15 -43)">
                <path d="M0 0L33 -62" stroke="#55382f" strokeWidth="6" strokeLinecap="round" />
                <path d="M0 0L33 -62" stroke="#d1a45c" strokeWidth="2" />
                <path d="M27 -55Q27 -68 37 -71Q46 -67 43 -57L36 -51Z" fill="#f1a442" stroke="#5d423b" strokeWidth="2.5" />
                <circle cx="36" cy="-61" r="4" fill="#fff0a4" />
              </g>
            )}
          </g>

          {attackStyle && (
            <g className={`qf-hero-attack qf-hero-attack--${attackStyle}`} pointerEvents="none">
              {attackStyle === "blade" && (
                <>
                  <path d="M18 -78Q42 -104 69 -82Q51 -85 32 -54" fill="none" stroke="#ffd36c" strokeWidth="7" strokeLinecap="round" />
                  <path d="M20 -80Q43 -101 62 -84" fill="none" stroke="#fff8d8" strokeWidth="2.5" />
                </>
              )}
              {attackStyle === "spear" && (
                <>
                  <path d="M18 -57L91 -57" stroke="#e8bf70" strokeWidth="5" strokeLinecap="round" />
                  <path d="M88 -57l17 -7-6 7 6 7z" fill="#fff1c4" stroke="#be995a" strokeWidth="1.8" />
                  <path d="M47 -70l6 13-6 12m18-25 6 13-6 12" fill="none" stroke="#fff5c7" strokeWidth="2" />
                </>
              )}
              {attackStyle === "staff" && (
                <>
                  <path d="M21 -47Q50 -75 68 -100" fill="none" stroke="#e9bb64" strokeWidth="5" strokeLinecap="round" />
                  <circle className="qf-hero-staff-flare" cx="70" cy="-99" r="7" fill="#ffe781" />
                  <path d="M71 -116v34m-17-17h34m-29-12 24 24m0-24-24 24" stroke="#fff6bf" strokeWidth="1.8" />
                </>
              )}
              {attackStyle === "cast" && (
                <>
                  <circle className="qf-hero-cast-aura" cx="43" cy="-66" r="22" fill="#ff8b36" opacity=".45" />
                  <circle cx="43" cy="-66" r="10" fill="#ffd761" stroke="#fff4b4" strokeWidth="2" />
                  <path d="M43 -80v28m-14-14h28m-24-10 20 20m0-20-20 20" stroke="#fff7cb" strokeWidth="1.5" />
                </>
              )}
            </g>
          )}
        </g>
      </g>
      {hurt > 0 && <ellipse cx="0" cy="-54" rx="33" ry="55" fill="#fff6ce" opacity=".3" pointerEvents="none" />}
    </g>
  );
}

export function EnemySprite({ enemy, camera }: { enemy: EnemyState; camera: number }) {
  const x = enemy.x - camera;
  if (x + enemy.width < -120 || x > 1_380) return null;
  const warden = enemy.kind === "warden";
  const directionTransform = warden
    ? enemy.facing > 0
      ? "scale(-1 1)"
      : undefined
    : enemy.facing < 0
      ? "scale(-1 1)"
      : undefined;
  const spriteScale = {
    scarab: { x: 0.53, y: 0.62 },
    sandling: { x: 0.62, y: 0.7 },
    bat: { x: 0.46, y: 0.46 },
    sentinel: { x: 0.63, y: 0.8 },
  } as const;
  const scale = enemy.kind === "warden" ? null : spriteScale[enemy.kind];

  return (
    <g transform={`translate(${x + enemy.width / 2} ${enemy.y + enemy.height})`}>
      <ellipse
        cx="0"
        cy="2"
        rx={warden ? 112 : Math.max(21, enemy.width * 0.48)}
        ry={warden ? 13 : 5}
        fill="#17191e"
        opacity=".61"
      />
      <g transform={directionTransform}>
        {warden ? (
          <g className={`qf-warden-rig qf-enemy-ai--${enemy.aiState} ${enemy.hurtFlash > 0 ? "qf-enemy-rig--hit" : ""}`}>
            <image
              href={`${ART_BASE}warden-sprite.webp`}
              x="-160"
              y="-340"
              width="320"
              height="340"
              preserveAspectRatio="xMidYMax meet"
              imageRendering="pixelated"
            />
            <g className="qf-warden-staff">
              <path d="M76 -15L128 -178" stroke="#4a342e" strokeWidth="12" strokeLinecap="round" />
              <path d="M76 -15L128 -178" stroke="#d2a253" strokeWidth="4" />
              <path d="M118 -168Q112 -188 130 -198Q150 -190 141 -170L130 -160Z" fill="#43afa6" stroke="#392b34" strokeWidth="4" />
              <circle className="qf-warden-gem" cx="130" cy="-180" r="8" fill="#c8fff0" />
              <path d="M130 -209v58m-27-29h54m-45-19 37 38m0-38-37 38" stroke="#72e3d1" strokeWidth="2" opacity=".7" />
            </g>
          </g>
        ) : (
          <g transform={`scale(${scale?.x ?? 1} ${scale?.y ?? 1})`}>
            <g
              className={`qf-enemy-rig qf-enemy-rig--${enemy.kind} qf-enemy-ai--${enemy.aiState} ${enemy.hurtFlash > 0 ? "qf-enemy-rig--hit" : ""}`}
            >
            {enemy.kind === "scarab" && (
              <>
                <g className="qf-scarab-legs qf-scarab-legs--back">
                  <path d="M-15 -20L-30 -10L-35 1m-4-20L-48 -11L-49 -1m-2-18L-61 -28L-61 -20" fill="none" stroke="#173936" strokeWidth="5" strokeLinecap="round" />
                </g>
                <g className="qf-scarab-legs qf-scarab-legs--front">
                  <path d="M13 -20L28 -10L34 1m4-20L49 -11L50 -1m2-18L63 -28L63 -20" fill="none" stroke="#173936" strokeWidth="5" strokeLinecap="round" />
                </g>
                <ellipse cx="0" cy="-20" rx="33" ry="22" fill="#17453e" stroke="#102b2d" strokeWidth="3" />
                <path d="M-31 -27Q-26 -56 0 -57Q27 -55 31 -27Q19 -10 0 -11Q-21 -10 -31 -27Z" fill="#34785b" stroke="#153a34" strokeWidth="3" />
                <path d="M-22 -29Q-14 -47 0 -46Q16 -47 23 -29Q13 -20 0 -21Q-13 -20 -22 -29Z" fill="#55a06e" stroke="#28624b" strokeWidth="2" />
                <path d="M0 -47v23m-16 -12q16 9 32 0" fill="none" stroke="#bbcf83" strokeWidth="2" />
                <path d="M-19 -27L-11 -24m28 -3 9 -3" stroke="#f8dc80" strokeWidth="4" strokeLinecap="round" />
                <path d="M-12 -52Q-26 -74 -37 -63m49 11Q26 -74 37 -63" fill="none" stroke="#173a34" strokeWidth="3" strokeLinecap="round" />
                <circle cx="-37" cy="-64" r="3" fill="#f2c874" />
                <circle cx="37" cy="-64" r="3" fill="#f2c874" />
                <path d="M20 -14q17 8 19 21m-9-17q17 1 22 12" fill="none" stroke="#d9b36b" strokeWidth="2" />
              </>
            )}

            {enemy.kind === "sandling" && (
              <>
                <path d="M-20 -8L-28 -2L-8 -1L-5 -17m21 9 12 7-21 0-2-16" fill="#382d30" stroke="#211d27" strokeWidth="2.5" />
                <path d="M-17 -63Q-24 -49 -21 -35L-27 -7Q0 0 26 -7L19 -39Q24 -56 15 -68Z" fill="#b76f3f" stroke="#573b35" strokeWidth="3" />
                <path d="M-22 -30Q0 -20 22 -31L25 -13Q0 -4 -26 -13Z" fill="#89523b" stroke="#533a35" strokeWidth="2" />
                <path d="M-15 -51Q-24 -45 -32 -31L-25 -26L-12 -38m28 -14Q27 -49 31 -37L23 -31L13 -39" fill="none" stroke="#dfa45d" strokeWidth="7" strokeLinecap="round" />
                <path d="M-15 -56Q-10 -68 1 -68Q15 -68 17 -55L14 -42Q0 -36 -14 -43Z" fill="#dfb36e" stroke="#72503c" strokeWidth="2.6" />
                <path d="M-13 -58Q0 -76 18 -58L22 -48Q2 -52 -17 -47Z" fill="#332638" stroke="#5a4039" strokeWidth="2.5" />
                <path d="M-9 -52h5m10 0h5" stroke="#f7df8b" strokeWidth="3" strokeLinecap="round" />
                <path d="M-2 -47l-2 5h8l-2-5" fill="#61433a" />
                <path d="M-10 -31q10 8 20 0m-18 10q8 6 16 0" fill="none" stroke="#f0cd8c" strokeWidth="2" />
                <g className="qf-sandling-staff">
                  <path d="M25 -8L44 -83" stroke="#55372e" strokeWidth="5" strokeLinecap="round" />
                  <path d="M25 -8L44 -83" stroke="#d1a45c" strokeWidth="1.8" />
                  <path d="M39 -76Q36 -89 47 -94Q58 -89 53 -78L47 -72Z" fill="#54c8b2" stroke="#453439" strokeWidth="2.3" />
                  <circle className="qf-staff-gem" cx="47" cy="-83" r="4" fill="#e2fff0" />
                  <path d="M47 -102v37m-17-19h34" stroke="#83ebd2" strokeWidth="1.5" opacity=".7" />
                </g>
              </>
            )}

            {enemy.kind === "bat" && (
              <>
                <g className="qf-bat-wing qf-bat-wing--back">
                  <path d="M-6 -39Q-27 -77 -64 -64L-59 -24L-42 -38L-37 -13L-19 -32L-7 -20Z" fill="#50345d" stroke="#241f37" strokeWidth="3" />
                  <path d="M-13 -38L-57 -58m24 26-20-2m24-10-6-18" fill="none" stroke="#b7799f" strokeWidth="1.8" />
                </g>
                <g className="qf-bat-wing qf-bat-wing--front">
                  <path d="M6 -39Q27 -77 64 -64L59 -24L42 -38L37 -13L19 -32L7 -20Z" fill="#684166" stroke="#241f37" strokeWidth="3" />
                  <path d="M13 -38L57 -58M33 -32l20-2m-24-10 6-18" fill="none" stroke="#d095b1" strokeWidth="1.8" />
                </g>
                <path d="M-22 -31Q-20 -54 -8 -56L0 -47L9 -56Q22 -52 23 -31L16 -10Q0 0 -16 -10Z" fill="#a86669" stroke="#37243d" strokeWidth="3" />
                <path d="M-16 -35Q0 -47 17 -35L14 -21Q0 -15 -14 -21Z" fill="#523452" stroke="#35243e" strokeWidth="2" />
                <path d="M-12 -35h6m12 0h6" stroke="#ffe084" strokeWidth="4" strokeLinecap="round" />
                <path d="M-4 -16L-1 -5L2 -16" fill="#efe1c7" stroke="#6d4654" strokeWidth="1.7" />
                <path d="M-7 -10Q0 -6 7 -10" fill="none" stroke="#482c45" strokeWidth="2" />
                <path d="M-9 -7Q0 6 11 -6L7 9L0 16L-7 9Z" fill="#4f3457" stroke="#2a2338" strokeWidth="2" />
              </>
            )}

            {enemy.kind === "sentinel" && (
              <>
                <path d="M-16 -8L-25 -2L-4 0L-2 -20m18 12 12 7-23 0-2-18" fill="#463731" stroke="#211d27" strokeWidth="2.5" />
                <path d="M-20 -67Q0 -78 20 -67L24 -37L17 -8Q0 0 -18 -8L-25 -40Z" fill="#7b4b35" stroke="#282936" strokeWidth="3" />
                <path d="M-17 -64Q0 -73 18 -64L20 -43Q0 -36 -21 -43Z" fill="#c28a51" stroke="#43343a" strokeWidth="2.8" />
                <path d="M-15 -57L-6 -62L0 -50L6 -62L15 -57L17 -44Q0 -37 -17 -44Z" fill="#548078" stroke="#2b3540" strokeWidth="2.5" />
                <path d="M-11 -48h8m6 0h8" stroke="#ffe282" strokeWidth="3" strokeLinecap="round" />
                <path d="M-8 -41Q0 -37 8 -41" fill="none" stroke="#443039" strokeWidth="2" />
                <path d="M-22 -69L-25 -83L-11 -76L0 -86L12 -76L26 -83L21 -66Z" fill="#a56a3f" stroke="#302b39" strokeWidth="3" strokeLinejoin="round" />
                <path d="M-16 -68Q0 -73 17 -67" fill="none" stroke="#e1b96d" strokeWidth="3" />
                <g className={`qf-sentinel-shield ${enemy.aiState === "guard" ? "qf-sentinel-shield--raised" : ""}`}>
                  <path d="M-35 -55L-19 -61L-19 -35Q-20 -21 -31 -15Q-43 -23 -44 -36L-44 -54Z" fill="#35706d" stroke="#292f3b" strokeWidth="3" />
                  <path d="M-37 -49L-25 -53L-25 -36Q-26 -28 -31 -25Q-37 -30 -37 -37Z" fill="#d4a961" stroke="#62463c" strokeWidth="2" />
                  <path d="M-31 -49v19m-7-10h13" stroke="#f4dc9a" strokeWidth="1.8" />
                </g>
                <g className="qf-sentinel-sword">
                  <path d="M19 -43L34 -57" stroke="#7b4d39" strokeWidth="5" strokeLinecap="round" />
                  <path d="M33 -57Q51 -78 57 -94Q41 -88 30 -65L25 -57Z" fill="#d9e3db" stroke="#485358" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M34 -65L52 -89" stroke="#fff7da" strokeWidth="2" />
                  <path d="M24 -52L38 -65" stroke="#eac46c" strokeWidth="3.5" strokeLinecap="round" />
                </g>
              </>
            )}
            </g>
          </g>
        )}
      </g>

      {enemy.kind === "warden" && (
        <g className="qf-boss-health" transform="translate(-102 -364)">
          <rect width="204" height="12" rx="6" fill="#241b22" stroke="#f0c973" strokeWidth="2" />
          <rect x="3" y="3" width={198 * Math.max(0, enemy.health / enemy.maxHealth)} height="6" rx="3" fill="#ef614a" />
          <text x="102" y="-5" textAnchor="middle" fill="#ffe6a5" fontSize="9" fontFamily="DM Mono, monospace" letterSpacing="2">THE WARDEN</text>
        </g>
      )}

      {(enemy.aiState === "windup" || enemy.aiState === "cast") && (
        <g className="qf-enemy-telegraph" pointerEvents="none">
          <path d="M-5 -91L0 -101L5 -91Z" fill="#ffd27a" stroke="#302938" strokeWidth="1.5" />
          <circle cx="0" cy="-86" r="1.7" fill="#ffd27a" />
        </g>
      )}
    </g>
  );
}
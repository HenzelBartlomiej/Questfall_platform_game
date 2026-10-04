import { useCallback } from 'react';
import type { PointerEvent } from 'react';
import type { GameCommand, GameSnapshot, EnemyState, PickupState, Platform, WorldTheme } from '@/game/types';
import { EnemySprite, HeroSprite } from './GameSprites';

type GameViewProps = {
  snapshot: GameSnapshot;
  onCommand: (command: GameCommand) => void;
  onMove: (direction: -1 | 0 | 1) => void;
};

const themes = {
  oasis: { sky: '#efa64b', far: '#d47a34', near: '#a85428', stone: '#805032', trim: '#e2a952', title: 'THE SUNLIT OASIS' },
  caravan: { sky: '#e88e48', far: '#ba6130', near: '#793d26', stone: '#80502f', trim: '#db9a4e', title: 'THE DUST ROAD' },
  'sun-temple': { sky: '#edaa54', far: '#a9572f', near: '#683727', stone: '#75503a', trim: '#f2bc69', title: 'THE SUN TEMPLE' },
  arena: { sky: '#e59a4c', far: '#9e4d32', near: '#542f29', stone: '#634538', trim: '#e7b15d', title: 'THE WARDEN’S ARENA' },
};
const ART_BASE = `${import.meta.env.BASE_URL}art/`;
const backgrounds: Record<WorldTheme, string> = {
  oasis: `${ART_BASE}oasis-wide.webp`,
  caravan: `${ART_BASE}caravan-wide.webp`,
  'sun-temple': `${ART_BASE}archive-wide.webp`,
  arena: `${ART_BASE}arena-wide.webp`,
};

const fmt = (n: number) => Math.max(0, Math.floor(n)).toLocaleString('en-US');

function PlatformArt({ platform, camera, palette }: { platform: Platform; camera: number; palette: typeof themes.oasis }) {
  const x = platform.x - camera;
  if (x + platform.width < -80 || x > 1360) return null;
  const top = platform.y;
  const h = Math.max(platform.height, 12);
  const fill = platform.kind === 'wood' ? '#8a4b2b' : platform.kind === 'ground' ? '#b76931' : palette.stone;
  return (
    <g>
      <rect x={x} y={top} width={platform.width} height={h} rx="2" fill={fill} stroke="#593523" strokeWidth="3" />
      <path d={`M${x} ${top + 3}h${platform.width}v7H${x}z`} fill={palette.trim} />
      {platform.kind === 'wood' ? Array.from({ length: Math.floor(platform.width / 34) }, (_, i) => (
        <g key={i}>
          <path d={`M${x + i * 34 + 2} ${top + 10}v${Math.max(h - 12, 5)}`} stroke="#5d3523" strokeWidth="2" opacity=".75" />
          <path d={`M${x + i * 34 + 4} ${top + 14}h24`} stroke="#c17b40" strokeWidth="2" opacity=".7" />
        </g>
      )) : (
        <path d={`M${x + 4} ${top + 12}h${platform.width - 8}`} stroke="#553727" strokeWidth="2" strokeDasharray="6 9" opacity=".5" />
      )}
      <path d={`M${x + 8} ${top + 2}h${Math.max(platform.width - 16, 0)}`} stroke="#ffe18d" strokeWidth="2" opacity=".72" />
    </g>
  );
}

function EnemyArt({ enemy, camera }: { enemy: EnemyState; camera: number }) {
  const x = enemy.x - camera;
  if (x + enemy.width < -100 || x > 1380) return null;
  const isBoss = enemy.boss || enemy.kind === 'warden';
  const w = enemy.width;
  const h = enemy.height;

  if (isBoss) {
    const bossWidth = 320;
    const bossHeight = 340;
    return (
      <g transform={`translate(${x} ${enemy.y})`}>
        <ellipse cx={w / 2} cy={h + 2} rx="112" ry="13" fill="#17191e" opacity=".66" />
        <g transform={enemy.facing > 0 ? `translate(${w} 0) scale(-1 1)` : undefined}>
          <g className="qf-warden-breathe">
            <image
              href={`${ART_BASE}warden-sprite.webp`}
              x={(w - bossWidth) / 2}
              y={h - bossHeight}
              width={bossWidth}
              height={bossHeight}
              preserveAspectRatio="xMidYMax meet"
              imageRendering="pixelated"
            />
          </g>
        </g>
        <g className="qf-boss-health" transform={`translate(${(w - 204) / 2} ${h - bossHeight - 24})`}>
          <rect width="204" height="12" rx="6" fill="#241b22" stroke="#f0c973" strokeWidth="2" />
          <rect x="3" y="3" width={198 * Math.max(0, enemy.health / enemy.maxHealth)} height="6" rx="3" fill="#ef614a" />
          <text x="102" y="-5" textAnchor="middle" fill="#ffe6a5" fontSize="9" fontFamily="DM Mono, monospace" letterSpacing="2">THE WARDEN</text>
        </g>
      </g>
    );
  }

  return (
    <g transform={`translate(${x} ${enemy.y})`}>
      <ellipse cx={w / 2} cy={h + 1} rx={w * .45} ry="5" fill="#17191e" opacity=".58" />
      <g transform={enemy.facing < 0 ? `translate(${w} 0) scale(-1 1)` : undefined}>
      <g className={`qf-enemy-art qf-enemy-${enemy.kind}`}>
        {enemy.kind === 'bat' && (
          <>
            <g className="qf-bat-wing qf-bat-wing-left">
              <path d={`M${w*.45} ${h*.47}Q${w*.27} ${-h*.02} 1 ${h*.12}L${w*.11} ${h*.79} ${w*.39} ${h*.69}z`} fill="#50345d" stroke="#241f37" strokeWidth="2.5" />
              <path d={`M${w*.38} ${h*.5}L${w*.09} ${h*.2}m${w*.26} ${h*.33}L${w*.12} ${h*.61}m${w*.31} ${-h*.11}L${w*.28} ${h*.19}`} fill="none" stroke="#a26c93" strokeWidth="1.5" opacity=".8" />
            </g>
            <g className="qf-bat-wing qf-bat-wing-right">
              <path d={`M${w*.55} ${h*.47}Q${w*.73} ${-h*.02} ${w-1} ${h*.12}L${w*.89} ${h*.79} ${w*.61} ${h*.69}z`} fill="#684166" stroke="#241f37" strokeWidth="2.5" />
              <path d={`M${w*.62} ${h*.5}L${w*.91} ${h*.2}m${-w*.26} ${h*.33}L${w*.88} ${h*.61}m${-w*.31} ${-h*.11}L${w*.72} ${h*.19}`} fill="none" stroke="#b77a9d" strokeWidth="1.5" opacity=".8" />
            </g>
            <path d={`M${w*.4} ${h*.36}l${w*.03} ${-h*.21} ${w*.13} ${h*.14} ${w*.13} ${-h*.14} ${w*.04} ${h*.23}v${h*.28}q-${w*.15} ${h*.23}-${w*.31} 0z`} fill="#aa6b68" stroke="#37243d" strokeWidth="2.5" />
            <path d={`M${w*.43} ${h*.49}l${w*.08} ${-h*.01}m${w*.1} 0l${w*.08} ${h*.01}`} stroke="#ffdc76" strokeWidth="3" strokeLinecap="round" />
            <path d={`M${w*.48} ${h*.65}q${w*.04} ${h*.04} ${w*.08} 0`} fill="none" stroke="#482a45" strokeWidth="2" />
            <path d={`M${w*.47} ${h*.7}l${w*.03} ${h*.13} ${w*.03} ${-h*.13}`} fill="#ede0c5" stroke="#6b4254" strokeWidth="1.5" />
          </>
        )}
        {enemy.kind === 'scarab' && (
          <>
            <path d={`M${w*.22} ${h*.53}q-${w*.15} ${h*.12}-${w*.2} ${h*.27}m${w*.29} ${-h*.28}q-${w*.08} ${h*.18}-${w*.04} ${h*.34}m${w*.25} ${-h*.34}q${w*.08} ${h*.18} ${w*.04} ${h*.34}m${w*.2} ${-h*.33}q${w*.14} ${h*.12} ${w*.17} ${h*.27}`} fill="none" stroke="#183a33" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx={w*.5} cy={h*.61} rx={w*.34} ry={h*.27} fill="#17443d" stroke="#102b2d" strokeWidth="2.5" />
            <path d={`M${w*.18} ${h*.51}Q${w*.19} ${h*.14} ${w*.5} ${h*.12}Q${w*.82} ${h*.14} ${w*.83} ${h*.51}Q${w*.5} ${h*.72} ${w*.18} ${h*.51}z`} fill="#39795d" stroke="#153b34" strokeWidth="2.5" />
            <path d={`M${w*.25} ${h*.44}Q${w*.34} ${h*.22} ${w*.5} ${h*.24}Q${w*.67} ${h*.22} ${w*.75} ${h*.44}Q${w*.5} ${h*.58} ${w*.25} ${h*.44}z`} fill="#4f9a70" stroke="#28604b" strokeWidth="2" />
            <path d={`M${w*.5} ${h*.25}v${h*.3}m-${w*.16} ${-h*.13}q${w*.16} ${h*.09} ${w*.32} 0`} fill="none" stroke="#a8bf6b" strokeWidth="2" opacity=".85" />
            <path d={`M${w*.3} ${h*.5}l${w*.08} ${h*.04}m${w*.24} ${-h*.04}l${w*.08} ${-h*.02}`} stroke="#f9dd83" strokeWidth="3.5" strokeLinecap="round" />
            <path d={`M${w*.39} ${h*.2}q-${w*.1} ${-h*.26}-${w*.2} ${-h*.14}m${w*.42} ${h*.14}q${w*.1} ${-h*.26} ${w*.2} ${-h*.14}`} fill="none" stroke="#153b34" strokeWidth="2.5" />
            <circle cx={w*.28} cy={h*.16} r="2" fill="#bd9c58" /><circle cx={w*.72} cy={h*.16} r="2" fill="#bd9c58" />
          </>
        )}
        {enemy.kind === 'sandling' && (
          <>
            <path d={`M${w*.3} ${h*.91}l-${w*.12} ${h*.08}h${w*.28}l${w*.02} ${-h*.17}m${w*.2} ${h*.09}l${w*.11} ${h*.08}h-${w*.26}l-${w*.02} ${-h*.17}`} fill="#392e2e" stroke="#211d27" strokeWidth="2" />
            <path d={`M${w*.3} ${h*.92}Q${w*.17} ${h*.75} ${w*.25} ${h*.48}L${w*.31} ${h*.31}h${w*.4}l${w*.06} ${h*.18}q${w*.08} ${h*.24}-${w*.04} ${h*.43}l${-w*.03} ${h*.12}z`} fill="#bd7842" stroke="#573b35" strokeWidth="2.5" />
            <path d={`M${w*.3} ${h*.52}q-${w*.18} ${h*.03}-${w*.19} ${h*.21}l${w*.1} ${h*.06} ${w*.17} ${-h*.14}m${w*.48} ${-h*.12}q${w*.14} ${h*.07} ${w*.12} ${h*.22}l-${w*.09} ${h*.05}-${w*.16} ${-h*.13}`} fill="none" stroke="#e1a45c" strokeWidth="5" strokeLinecap="round" />
            <path d={`M${w*.34} ${h*.43}q${w*.13} ${-h*.11} ${w*.31} 0l${w*.03} ${h*.14}q-${w*.15} ${h*.1}-${w*.33} 0z`} fill="#e3b36e" stroke="#76503b" strokeWidth="2" />
            <path d={`M${w*.38} ${h*.49}l${w*.06} ${-h*.01}m${w*.12} 0l${w*.07} ${h*.01}`} stroke="#321f2b" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={w*.42} cy={h*.49} r="1.5" fill="#f9df7e" /><circle cx={w*.58} cy={h*.49} r="1.5" fill="#f9df7e" />
            <path d={`M${w*.3} ${h*.63}q${w*.18} ${h*.1} ${w*.41} 0m-${w*.4} ${h*.12}q${w*.18} ${h*.1} ${w*.39} 0m-${w*.34} ${h*.09}q${w*.18} ${h*.08} ${w*.31} 0`} fill="none" stroke="#f0ca83" strokeWidth="2.5" opacity=".92" />
            <path d={`M${w*.36} ${h*.22}l${w*.02} ${-h*.14} ${w*.09} ${h*.11} ${w*.12} ${-h*.13} ${w*.04} ${h*.16}`} fill="#322332" stroke="#5d4139" strokeWidth="2" />
            <path d={`M${w*.36} ${h*.27}q${w*.13} ${h*.05} ${w*.31} 0`} fill="none" stroke="#cf934e" strokeWidth="3" />
          </>
        )}
        {enemy.kind === 'sentinel' && (
          <>
            <path d={`M${w*.24} ${h*.9}l-${w*.06} ${h*.08}h${w*.2}l${w*.05} ${-h*.18}m${w*.23} ${h*.1}l${w*.06} ${h*.08}h-${w*.2}l-${w*.05} ${-h*.18}`} fill="#42313a" stroke="#29232c" strokeWidth="2" />
            <path d={`M${w*.23} ${h*.82}q-${w*.08} ${-h*.3} ${w*.03} ${-h*.47}l${w*.09} ${-h*.2}h${w*.33}l${w*.1} ${h*.2}q${w*.1} ${h*.2} ${w*.02} ${h*.47}l-${w*.05} ${h*.11}h-${w*.48}z`} fill="#794c3b" stroke="#35282d" strokeWidth="3" />
            <path d={`M${w*.17} ${h*.32}l${w*.1} ${-h*.14}h${w*.47}l${w*.09} ${h*.16}q-${w*.31} ${h*.18}-${w*.66} ${-h*.02}z`} fill="#d7a652" stroke="#563b35" strokeWidth="2.5" />
            <path d={`M${w*.28} ${h*.37}q${w*.21} ${-h*.11} ${w*.45} 0l${w*.02} ${h*.24}q-${w*.23} ${h*.15}-${w*.49} 0z`} fill="#d3b373" stroke="#644538" strokeWidth="2" />
            <path d={`M${w*.34} ${h*.46}l${w*.08} ${h*.02}m${w*.18} ${-h*.02}l${w*.08} ${-h*.01}`} stroke="#fcdf85" strokeWidth="3.5" strokeLinecap="round" />
            <path d={`M${w*.43} ${h*.54}l${w*.08} 0m-${w*.04} ${-h*.04}v${h*.09}`} fill="none" stroke="#42303b" strokeWidth="2" />
            <path d={`M${w*.5} ${h*.62}l${w*.14} ${h*.11}l-${w*.14} ${h*.13}l-${w*.14} ${-h*.13}z`} fill="#31a6a2" stroke="#1a5555" strokeWidth="2" />
            <path d={`M${w*.34} ${h*.68}h${w*.32}m-${w*.25} ${h*.18}h${w*.18}`} stroke="#ebc46e" strokeWidth="2" />
            <circle cx={w*.28} cy={h*.83} r="3" fill="#a77b4f" /><circle cx={w*.72} cy={h*.83} r="3" fill="#a77b4f" />
          </>
        )}
      </g>
      </g>
      {enemy.hurtFlash > 0 && <ellipse cx={w / 2} cy={h / 2} rx={w * .58} ry={h * .58} fill="#fff4c7" opacity=".52" />}
      {enemy.hurtFlash > 0 && (
        <g className="qf-enemy-impact" pointerEvents="none">
          <path d={`M${w*.72} ${h*.25}l4-8 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6z`} fill="#fff0a2" stroke="#ff9d48" strokeWidth="1.5" />
          <path d={`M${w*.28} ${h*.42}l2-5 3 5 5 1-4 3 1 5-5-3-4 3 1-5-4-3z`} fill="#fff0a2" />
        </g>
      )}
    </g>
  );
}

function PickupArt({ pickup, camera }: { pickup: PickupState; camera: number }) {
  const x = pickup.x - camera;
  const y = pickup.y;
  if (x < -45 || x > 1325) return null;
  if (pickup.kind === 'chest') return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 11q0-10 10-10h23q10 0 10 10v21H0z" fill={pickup.opened ? '#7b4427' : '#b95d31'} stroke="#59351f" strokeWidth="3" />
      <path d="M0 12h43v8H0z" fill="#e5ad50" stroke="#704120" strokeWidth="2" />
      <path d="M18 13h8v10h-8z" fill="#f9d275" stroke="#704120" strokeWidth="2" />
      {!pickup.opened && <path d="M13 0L21-10 29 0z" fill="#ffdc75" />}
    </g>
  );
  if (pickup.kind === 'weapon') return <g transform={`translate(${x} ${y}) rotate(-35)`}><path d="M0 0h6v28H0z" fill="#72462a" /><path d="M3-14q-12 10 0 18 13-9 0-18z" fill="#e7e2c7" stroke="#66513d" strokeWidth="2" /></g>;
  if (pickup.kind === 'potion') return <g transform={`translate(${x} ${y})`}><path d="M-4-12h10v7l6 7v17q-11 8-22 0V2l6-7z" fill="#db6844" stroke="#593521" strokeWidth="2" /><path d="M-8 7h16v9q-8 5-16 0z" fill="#ffd16a" /></g>;
  const colors = { coin: '#f5c84b', gold: '#ffd86d', silver: '#d4d8d0', qft: '#8bd1b0' };
  const c = colors[pickup.kind];
  return <g transform={`translate(${x} ${y})`}><path d="M0-13l11 7v13L0 14-11 7V-6z" fill={c} stroke="#714a2c" strokeWidth="2" /><path d="M0-8l6 4v7l-6 5-6-5v-7z" fill="none" stroke="#fff2b8" strokeWidth="1.5" /><circle cx="0" cy="-1" r="2" fill="#fff4bd" /></g>;
}

function Backdrop({ theme, camera }: { theme: WorldTheme; camera: number }) {
  const colors = themes[theme];
  const offset = camera * .14 * .78125;
  const moteColor = theme === 'sun-temple' ? '#68e2ff' : theme === 'arena' ? '#ffb65b' : '#fff0ae';
  return (
    <>
      <defs>
        <linearGradient id="qf-art-grade" x2="0" y2="1">
          <stop stopColor={theme === 'sun-temple' ? '#1a1a43' : '#15243b'} stopOpacity=".08" />
          <stop offset=".7" stopColor={colors.near} stopOpacity=".02" />
          <stop offset="1" stopColor="#261514" stopOpacity=".52" />
        </linearGradient>
        <radialGradient id="qf-lantern-glow">
          <stop stopColor={moteColor} stopOpacity=".72" />
          <stop offset="1" stopColor={moteColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="562" fill={colors.sky} />
      <g transform={`translate(${-offset} 0)`}>
        <image href={backgrounds[theme]} x="0" y="0" width="1000" height="562" preserveAspectRatio="none" />
        <g transform="translate(2000 0) scale(-1 1)">
          <image href={backgrounds[theme]} x="0" y="0" width="1000" height="562" preserveAspectRatio="none" />
        </g>
        <image href={backgrounds[theme]} x="2000" y="0" width="1000" height="562" preserveAspectRatio="none" />
      </g>
      <rect width="1000" height="562" fill="url(#qf-art-grade)" pointerEvents="none" />
      <g className={`qf-scene-atmosphere qf-scene-atmosphere-${theme}`} pointerEvents="none">
        {[[125, 365], [276, 305], [442, 414], [617, 330], [772, 395], [904, 276]].map(([x, y], index) => (
          <g key={`${x}-${y}`} className="qf-floating-mote" style={{ animationDelay: `${index * -.73}s` }}>
            <circle cx={x} cy={y} r="17" fill="url(#qf-lantern-glow)" opacity=".48" />
            <circle cx={x} cy={y} r={index % 2 ? 1.8 : 2.4} fill={moteColor} />
          </g>
        ))}
        {theme === 'oasis' && (
          <g className="qf-water-glimmer" fill="none" stroke="#d1fff0" strokeLinecap="round">
            <path d="M340 421q33-5 66 0M374 431q23-4 45 0M410 419q14-2 27 0" />
            <path d="M340 421q33-5 66 0M374 431q23-4 45 0M410 419q14-2 27 0" transform="translate(0 7)" opacity=".6" />
          </g>
        )}
        {(theme === 'caravan' || theme === 'arena') && (
          <g className="qf-flame-glow">
            <circle cx="137" cy="350" r="24" fill="url(#qf-lantern-glow)" />
            <circle cx="865" cy="335" r="21" fill="url(#qf-lantern-glow)" />
          </g>
        )}
      </g>
    </>
  );
}

export default function GameView({ snapshot, onCommand, onMove }: GameViewProps) {
  const sendMove = useCallback((direction: -1 | 0 | 1) => {
    onMove(direction);
  }, [onMove]);

  const { player, level } = snapshot;
  const camera = snapshot.cameraX;
  const palette = themes[level.theme];
  const viewX = Math.max(0, camera);
  const activeTheme = themes[level.theme] || palette;
  const mode = snapshot.mode;
  const overlayTitle = mode === 'title' ? 'Questfall' : mode === 'paused' ? 'A BREATHER' : mode === 'game-over' ? 'THE SANDS CLAIM YOU' : mode === 'victory' ? 'HALL CONQUERED' : mode === 'stage-clear' ? 'PASSAGE CLEARED' : '';
  const overlayCopy = mode === 'title'
    ? 'Four trials. One stubborn warrior. A whole lot of treasure just lying around.'
    : mode === 'paused' ? 'Catch your breath. The Hall will wait right here.'
      : mode === 'game-over' ? 'The dunes are patient. Your next run can be legendary.'
        : mode === 'victory' ? 'The Warden is down. The old Hall opens its doors to you.'
          : mode === 'stage-clear' ? 'A new stretch of the Hall lies beyond the dust.'
            : '';
  const primaryLabel = mode === 'title' ? 'Enter the Hall' : mode === 'paused' ? 'Back to the fight' : mode === 'stage-clear' ? 'Continue onward' : mode === 'victory' ? 'Play again' : 'Rise again';
  const primaryCommand: GameCommand = mode === 'title' ? 'start' : mode === 'paused' ? 'continue' : mode === 'stage-clear' ? 'continue' : mode === 'victory' ? 'restart' : 'restart';
  const hearts = Array.from({ length: Math.min(8, Math.max(player.maxHealth, 1)) }, (_, i) => i < player.health);
  const hold = (direction: -1 | 1) => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); sendMove(direction); },
    onPointerUp: () => sendMove(0),
    onPointerCancel: () => sendMove(0),
    onLostPointerCapture: () => sendMove(0),
  });

  return (
    <main className="qf-page">
      <div className="qf-shell">
        <header className="qf-mast">
          <div><span className="qf-brand">QUESTFALL</span><span> &nbsp; / &nbsp; THE HALL</span></div>
          <div>FIELD RECORD &nbsp; № 0{level.number} &nbsp; · &nbsp; SOLO EXPEDITION</div>
        </header>
        <div className="qf-frame">
          <svg className="qf-scene" viewBox="0 0 1000 562" role="img" aria-label={`${level.name}, side-scrolling adventure scene`} preserveAspectRatio="xMidYMid meet">
            <Backdrop theme={level.theme} camera={viewX} />
            <g transform="scale(.78125)">
            {snapshot.pickups.map(pickup => <PickupArt key={pickup.id} pickup={pickup} camera={viewX} />)}
            {snapshot.platforms.map((platform, i) => <PlatformArt key={`${i}-${platform.x}`} platform={platform} camera={viewX} palette={activeTheme} />)}
            {snapshot.enemies.map(enemy => <EnemySprite key={enemy.id} enemy={enemy} camera={viewX} />)}
            {snapshot.projectiles.map(projectile => (
              <g key={projectile.id} transform={`translate(${projectile.x-viewX} ${projectile.y})`}>
            {projectile.kind === 'fireball' ? (
              <g transform={projectile.vx < 0 ? 'scale(-1 1)' : undefined}>
                <g className="qf-projectile qf-projectile-fireball">
                <circle r={projectile.radius + 9} fill="#f67b31" opacity=".3" />
                <path d={`M${-projectile.radius*1.9} 0q${projectile.radius} ${-projectile.radius*1.7} ${projectile.radius*1.9} 0q-${projectile.radius} ${projectile.radius*1.7}-${projectile.radius*1.9} 0`} fill="#ff8f32" stroke="#ffd65e" strokeWidth="2" />
                <path d={`M${-projectile.radius} 0q${projectile.radius} ${-projectile.radius} ${projectile.radius*1.4} 0q-${projectile.radius} ${projectile.radius}-${projectile.radius*1.4} 0`} fill="#fff0a0" />
                <circle cx="3" cy="-2" r="4" fill="#fff7ce" />
                </g>
              </g>
            ) : projectile.kind === 'sand-shot' ? (
              <g className="qf-projectile qf-projectile-sand-shot">
                <circle r={projectile.radius + 7} fill="#d4a66e" opacity=".22" />
                <path d={`M0 ${-projectile.radius}q${projectile.radius*.88} 0 ${projectile.radius} ${projectile.radius*.52}L0 ${projectile.radius}q-${projectile.radius*.9} 0-${projectile.radius} ${-projectile.radius*.52}z`} fill="#c1a27b" stroke="#f3d09a" strokeWidth="2" />
                <path d={`M${-projectile.radius*.65} 0h${projectile.radius*1.3}`} stroke="#f8dfb5" strokeWidth="2" opacity=".8" />
              </g>
            ) : projectile.kind === 'arc-bolt' ? (
              <g className="qf-projectile qf-projectile-arc-bolt">
                <circle r={projectile.radius + 9} fill="#59d9c5" opacity=".24" />
                <path d={`M0 ${-projectile.radius}L${projectile.radius*.72} 0 0 ${projectile.radius} ${-projectile.radius*.72} 0Z`} fill="#54cdbb" stroke="#d4fff0" strokeWidth="2" />
                <path d={`M${-projectile.radius*.45} 0H${projectile.radius*.45}`} stroke="#f3fff5" strokeWidth="2" />
              </g>
            ) : projectile.kind === 'sonic-wave' ? (
              <g className="qf-projectile qf-projectile-sonic-wave">
                <circle r={projectile.radius + 8} fill="#c88ce0" opacity=".16" />
                <path d={`M${-projectile.radius*.35} ${-projectile.radius}Q${projectile.radius} 0 ${-projectile.radius*.35} ${projectile.radius}M${projectile.radius*.25} ${-projectile.radius}Q${projectile.radius*1.7} 0 ${projectile.radius*.25} ${projectile.radius}`} fill="none" stroke="#f3c9ff" strokeWidth="3" strokeLinecap="round" />
                <circle r={projectile.radius*.32} fill="#ffe5ff" />
              </g>
            ) : (
              <g className="qf-projectile qf-projectile-blade-wave">
                <path d={`M${-projectile.radius} ${projectile.radius*.35}Q0 ${-projectile.radius*1.2} ${projectile.radius} 0Q0 ${projectile.radius*.2} ${-projectile.radius} ${projectile.radius*.35}Z`} fill="#e8c778" stroke="#fff1c4" strokeWidth="2" />
                <path d={`M${-projectile.radius*.55} 0Q0 ${-projectile.radius*.75} ${projectile.radius*.55} ${-projectile.radius*.12}`} fill="none" stroke="#fffdf0" strokeWidth="2" />
              </g>
            )}
              </g>
            ))}
            <HeroSprite x={player.x-viewX} y={player.y} width={player.width} height={player.height} facing={player.facing} hurt={player.hurtFlash} attackStyle={player.attackStyle} weapon={player.weapon} moving={Math.abs(player.vx) > 4} grounded={player.grounded} />
            </g>
            <g className="scene-sign" transform="translate(24 23)">
              <path d="M0 0h241v55H0z" fill="#432a1d" stroke="#d19c51" strokeWidth="2" />
              <path d="M7 7h227v41H7z" fill="none" stroke="#8d5a32" />
              <text x="17" y="23" fill="#ffdb7d" fontFamily="DM Mono, monospace" fontSize="10" letterSpacing="2">{activeTheme.title}</text>
              <text x="17" y="40" fill="#f7e6bc" fontFamily="Space Grotesk, sans-serif" fontSize="17" fontWeight="700">{level.name || `THE HALL · LEVEL ${level.number}`}</text>
              <text x="974" y="42" textAnchor="end" fill="#fff0c6" fontFamily="DM Mono, monospace" fontSize="11">HALL {String(level.number).padStart(2, '0')} / 04</text>
            </g>
            {snapshot.message && mode === 'playing' && <g transform="translate(500 118)"><rect x="-147" y="-18" width="294" height="34" rx="17" fill="#382318" opacity=".82" /><text textAnchor="middle" y="5" fill="#ffe7ae" fontFamily="Space Grotesk" fontSize="13">{snapshot.message}</text></g>}
            {mode !== 'playing' && (
              <foreignObject x="0" y="0" width="1000" height="562">
                <div className="qf-overlay">
                  <section className="qf-panel" aria-label={overlayTitle}>
                    <div className="qf-kicker">{mode === 'title' ? 'The first four levels' : `Level ${level.number} · ${level.subtitle || 'The Hall'}`}</div>
                    <h1 className="qf-title">{overlayTitle}</h1>
                    <p className="qf-copy">{overlayCopy}</p>
                    <button className="qf-btn primary" onClick={() => onCommand(primaryCommand)}>{primaryLabel}</button>
                    {mode === 'paused' && <div className="qf-footer">ESC OR P TO RETURN</div>}
                    {mode !== 'paused' && <div className="qf-footer">A LITTLE COURAGE GOES A LONG WAY</div>}
                  </section>
                </div>
              </foreignObject>
            )}
          </svg>
          <div className="qf-hud" aria-label="Adventure status">
            <div className="qf-hud-group">
              <span className="qf-stat"><span className="qf-heart" aria-label={`${player.health} health`}>{hearts.map((alive, i) => <svg key={i} width="15" height="15" viewBox="0 0 16 16" style={{ opacity: alive ? 1 : .22 }}><path d="M8 14 2 8C-1 4 4 0 8 4c4-4 9 0 6 4z" fill="currentColor" /></svg>)}</span></span>
              <span className="qf-stat">SCORE <b>{fmt(snapshot.score)}</b></span>
            </div>
            <div className="qf-hud-group">
              <span className="qf-stat"><b className="gold-mark">◆</b> GOLD <b>{fmt(snapshot.gold)}</b></span>
              <span className="qf-stat"><b className="silver-mark">◆</b> SILVER <b>{fmt(snapshot.silver)}</b></span>
              <span className="qf-stat"><b className="qft-mark">✦</b> QFT <b>{fmt(snapshot.qft)}</b></span>
            </div>
            <div className="qf-hud-group">
              <span className="qf-stat">WEAPON <b>{player.weapon === 'ember-staff' ? 'EMBER STAFF' : player.weapon.toUpperCase()}</b></span>
              <span className="qf-stat">MAGIC <span className="qf-magic-track" role="meter" aria-label="Magic" aria-valuemin={0} aria-valuemax={player.maxMagic} aria-valuenow={player.magic}><span style={{ width: `${Math.min(100, Math.max(0, player.magic / Math.max(player.maxMagic, 1) * 100))}%` }} /></span> <b>{fmt(player.magic)}</b></span>
            </div>
          </div>
        </div>
        <nav className="qf-controls" aria-label="Game controls">
          <div className="qf-control-cluster">
            <button className="qf-btn" aria-label="Move left" {...hold(-1)}>←</button>
            <button className="qf-btn" aria-label="Move right" {...hold(1)}>→</button>
            <button className="qf-btn action" onClick={() => onCommand('jump')}>JUMP <span className="qf-key">SPACE</span></button>
          </div>
          <div className="qf-mobile-note">Hold arrows to move · tap an action</div>
          <div className="qf-control-cluster">
            <button className="qf-btn action" onClick={() => onCommand('attack')}>ATTACK <span className="qf-key">J</span></button>
            <button className="qf-btn action" onClick={() => onCommand('cast')}>CAST <span className="qf-key">K</span></button>
            <button className="qf-btn" aria-label="Pause game" onClick={() => onCommand('pause')}>Ⅱ</button>
          </div>
        </nav>
        <footer className="qf-instructions">
          <span>MOVE <i className="qf-key">←</i> <i className="qf-key">→</i> &nbsp; JUMP <i className="qf-key">SPACE</i> &nbsp; ATTACK <i className="qf-key">J</i> &nbsp; CAST <i className="qf-key">K</i></span>
          <span>THE HALL · FOUR TRIALS AWAIT</span>
        </footer>
      </div>
    </main>
  );
}
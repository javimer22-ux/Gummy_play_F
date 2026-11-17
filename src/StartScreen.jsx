import { useEffect, useState } from 'react';
import Gummy from './components/entities/Gummy';
import InstructionsModal from './components/InstructionsModal';

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&display=swap';

/* ───────── Estilos locales: cinta, burbujas, brillos ───────── */
const CSS = `
@import url('${FONT_URL}');
@keyframes sl-belt { from { transform: translateX(0); } to { transform: translateX(750px); } }
@keyframes sl-studs { from { stroke-dashoffset: 52; } to { stroke-dashoffset: 0; } }
@keyframes sl-bubble { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-14px) scale(1.06); } }
@keyframes sl-twinkle { 0%,100% { transform: scale(.5) rotate(0); opacity: .35; } 50% { transform: scale(1.1) rotate(25deg); opacity: 1; } }
.sl-belt-gummies { animation: sl-belt 14s linear infinite; }
.sl-studs { animation: sl-studs 1.2s linear infinite; }
.sl-bubble { animation: sl-bubble 4s ease-in-out infinite; }
.sl-twinkle { animation: sl-twinkle 2.6s ease-in-out infinite; }
`;

/* ───────── Fondo: planta industrial (SVG ligero, 1600×900) ───────── */
const GUMMY_COLORS = ['#ff3d5a', '#ffc12e', '#a66bff', '#3fb8ff', '#34c759'];
const BUTTONS = ['#ff4d6d', '#ffc12e', '#4f86ff', '#34c759'];

const NANEGAL_SRC = '/assets/fondo-nanegal.jpg';
const WIN_Y = 84, WIN_H = 520;
const PANORAMA = { x: 256, w: 1120 };

function Pane({ x, w, side }) {
  const pw = w / 3;
  const clip = `sl-clip-${side}`;
  return (
    <g>
      <clipPath id={clip}><rect x={x} y="84" width={w} height="520" /></clipPath>
      <rect x={x} y="84" width={w} height="520" fill="url(#sl-sky)" />
      <image
        href={NANEGAL_SRC} x={PANORAMA.x} y={WIN_Y} width={PANORAMA.w} height={WIN_H}
        preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clip})`}
      />
      <polygon points={`${x + 40},84 ${x + 110},84 ${x + 40},604 ${x - 30},604`} fill="#fff" opacity=".24" />
      <polygon points={`${x + w * 0.5},84 ${x + w * 0.5 + 40},84 ${x + w * 0.5 - 120},604 ${x + w * 0.5 - 160},604`} fill="#fff" opacity=".2" />
      <polygon points={`${x + w - 150},84 ${x + w - 90},84 ${x + w - 190},604 ${x + w - 250},604`} fill="#fff" opacity=".18" />
      {[1, 2].map((i) => <rect key={i} x={x + pw * i - 6} y="84" width="12" height="520" fill="#8466d6" />)}
      <rect x={x} y="176" width={w} height="10" fill="#8466d6" />
      <rect x={x} y="84" width={w} height="520" fill="none" stroke="#8466d6" strokeWidth="12" />
      <rect x={x - 16} y="604" width={w + 32} height="16" rx="4" fill="#8466d6" />
    </g>
  );
}

function Screen({ x, y, w, h, children }) {
  return (
    <g>
      <rect x={x - 5} y={y - 5} width={w + 10} height={h + 10} rx="12" fill="#c8cdf0" />
      <rect x={x} y={y} width={w} height={h} rx="8" fill="#2a2766" />
      <polygon points={`${x + w * 0.45},${y} ${x + w * 0.65},${y} ${x + w * 0.35},${y + h} ${x + w * 0.15},${y + h}`} fill="#fff" opacity=".1" />
      {children}
    </g>
  );
}

function FactoryBackground() {
  const stripes = Array.from({ length: 26 }, (_, i) => i - 7);
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="-800 0 3200 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sl-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c3d8de" /><stop offset="1" stopColor="#eaf3f3" /></linearGradient>
        <linearGradient id="sl-hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a5d487" /><stop offset="1" stopColor="#6fae7a" /></linearGradient>
        <linearGradient id="sl-pipe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7d839c" /><stop offset=".4" stopColor="#c4c8d8" /><stop offset="1" stopColor="#8b91aa" /></linearGradient>
        <linearGradient id="sl-pipeB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5f74c4" /><stop offset=".4" stopColor="#9db0ec" /><stop offset="1" stopColor="#6479c8" /></linearGradient>
        <linearGradient id="sl-mach" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9aa4e2" /><stop offset="1" stopColor="#6c76be" /></linearGradient>
      </defs>

      <rect x="-800" width="3200" height="900" fill="#cdb8ff" />
      {stripes.map((i) => <rect key={i} x={i * 125} width="125" height="900" fill={Math.abs(i) % 2 ? '#c4acfa' : '#dccbff'} />)}
      <rect x="-800" width="3200" height="58" fill="#9a82e0" />
      <rect x="-800" y="52" width="3200" height="8" fill="#8168d0" />

      <Pane x={256} w={452} side="left" />
      <Pane x={920} w={456} side="right" />

      <rect x="1490" y="56" width="30" height="300" fill="url(#sl-pipeB)" />
      <path d="M1418 56 V170 Q1418 204 1452 204 H1900" fill="none" stroke="url(#sl-pipe)" strokeWidth="38" />
      <rect x="1396" y="150" width="44" height="12" rx="4" fill="#767c96" />
      <rect x="448" y="56" width="34" height="170" fill="url(#sl-pipe)" />
      <rect x="516" y="56" width="14" height="170" fill="url(#sl-pipeB)" />
      <path d="M-400 292 H92 Q130 292 130 330 V420" fill="none" stroke="url(#sl-pipe)" strokeWidth="46" />

      <rect x="-800" y="860" width="3200" height="40" fill="#8c70d8" />
      <rect x="-800" y="774" width="3200" height="90" fill="#554b96" />
      <rect x="-800" y="774" width="3200" height="10" fill="#7a6ec0" />
      <path d="M-860 836 H2460" stroke="#ffd96a" strokeWidth="18" strokeLinecap="round" strokeDasharray="0 52" className="sl-studs" />

      <g className="sl-belt-gummies">
        {Array.from({ length: 23 }, (_, i) => (
          <Gummy key={i} shape="osito" color={GUMMY_COLORS[i % 5]} size={78} shadow={false} x={i * 150 - 900 + 20} y={696} />
        ))}
      </g>

      <g>
        <rect x="-400" y="392" width="586" height="14" rx="5" fill="#59629f" />
        <rect x="-400" y="404" width="582" height="500" fill="url(#sl-mach)" />
        <Screen x={26} y={430} w={148} h={108}>
          {[0, 1, 2].map((i) => <rect key={i} x="40" y={448 + i * 14} width={50 - i * 12} height="5" rx="2" fill="#4fe3d0" />)}
          <rect x="150" y="480" width="8" height="46" fill="#4fe3d0" />
        </Screen>
        {[0, 1].map((i) => <circle key={i} cx={42 + i * 28} cy="574" r="9" fill={BUTTONS[i]} stroke="#fff" strokeWidth="2" />)}
        {[0, 1, 2, 3].map((i) => <rect key={i} x={110 + (i % 2) * 34} y={560 + Math.floor(i / 2) * 32} width="26" height="24" rx="5" fill={BUTTONS[(i + 2) % 4]} />)}
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={30 + i * 8} y="604" width="3" height="24" fill="#40477e" />)}
        <rect x="-400" y="690" width="520" height="170" rx="6" fill="#8e98d8" />
        <rect x="-400" y="690" width="520" height="14" fill="#a3acea" />
      </g>

      <g>
        <path d="M316 900 V690 Q316 650 348 646 H500 Q532 650 532 690 V900 Z" fill="url(#sl-mach)" />
        <path d="M316 690 Q316 650 348 646 L372 646 L372 760 L316 790 Z" fill="#4a5190" />
        <Screen x={362} y={738} w={150} h={96}>
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={380 + i * 20} y={810 - (12 + i * 9)} width="10" height={12 + i * 9} fill={i % 2 ? '#4fe3d0' : '#ffd96a'} />)}
        </Screen>
        {[0, 1, 2].map((i) => <circle key={i} cx={376 + i * 34} cy="866" r="9" fill={['#ff4d6d', '#34c759', '#4fa8ff'][i]} stroke="#fff" strokeWidth="2" />)}
      </g>

      <g>
        <path d="M930 900 V690 Q930 650 962 646 H1198 Q1230 650 1230 690 V900 Z" fill="url(#sl-mach)" />
        <path d="M930 690 Q930 650 962 646 L992 646 L992 700 L930 730 Z" fill="#4a5190" />
        <Screen x={982} y={702} w={198} h={64} />
        {[['#34c759', 1004], ['#ffc12e', 1068], ['#ff4d6d', 1132]].map(([c, x]) => <circle key={x} cx={x} cy="820" r="12" fill={c} stroke="#fff" strokeWidth="3" />)}
        <rect x="962" y="856" width="236" height="40" rx="6" fill="#4a5190" />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={976 + i * 16} y="862" width="6" height="28" fill="#8e98d8" />)}
      </g>

      <g>
        <rect x="1432" y="338" width="470" height="570" fill="url(#sl-mach)" />
        <rect x="1432" y="338" width="470" height="14" fill="#59629f" />
        <rect x="1468" y="378" width="100" height="100" rx="8" fill="#4a5190" />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x="1478" y={388 + i * 10} width="80" height="5" rx="2" fill="#2a2766" />)}
        <rect x="1544" y="548" width="26" height="110" rx="6" fill="#c8cdf0" />
        <rect x="1550" y="560" width="14" height="40" rx="4" fill="#4fe3d0" />
      </g>
    </svg>
  );
}

/** Título con contorno (lo reutiliza SetupScreen). */
export function CartoonTitle({ children, className = '', style }) {
  return (
    <span className={`relative inline-block font-extrabold uppercase leading-none tracking-wide ${className}`} style={{ fontFamily: 'var(--gl-font)', ...style }}>
      <span aria-hidden="true" className="absolute inset-0 select-none" style={{ color: '#4b1d8f', WebkitTextStroke: '0.2em #4b1d8f', textShadow: '0 0.1em 0 #7a1230, 0 0.18em 0.08em rgba(0,0,0,.35)' }}>{children}</span>
      <span className="relative" style={{ backgroundImage: 'linear-gradient(180deg,#fff58a 0%,#ffd21f 45%,#ff9a1f 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>{children}</span>
    </span>
  );
}

function LogoTitle({ children, className = '', style }) {
  return (
    <span className={`relative inline-block font-extrabold uppercase leading-none tracking-wide ${className}`} style={{ fontFamily: 'var(--gl-font)', ...style }}>
      <span aria-hidden="true" className="absolute inset-0 select-none" style={{ color: '#d9560a', transform: 'translateY(0.07em)' }}>{children}</span>
      <span
        className="relative"
        style={{
          backgroundImage: 'linear-gradient(180deg,#fffb9a 0%,#ffe135 38%,#ffb21a 78%,#ff8a1a 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent',
        }}
      >{children}</span>
    </span>
  );
}

const Sparkle = ({ className, size = 26, delay = '0s' }) => (
  <span aria-hidden="true" className={`sl-twinkle pointer-events-none absolute ${className}`} style={{ animationDelay: delay, width: size, height: size }}>
    <svg viewBox="0 0 24 24" width={size} height={size}><path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" fill="#fffbe0" /></svg>
  </span>
);
const Bubble = ({ className, size, delay = '0s' }) => (
  <span
    aria-hidden="true" className={`sl-bubble pointer-events-none absolute rounded-full border-2 border-white/80 ${className}`}
    style={{ width: size, height: size, animationDelay: delay, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,.9), rgba(190,225,255,.25) 60%)' }}
  />
);

const UI_CONFIG = {
  bloque: { offsetY: 0 },
  titulo: {
    fontSize: 144, fontWeight: 800,
    marginTop: 0,
    bearSize: 150,
    gap: 20,
  },
  subtitulo: {
    fontSize: 23, fontWeight: 800,
    width: null,
    paddingX: 32, paddingY: 8,
    marginTop: 24,
    borderWidth: 4,
  },
  boton: {
    fontSize: 25, fontWeight: 800,
    width: null, height: null,
    paddingX: 82, paddingY: 19,
    marginTop: 30,
  },
};

const INTRO_VIDEO_SRC = '/public/assets/intro.mp4'; // video de introducción (public/assets/)

export default function StartScreen({ onPlay }) {
  const { bloque, titulo, subtitulo, boton } = UI_CONFIG;
  const [showInstructions, setShowInstructions] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  // Escape cierra el video de introducción
  useEffect(() => {
    if (!showIntro) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setShowIntro(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showIntro]);

  return (
    <div className="gl-app relative h-screen w-screen overflow-hidden" style={{ minHeight: 0 }}>
      <style>{CSS}</style>
      <FactoryBackground />

      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="sl-sticker" x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b1" />
          <feComponentTransfer in="b1" result="m1"><feFuncA type="linear" slope="14" intercept="-2.2" /></feComponentTransfer>
          <feFlood floodColor="#6d28d9" result="c1" /><feComposite in="c1" in2="m1" operator="in" result="ring1" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="b2" />
          <feComponentTransfer in="b2" result="m2"><feFuncA type="linear" slope="14" intercept="-2.6" /></feComponentTransfer>
          <feFlood floodColor="#2E1065" result="c2" /><feComposite in="c2" in2="m2" operator="in" result="ring2" />
          <feMerge><feMergeNode in="ring2" /><feMergeNode in="ring1" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </svg>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6" style={{ transform: `translateY(${bloque.offsetY}px)` }}>
        {/* Logo */}
        <div className="relative" style={{ marginTop: titulo.marginTop }}>
          <h1 className="m-0 flex items-center px-8 py-4" style={{ gap: titulo.gap, filter: 'url(#sl-sticker) drop-shadow(0 10px 8px rgba(30,0,80,.35))' }}>
            <Gummy shape="osito" color="#ff3d5a" size={titulo.bearSize} shadow={false} className="hidden shrink-0 sm:block" style={{ height: titulo.bearSize, width: 'auto' }} />
            <LogoTitle style={{ fontSize: titulo.fontSize, fontWeight: titulo.fontWeight }}>GUMMY LAB</LogoTitle>
          </h1>
          <Sparkle className="-top-4 right-[6%]" size={34} />
          <Sparkle className="bottom-0 left-[26%]" size={22} delay="1s" />
          <Sparkle className="right-[-2%] top-[40%]" size={20} delay=".6s" />
          <Bubble className="-top-6 left-[22%]" size={30} />
          <Bubble className="bottom-[-1.2rem] right-[20%]" size={38} delay="1.2s" />
          <Bubble className="left-[-2%] top-[8%]" size={20} delay=".7s" />
          <Bubble className="right-[-3%] bottom-[10%]" size={24} delay="2s" />
        </div>

        <p
          className="m-0 rounded-full border-white/80 bg-violet-50/95 text-center tracking-wide text-indigo-950 shadow-[0_4px_0_#b995ff]"
          style={{
            marginTop: subtitulo.marginTop, fontSize: subtitulo.fontSize, fontWeight: subtitulo.fontWeight,
            width: subtitulo.width ?? 'auto', padding: `${subtitulo.paddingY}px ${subtitulo.paddingX}px`,
            borderStyle: 'solid', borderWidth: subtitulo.borderWidth,
          }}
        >
          EXPERIMENTA Y DALE FORMA A TUS IDEAS
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4" style={{ marginTop: boton.marginTop }}>
          <button
            onClick={onPlay}
            className="flex items-center justify-center gap-4 rounded-full border-[5px] border-white bg-gradient-to-b from-green-300 via-green-500 to-green-600 text-white shadow-[0_10px_0_#157a34,0_18px_28px_rgba(20,0,60,.45)] transition-transform duration-100 hover:-translate-y-1 hover:brightness-110 active:translate-y-2 active:shadow-[0_2px_0_#157a34,0_6px_12px_rgba(20,0,60,.4)]"
            style={{
              fontSize: boton.fontSize, fontWeight: boton.fontWeight, textShadow: '0 3px 0 #157a34',
              width: boton.width ?? 'auto', height: boton.height ?? 'auto', padding: `${boton.paddingY}px ${boton.paddingX}px`,
            }}
          >
            <span className="text-[.85em]" aria-hidden="true">▶</span>
            ¡JUGAR!
          </button>

          <button
            onClick={() => setShowInstructions(true)}
            className="flex items-center justify-center gap-3 rounded-full border-[5px] border-white bg-gradient-to-b from-pink-400 via-pink-500 to-rose-600 text-white shadow-[0_10px_0_#9f1239,0_18px_28px_rgba(20,0,60,.45)] transition-transform duration-100 hover:-translate-y-1 hover:brightness-110 active:translate-y-2 active:shadow-[0_2px_0_#9f1239,0_6px_12px_rgba(20,0,60,.4)]"
            style={{
              fontSize: 22, fontWeight: 800, textShadow: '0 3px 0 #9f1239',
              padding: '18px 36px',
            }}
          >
            <span aria-hidden="true">📖</span>
            INSTRUCCIONES
          </button>

          <button
            type="button"
            onClick={() => setShowIntro(true)}
            className="rounded-full border-[5px] border-white bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 text-indigo-950 shadow-[0_10px_0_#b45309,0_18px_28px_rgba(20,0,60,.45)] font-extrabold transition-transform duration-100 hover:-translate-y-1 hover:brightness-110 active:translate-y-2 active:shadow-[0_2px_0_#b45309,0_6px_12px_rgba(20,0,60,.4)]"
            style={{ fontSize: 22, padding: '18px 36px' }}
          >
            🎬 VER HISTORIA
          </button>
        </div>
      </div>

      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Introducción">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[28px] border-[5px] border-white bg-black shadow-[0_14px_40px_rgba(0,0,0,.7)]">
            <button
              type="button"
              onClick={() => setShowIntro(false)}
              className="absolute right-3 top-3 z-10 rounded-full border-4 border-white bg-rose-500 px-4 py-1.5 text-sm font-black text-white shadow-[0_4px_0_#9f1239]"
            >
              SALTAR INTRO ⏭
            </button>
            <video
              src={INTRO_VIDEO_SRC}
              autoPlay
              controls
              playsInline
              onEnded={() => setShowIntro(false)}
              className="max-h-[78dvh] w-full bg-black object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
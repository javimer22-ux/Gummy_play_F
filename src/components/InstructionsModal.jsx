import { useState, useEffect, useCallback } from 'react';

/* Efecto pop suave integrado */
function playBubblePop() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(760, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {
    // Ignorar si el navegador bloquea audio
  }
}

/* Definiciones compartidas de degradados estilo ilustración editorial */
function SharedDefs() {
  return (
    <defs>
      <linearGradient id="im-pot-metal" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#6b6880" />
        <stop offset="22%" stopColor="#b5b2c8" />
        <stop offset="48%" stopColor="#dfdde9" />
        <stop offset="78%" stopColor="#8e8ba3" />
        <stop offset="100%" stopColor="#58556b" />
      </linearGradient>
      <linearGradient id="im-pot-rim" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#8c89a1" />
        <stop offset="50%" stopColor="#ebe9f5" />
        <stop offset="100%" stopColor="#6f6c82" />
      </linearGradient>
      <radialGradient id="im-base-mix" cx="45%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#fde6c4" />
        <stop offset="65%" stopColor="#eab983" />
        <stop offset="100%" stopColor="#c88d55" />
      </radialGradient>
      <radialGradient id="im-pink-mix" cx="45%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#ff9ebb" />
        <stop offset="60%" stopColor="#f43f75" />
        <stop offset="100%" stopColor="#be185d" />
      </radialGradient>
      <linearGradient id="im-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.7" />
      </linearGradient>
      <linearGradient id="im-bowl-blue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7da2d6" />
        <stop offset="60%" stopColor="#4f74ab" />
        <stop offset="100%" stopColor="#355280" />
      </linearGradient>
      <linearGradient id="im-spatula" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff7aa8" />
        <stop offset="100%" stopColor="#db2777" />
      </linearGradient>
      <linearGradient id="im-stove" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4a4458" />
        <stop offset="100%" stopColor="#262230" />
      </linearGradient>
    </defs>
  );
}

/* Fondo acuarela pastel + destellos dibujados a mano idénticos a la guía */
function IllustratedBackdrop() {
  return (
    <g>
      <path d="M25 45 Q90 10 185 28 Q290 12 345 65 Q375 130 335 190 Q260 225 165 212 Q60 225 22 175 Q-5 110 25 45 Z" fill="#fce7f3" />
      <path d="M45 140 Q180 115 325 145 Q345 195 275 215 Q175 225 75 210 Q25 190 45 140 Z" fill="#fbcfe8" opacity="0.7" />
      {/* Trazos decorativos estilo pincel */}
      <path d="M24 62 Q36 56 44 64" fill="none" stroke="#f472b6" strokeWidth="4" strokeLinecap="round" />
      <path d="M20 74 Q32 72 38 78" fill="none" stroke="#f472b6" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M322 46 L336 36" stroke="#facc15" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M328 60 L344 56" stroke="#facc15" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M34 156 L46 164" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

/* Olla metálica ilustrada en perspectiva 3/4 con estufa y mezcla */
function IllustratedPot({ liquidFill = 'url(#im-base-mix)', showSpatula = true, children }) {
  return (
    <g>
      {/* Base de hornilla / estufa */}
      <path d="M88 188 L108 172 H252 L272 188 L280 214 H80 Z" fill="url(#im-stove)" stroke="#2c2238" strokeWidth="3.5" strokeLinejoin="round" />
      <ellipse cx="180" cy="182" rx="74" ry="12" fill="#1e1a26" />

      {/* Asas laterales con volumen */}
      <path d="M98 124 C74 124, 72 146, 98 148" fill="none" stroke="#3a3548" strokeWidth="9" strokeLinecap="round" />
      <path d="M98 124 C74 124, 72 146, 98 148" fill="none" stroke="#8e8ba3" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M262 124 C286 124, 288 146, 262 148" fill="none" stroke="#3a3548" strokeWidth="9" strokeLinecap="round" />
      <path d="M262 124 C286 124, 288 146, 262 148" fill="none" stroke="#8e8ba3" strokeWidth="3.5" strokeLinecap="round" />

      {/* Cuerpo cilíndrico de la olla */}
      <path
        d="M96 106 V164 C96 192, 264 192, 264 164 V106 Z"
        fill="url(#im-pot-metal)"
        stroke="#2c2238"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Brillo vertical metálico */}
      <path d="M122 122 V174" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.32" />

      {/* Boca de la olla y mezcla interior */}
      <ellipse cx="180" cy="106" rx="84" ry="22" fill="url(#im-pot-rim)" stroke="#2c2238" strokeWidth="3.5" />
      <ellipse cx="180" cy="108" rx="75" ry="17" fill={liquidFill} stroke="#4a3b52" strokeWidth="2" />
      {/* Ondas suaves sobre la mezcla */}
      <path d="M136 109 Q164 116 196 108" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />

      {/* Espátula de silicona fucsia inclinada */}
      {showSpatula && (
        <g transform="translate(212, 82) rotate(32)">
          <rect x="11" y="0" width="8" height="34" rx="4" fill="#f3e8ff" stroke="#2c2238" strokeWidth="2.5" />
          <path d="M3 28 H27 L25 56 Q24 62 15 62 Q6 62 5 56 Z" fill="url(#im-spatula)" stroke="#2c2238" strokeWidth="2.5" />
          <path d="M9 34 V52" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        </g>
      )}

      {children}
    </g>
  );
}

const STEPS = [
  {
    num: 1,
    title: 'Hidratación',
    text: 'Espolvorea la gelatina sin sabor en agua fría y déjala reposar durante unos 5 minutos, hasta que se hidrate y esponje.',
    Illustration: () => (
      <svg viewBox="0 0 360 220" className="w-full h-full overflow-visible">
        <SharedDefs />
        <IllustratedBackdrop />

        <IllustratedPot liquidFill="url(#im-base-mix)" showSpatula={true}>
          {/* Estela y gránulos de gelatina cayendo */}
          <path d="M108 78 Q126 95 138 112" fill="none" stroke="#fef3c7" strokeWidth="14" strokeLinecap="round" opacity="0.7" />
          {[
            [106, 82, '0s'],
            [116, 90, '0.25s'],
            [124, 98, '0.5s'],
            [132, 105, '0.75s'],
            [114, 98, '0.4s'],
            [128, 92, '0.65s']
          ].map(([cx, cy, delay], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="2.6"
              fill="#fffbeb"
              stroke="#b45309"
              strokeWidth="0.9"
              className="animate-bounce"
              style={{ animationDelay: delay, animationDuration: '1s' }}
            />
          ))}

          {/* Sobre ilustrado de GELATINA en perspectiva */}
          <g transform="translate(36, 18) rotate(-26)">
            <rect x="0" y="0" width="66" height="82" rx="8" fill="#fff8fa" stroke="#2c2238" strokeWidth="3.5" />
            <path d="M0 14 H66" stroke="#f9a8d4" strokeWidth="4" />
            <rect x="7" y="23" width="52" height="22" rx="5" fill="#fbcfe8" />
            <text x="33" y="38" textAnchor="middle" fontSize="11" fontWeight="900" fill="#2c2238" letterSpacing="0.5">GELATINA</text>
            <path d="M33 55 C27 48, 19 54, 33 66 C47 54, 39 48, 33 55 Z" fill="#f472b6" />
          </g>

          {/* Reloj de reposo 05:00 - 05:30 */}
          <g transform="translate(262, 22)">
            <circle cx="34" cy="34" r="30" fill="#ffffff" stroke="#2c2238" strokeWidth="3.5" />
            <path d="M34 34 L34 12 A22 22 0 0 1 53 23 Z" fill="#4ade80" />
            <line x1="34" y1="34" x2="34" y2="16" stroke="#2c2238" strokeWidth="3" strokeLinecap="round" />
            <line x1="34" y1="34" x2="48" y2="26" stroke="#db2777" strokeWidth="3" strokeLinecap="round" />
            <circle cx="34" cy="34" r="3.5" fill="#2c2238" />
            <rect x="-2" y="68" width="72" height="20" rx="10" fill="#2c2238" />
            <text x="34" y="81" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fde047">05:00 - 05:30</text>
          </g>
        </IllustratedPot>
      </svg>
    )
  },
  {
    num: 2,
    title: 'Formulación',
    text: 'Toma tu gelatina hidratada y combínala con tu endulzante (azúcar o panela) y tu pigmento natural favorito.',
    Illustration: () => (
      <svg viewBox="0 0 360 220" className="w-full h-full overflow-visible">
        <SharedDefs />
        <IllustratedBackdrop />

        <IllustratedPot liquidFill="url(#im-pink-mix)" showSpatula={false}>
          {/* Chorro cristalino de agua */}
          <path d="M162 66 Q168 90 174 109" fill="none" stroke="#bae6fd" strokeWidth="11" strokeLinecap="round" opacity="0.85" className="animate-pulse" />
          <path d="M161 66 Q167 90 173 109" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

          {/* Jarra medidora transparente inclinada (centro-izquierda) */}
          <g transform="translate(124, 12) rotate(18)">
            <path d="M10 8 H54 L48 56 Q46 62 38 62 H26 Q18 62 16 56 Z" fill="url(#im-glass)" stroke="#2c2238" strokeWidth="3" />
            <path d="M14 28 H50 L47 54 Q45 59 38 59 H26 Q19 59 17 54 Z" fill="#7dd3fc" opacity="0.65" />
            <path d="M10 16 C-2 16, -2 42, 13 42" fill="none" stroke="#2c2238" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="24" y1="22" x2="34" y2="22" stroke="#2c2238" strokeWidth="2" />
            <line x1="24" y1="34" x2="32" y2="34" stroke="#2c2238" strokeWidth="2" />
          </g>

          {/* Cascada de azúcar / endulzante */}
          <path d="M244 66 Q220 82 212 108" fill="none" stroke="#fffbeb" strokeWidth="12" strokeLinecap="round" opacity="0.9" className="animate-pulse" />

          {/* Tazón cerámico azul con endulzante */}
          <g transform="translate(236, 18) rotate(-22)">
            <path d="M2 22 C2 48, 66 48, 66 22 Z" fill="url(#im-bowl-blue)" stroke="#2c2238" strokeWidth="3.5" />
            <ellipse cx="34" cy="22" rx="32" ry="9" fill="#bfdbfe" stroke="#2c2238" strokeWidth="3" />
            <path d="M6 21 Q34 4 62 21 Z" fill="#fffbeb" />
          </g>

          {/* Gotero de extracto de pitahaya / pigmento */}
          <g transform="translate(46, 28) rotate(32)">
            <rect x="8" y="18" width="32" height="46" rx="10" fill="#fda4af" stroke="#2c2238" strokeWidth="3" />
            <rect x="15" y="5" width="18" height="14" rx="5" fill="#2c2238" />
            <circle cx="24" cy="42" r="9" fill="#e11d48" />
          </g>
          <circle cx="98" cy="92" r="5.5" fill="#e11d48" stroke="#2c2238" strokeWidth="2" className="animate-bounce" />
        </IllustratedPot>
      </svg>
    )
  },
  {
    num: 3,
    title: 'Mezcla',
    text: 'Lleva los ingredientes al mezclador. ¡Acciónalo hasta que quede 100% homogéneo y sin grumos!',
    Illustration: () => (
      <svg viewBox="0 0 360 220" className="w-full h-full overflow-visible">
        <SharedDefs />
        <IllustratedBackdrop />

        <IllustratedPot liquidFill="url(#im-pink-mix)" showSpatula={false}>
          {/* Espirales de homogenización en la mezcla */}
          <ellipse cx="180" cy="108" rx="56" ry="11" fill="none" stroke="#fbcfe8" strokeWidth="3" strokeDasharray="18 10" className="animate-spin" style={{ transformOrigin: '180px 108px', animationDuration: '5s' }} />
          <ellipse cx="180" cy="108" rx="34" ry="7" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="12 8" />

          {/* Batidor / Agitador industrial ilustrado */}
          <g className="animate-bounce" style={{ animationDuration: '1.8s' }}>
            <rect x="152" y="10" width="56" height="24" rx="10" fill="#7c3aed" stroke="#2c2238" strokeWidth="3.5" />
            <rect x="174" y="34" width="12" height="72" rx="5" fill="#cbd5e1" stroke="#2c2238" strokeWidth="3" />
            <path d="M150 96 Q180 116 210 96" fill="none" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M156 88 Q180 108 204 88" fill="none" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
          </g>

          {/* Etiqueta flotante 100% Homogéneo */}
          <g transform="translate(248, 28)">
            <rect x="0" y="0" width="88" height="36" rx="18" fill="#22c55e" stroke="#2c2238" strokeWidth="3.5" />
            <text x="44" y="23" textAnchor="middle" fontSize="13" fontWeight="900" fill="#ffffff">100% LISO</text>
          </g>
        </IllustratedPot>
      </svg>
    )
  },
  {
    num: 4,
    title: 'Cocción',
    text: 'Lleva la mezcla a la marmita. Mantén la temperatura dentro del límite de la receta para no degradar el color natural.',
    Illustration: () => (
      <svg viewBox="0 0 360 220" className="w-full h-full overflow-visible">
        <SharedDefs />
        <IllustratedBackdrop />

        <IllustratedPot liquidFill="url(#im-pink-mix)" showSpatula={true}>
          {/* Llamas suaves debajo de la olla */}
          {[142, 180, 218].map((x, idx) => (
            <path
              key={x}
              d={`M${x} 184 Q${x - 11} 166 ${x} 152 Q${x + 11} 166 ${x} 184 Z`}
              fill="#fb923c"
              stroke="#e11d48"
              strokeWidth="2.2"
              className="animate-pulse"
              style={{ animationDelay: `${idx * 0.25}s` }}
            />
          ))}

          {/* Vapor aromático suave */}
          <path d="M142 74 Q134 58 144 44" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.75" className="animate-pulse" />
          <path d="M180 68 Q188 50 178 34" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.75" className="animate-pulse" style={{ animationDelay: '0.4s' }} />

          {/* Termómetro ilustrado con marca verde a 40°C */}
          <g transform="translate(278, 22)">
            <rect x="10" y="0" width="24" height="122" rx="12" fill="#ffffff" stroke="#2c2238" strokeWidth="3.5" />
            <rect x="16" y="60" width="12" height="58" rx="6" fill="#22c55e" />
            <circle cx="22" cy="126" r="16" fill="#22c55e" stroke="#2c2238" strokeWidth="3.5" />
            <circle cx="17" cy="121" r="4" fill="#ffffff" opacity="0.6" />
            <line x1="2" y1="58" x2="42" y2="58" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="44" y="45" width="44" height="24" rx="8" fill="#15803d" />
            <text x="66" y="61" textAnchor="middle" fontSize="12" fontWeight="900" fill="#ffffff">40°C</text>
          </g>
        </IllustratedPot>
      </svg>
    )
  },
  {
    num: 5,
    title: 'Moldeado y enfriamiento',
    text: 'Vierte la mezcla con mucho cuidado en los moldes de silicona y mándalos al refrigerador para que solidifiquen perfecto.',
    Illustration: () => (
      <svg viewBox="0 0 360 220" className="w-full h-full overflow-visible">
        <SharedDefs />
        <IllustratedBackdrop />

        {/* Molde de silicona en perspectiva 3/4 con sombra */}
        <path d="M54 128 L82 96 H278 L306 128 V174 Q306 188 290 188 H70 Q54 188 54 174 Z" fill="#38bdf8" stroke="#2c2238" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M54 128 L82 96 H278 L306 128 Z" fill="#7dd3fc" stroke="#2c2238" strokeWidth="3.5" strokeLinejoin="round" />

        {/* Cavidades con gomitas brillantes desmoldando */}
        {[118, 180, 242].map((cx, i) => (
          <g key={cx}>
            <ellipse cx={cx} cy="113" rx="22" ry="9" fill="#0284c7" />
            <g className="animate-bounce" style={{ animationDelay: `${i * 0.25}s`, animationDuration: '1.6s' }}>
              <circle cx={cx - 10} cy="96" r="6.5" fill="#f43f75" stroke="#2c2238" strokeWidth="2.5" />
              <circle cx={cx + 10} cy="96" r="6.5" fill="#f43f75" stroke="#2c2238" strokeWidth="2.5" />
              <circle cx={cx} cy="107" r="14" fill="url(#im-pink-mix)" stroke="#2c2238" strokeWidth="3" />
              <ellipse cx={cx - 5} cy="102" rx="4" ry="2.5" fill="#ffffff" opacity="0.85" />
            </g>
          </g>
        ))}

        {/* Cristales de frío */}
        {[
          [88, 44, '0s'],
          [180, 30, '0.35s'],
          [272, 46, '0.7s']
        ].map(([x, y, delay], idx) => (
          <g key={idx} transform={`translate(${x}, ${y})`} className="animate-pulse" style={{ animationDelay: delay }}>
            <line x1="-12" y1="0" x2="12" y2="0" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="0" y1="-12" x2="0" y2="12" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="-8" y1="-8" x2="8" y2="8" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <line x1="8" y1="-8" x2="-8" y2="8" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
      </svg>
    )
  }
];

export default function InstructionsModal({ isOpen, onClose }) {
  const [stepIndex, setStepIndex] = useState(0);

  const goPrev = useCallback(() => {
    playBubblePop();
    setStepIndex((prev) => (prev > 0 ? prev - 1 : STEPS.length - 1));
  }, []);

  const goNext = useCallback(() => {
    playBubblePop();
    setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : 0));
  }, []);

  const handleClose = useCallback(() => {
    playBubblePop();
    setStepIndex(0);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, goPrev, goNext, handleClose]);

  if (!isOpen) return null;

  const current = STEPS[stepIndex];
  const Illustration = current.Illustration;
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Instrucciones de producción"
    >
      <div
        className="relative w-full max-w-xl rounded-[32px] border-[5px] border-[#2c2238] bg-[#fff5fa] p-5 sm:p-7 shadow-[0_14px_0_#2c2238] text-[#2c2238]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="Cerrar instrucciones"
          className="absolute -top-4 -right-4 flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#2c2238] bg-[#fb7185] text-xl font-black text-white shadow-[0_4px_0_#2c2238] transition hover:scale-105 active:translate-y-0.5"
        >
          ✕
        </button>

        {/* Banner introductorio */}
        <div className="mb-4 rounded-2xl border-2 border-pink-200 bg-white/90 px-4 py-2 text-center shadow-sm">
          <p className="text-sm sm:text-base font-extrabold text-[#831843]">
            ¡Atento al proceso de producción!
          </p>
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Sigue estos pasos para que tu lote salga perfecto:
          </p>
        </div>

        {/* Cabecera estilo guía: círculo fucsia + píldora de título con destellos */}
        <div className="flex items-center gap-3 sm:gap-4 mb-2.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#db2777] text-3xl font-black text-white shadow-[0_4px_0_#9d174d]">
            {current.num}
          </div>

          <div className="relative flex-1 rounded-full bg-[#fbcfe8] px-6 py-2">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#2c2238]">
              {current.title}
            </h3>
            <span className="absolute -top-1 right-3 text-amber-400 font-black text-lg select-none">✦</span>
            <span className="absolute -bottom-1 right-7 text-amber-400 font-black text-sm select-none">✦</span>
          </div>
        </div>

        {/* Texto del paso */}
        <p className="min-h-[4.2rem] px-2 text-center text-base sm:text-lg font-extrabold leading-snug text-[#2c2238]">
          {current.text}
        </p>

        {/* Escena ilustrada + flechas laterales */}
        <div className="relative my-2 flex items-center justify-between gap-2">
          <button
            onClick={goPrev}
            aria-label="Paso anterior"
            className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-[#2c2238] bg-[#fde047] text-2xl font-black text-[#2c2238] shadow-[0_4px_0_#2c2238] transition hover:bg-amber-300 active:translate-y-0.5"
          >
            ←
          </button>

          <div className="h-52 sm:h-60 flex-1 rounded-3xl overflow-hidden">
            <Illustration />
          </div>

          <button
            onClick={goNext}
            aria-label="Siguiente paso"
            className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-[#2c2238] bg-[#fde047] text-2xl font-black text-[#2c2238] shadow-[0_4px_0_#2c2238] transition hover:bg-amber-300 active:translate-y-0.5"
          >
            →
          </button>
        </div>

        {/* Puntitos indicadores + botón de acción */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {STEPS.map((s, idx) => (
              <button
                key={s.num}
                onClick={() => {
                  playBubblePop();
                  setStepIndex(idx);
                }}
                aria-label={`Ir al paso ${s.num}`}
                className={`h-3.5 rounded-full border-2 border-[#2c2238] transition-all ${
                  idx === stepIndex ? 'w-9 bg-[#db2777]' : 'w-3.5 bg-pink-200 hover:bg-pink-300'
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={handleClose}
              className="w-full sm:w-auto rounded-2xl border-4 border-[#2c2238] bg-[#4ade80] px-5 py-2 text-sm sm:text-base font-black text-[#2c2238] shadow-[0_4px_0_#2c2238] transition hover:bg-green-300 active:translate-y-0.5"
            >
              ¡ENTENDIDO, A COCINAR! ✓
            </button>
          ) : (
            <button
              onClick={goNext}
              className="w-full sm:w-auto rounded-2xl border-4 border-[#2c2238] bg-[#fde047] px-5 py-2 text-sm sm:text-base font-black text-[#2c2238] shadow-[0_4px_0_#2c2238] transition hover:bg-amber-300 active:translate-y-0.5"
            >
              SIGUIENTE PASO →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
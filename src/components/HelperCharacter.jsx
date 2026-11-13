import { useState } from 'react';

// Ingeniera Agroindustrial (EPN), guía del jugador. Imagen (PNG sin fondo): public/assets/ingeniera_guia.png
//   variant="compact"  (por defecto): horizontal y pequeña, para el pie oscuro del zoom-in, junto al botón verde.
//   variant="floating": grande, "parada" en la esquina inferior derecha de la vista general de la fábrica.
// type: 'info' | 'warning' (borde de aviso, p. ej. Cocción)
const AVATAR_SRC = '/assets/ingeniera_guia.png';

/* ── Pequeña: pie del zoom-in ── */
function Compact({ text, warning, imgFailed, onImgError }) {
  return (
    <div className="animate-fade-in-up flex min-w-0 items-center gap-3" role={warning ? 'alert' : 'status'}>
      <div className="h-18 w-16 shrink-0 overflow-hidden rounded-full bg-gradient-to-b from-violet-300 to-sky-300 ring-2 ring-white/80 shadow-lg">
        {imgFailed ? (
          <span className="grid h-full w-full place-items-center text-sm font-extrabold text-indigo-950">IA</span>
        ) : (
          <img
            src={AVATAR_SRC} alt="Ingeniera Agroindustrial, guía del laboratorio" draggable={false} onError={onImgError}
            className="h-full w-full object-cover"
            style={{ objectPosition: '50% 0%', transformOrigin: '50% 12%', transform: 'scale(1.55)' }}
          />
        )}
      </div>
      <div
        className={`relative min-w-0 rounded-xl border bg-indigo-950/80 px-4 py-2 text-lg leading-snug text-white/90 shadow-lg ${
          warning ? 'border-orange-500 shadow-[0_0_12px_rgba(249,115,22,.5)]' : 'border-white/10'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute -left-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-b border-l bg-indigo-950 ${
            warning ? 'border-orange-500' : 'border-white/10'
          }`}
        />
        <p className="relative m-0">{text}</p>
      </div>
    </div>
  );
}

/* ── Grande: vista general ── */
function Floating({ text, warning, imgFailed, onImgError }) {
  return (
    // pointer-events-none: nunca bloquea los botones que tenga debajo
    <div className="pointer-events-none fixed bottom-0 right-8 z-40 flex max-w-[calc(100vw-1rem)] items-end gap-1">
      <div
        key={text}
        role={warning ? 'alert' : 'status'}
        className={`animate-fade-in relative mb-32 w-60 max-w-full rounded-2xl border-2 bg-indigo-950/90 p-4 text-sm font-semibold leading-snug text-white shadow-xl backdrop-blur-sm ${
          warning ? 'border-amber-400 shadow-[0_0_16px_rgba(251,191,36,.55)] animate-pulse' : 'border-white/20'
        }`}
      >
        <p className="m-0">{text}</p>
        <span
          aria-hidden="true"
          className={`absolute -right-[9px] top-8 h-4 w-4 rotate-45 border-r-2 border-t-2 bg-indigo-950 ${
            warning ? 'border-amber-400' : 'border-white/20'
          }`}
        />
      </div>
      {!imgFailed && (
        <img
          src={AVATAR_SRC} alt="Ingeniera Agroindustrial, guía del laboratorio" draggable={false} onError={onImgError}
          className="animate-fade-in h-[min(32vh,15rem)] w-auto shrink-0 select-none object-contain drop-shadow-[0_6px_6px_rgba(27,30,75,.4)]"
        />
      )}
    </div>
  );
}

export default function HelperCharacter({ text, type = 'info', variant = 'compact' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const props = { text, warning: type === 'warning', imgFailed, onImgError: () => setImgFailed(true) };
  return variant === 'floating' ? <Floating {...props} /> : <Compact {...props} />;
}

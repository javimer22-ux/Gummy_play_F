import { useEffect, useRef, useState } from 'react';

/* Foco del tutorial: difumina y oscurece todo menos lo que toca usar (solo visual, no toca la lógica del juego).
   - Antes de operar la estación: ilumina la máquina de la estación actual y su botón «OPERAR ESTACIÓN».
   - Estación terminada: ilumina solo la flecha → de la cinta.
   Se oculta mientras la vista ampliada de la estación está abierta (ahí manda la ingeniera del pie).
   Las posiciones se miden sobre el elemento real y se corrigen por la escala del lienzo, así que sigue
   funcionando igual en el lienzo 1280×720 y en pantallas pequeñas. */
const PAD = 10;
const RADIUS = 16;

const rrect = (x, y, w, h, r) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;

export default function TutorialSpotlight({ station, stepDone, onSkip }) {
  const rootRef = useRef(null);
  const lastKey = useRef('');
  const [view, setView] = useState({ w: 0, h: 0, holes: [], scaled: false });

  useEffect(() => {
    const measure = () => {
      const root = rootRef.current;
      if (!root) return;
      let next = { w: 0, h: 0, holes: [], scaled: false };
      if (!document.querySelector('.gl-zoom')) {
        const rr = root.getBoundingClientRect();
        const sc = rr.width / (root.offsetWidth || rr.width || 1) || 1;
        const slots = document.querySelectorAll('.gl-machine-slot');
        const targets = stepDone
          ? [document.querySelector('[data-tut="next"]')]
          : [slots[station - 1], document.querySelector('[data-tut="operate"]')];
        const holes = targets.filter(Boolean).map((el) => {
          const r = el.getBoundingClientRect();
          return { x: (r.left - rr.left) / sc - PAD, y: (r.top - rr.top) / sc - PAD, w: r.width / sc + PAD * 2, h: r.height / sc + PAD * 2 };
        }).filter((h) => h.w > 0 && h.h > 0);
        next = { w: root.offsetWidth, h: root.offsetHeight, holes, scaled: Math.abs(sc - 1) > 0.01 };
      }
      const key = JSON.stringify(next, (k, v) => (typeof v === 'number' ? Math.round(v) : v));
      if (key !== lastKey.current) { lastKey.current = key; setView(next); }
    };
    measure();
    const id = setInterval(measure, 200);
    window.addEventListener('resize', measure);
    return () => { clearInterval(id); window.removeEventListener('resize', measure); };
  }, [station, stepDone]);

  const { w, h, holes, scaled } = view;
  const path = w && h && holes.length
    ? `M0 0H${w}V${h}H0Z ${holes.map((o) => {
      const x = Math.max(0, o.x); const y = Math.max(0, o.y);
      return rrect(x, y, Math.min(o.w, w - x), Math.min(o.h, h - y), RADIUS);
    }).join(' ')}`
    : null;

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-30">
      {path && (
        <>
          {/* Capa oscura: bloquea los clics, salvo en los huecos iluminados. Difuminada en pantallas normales;
              en el lienzo escalado (móvil) solo se oscurece más, para no depender del blur */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'auto', clipPath: `path(evenodd, '${path}')`,
              background: scaled ? 'rgba(15,10,45,.74)' : 'rgba(15,10,45,.6)',
              ...(scaled ? null : { WebkitBackdropFilter: 'blur(4px)', backdropFilter: 'blur(4px)' }),
            }}
          />
          {holes.map((o, i) => (
            <div
              key={i} aria-hidden="true"
              className="absolute animate-pulse rounded-2xl border-4 border-amber-300 motion-reduce:animate-none"
              style={{ left: o.x, top: o.y, width: o.w, height: o.h, boxShadow: '0 0 22px 4px rgba(253,224,71,.75)' }}
            />
          ))}
        </>
      )}
      <button
        type="button" onClick={onSkip}
        className="pointer-events-auto absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full border-2 border-white/80 bg-indigo-950/90 px-4 py-1 text-xs font-extrabold tracking-wide text-white shadow-lg hover:bg-indigo-800"
      >SALTAR GUÍA ✕</button>
    </div>
  );
}

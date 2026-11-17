import { useState } from 'react';
import { setSoundEnabled } from './utils/soundEngine';
import Gummy from './components/entities/Gummy';
import FactoryBackdrop from './components/entities/FactoryBackdrop';
import { CartoonTitle } from './StartScreen';

const OPTIONS = [
  { value: 1, label: '1 PEDIDO', sub: '(Tutorial)' },
  { value: 3, label: '3 PEDIDOS', sub: '(Corto)' },
  { value: 5, label: '5 PEDIDOS', sub: '(Medio)' },
  { value: 'infinite', label: 'INFINITO', sub: '(Práctica)' },
];

/** Estilo "arcade" 3D reutilizable para los botones */
const arcade = 'rounded-full border-4 font-extrabold tracking-wide transition-transform duration-100 active:translate-y-1.5';

export default function SetupScreen({ config, onBack, onStart }) {
  const [draft, setDraft] = useState({ soundOn: true, orderCount: 3, ...config });
  // stepIndex: 0 = 1 pedido | 1 = 3 | 2 = 5 | 3 = infinito  ->  orderCount: 1 | 3 | 5 | 'infinite'
const LAST_STEP = OPTIONS.length - 1;
const stepPct = (i) => (i * 100) / LAST_STEP; // 0 | 33.33 | 66.66 | 100
  const [stepIndex, setStepIndex] = useState(() => Math.max(0, OPTIONS.findIndex((o) => o.value === draft.orderCount)));
  const selectStep = (i) => {
    const n = Math.min(LAST_STEP, Math.max(0, Number(i)));
    setStepIndex(n);
    setDraft((d) => ({ ...d, orderCount: OPTIONS[n].value }));
  };
  const setSound = (soundOn) => { setDraft((d) => ({ ...d, soundOn })); setSoundEnabled(soundOn); };

  return (
    <div className="gl-app relative h-screen w-screen overflow-hidden" style={{ '--gl-belt-h': '4.2rem' }}>
      {/* Fondo de la fábrica desenfocado */}
      <div className="gl-scene blur-sm" style={{ position: 'absolute', inset: 0 }}>
        <FactoryBackdrop />
        <div className="gl-floor" />
      </div>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

      <div className="relative z-10 flex h-full items-center justify-center gap-6 px-4">
        {/* Panel de ajustes */}
        <section
          className="max-h-[92dvh] overflow-y-auto w-[min(46rem,94vw)] min-w-0 rounded-3xl border-4 border-yellow-400 bg-indigo-950/95 p-[clamp(1rem,3vh,2rem)] shadow-[0_0_0_4px_rgba(255,255,255,.08),0_20px_50px_rgba(0,0,0,.6)]"
          aria-labelledby="setup-title"
        >
          <h2 id="setup-title" className="m-0 mb-[2.5vh] text-center">
            <CartoonTitle className="text-center sm:whitespace-nowrap text-[clamp(1rem,2.5vw,2rem)]">GUMMY LAB - AJUSTES DE TRABAJO</CartoonTitle>
          </h2>

          {/* SONIDO */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-black/35 px-5 py-3">
            <span className="mr-2 text-xl font-extrabold tracking-wide text-white">SONIDO</span>
            <button
              onClick={() => setSound(true)} aria-pressed={draft.soundOn}
              className={`${arcade} px-7 py-2 text-2xl ${draft.soundOn
                ? 'border-yellow-300 bg-gradient-to-b from-green-300 to-green-600 text-white shadow-[0_5px_0_#157a34,0_0_18px_rgba(250,204,21,.6)]'
                : 'border-transparent bg-slate-600/70 text-slate-300 shadow-[0_5px_0_#334155]'}`}
              style={draft.soundOn ? { textShadow: '0 2px 0 #157a34' } : undefined}
            >SÍ 🔊</button>
            <button
              onClick={() => setSound(false)} aria-pressed={!draft.soundOn}
              className={`${arcade} px-7 py-2 text-2xl ${!draft.soundOn
                ? 'border-yellow-300 bg-gradient-to-b from-rose-400 to-rose-600 text-white shadow-[0_5px_0_#9f1239,0_0_18px_rgba(250,204,21,.6)]'
                : 'border-transparent bg-slate-600/70 text-slate-300 shadow-[0_5px_0_#334155]'}`}
            >NO 🔇</button>
          </div>

          {/* NÚMERO DE PEDIDOS */}
          <div className="mb-5 rounded-2xl bg-black/35 px-5 pb-4 pt-3">
            <p className="m-0 mb-2 text-center text-xl font-extrabold tracking-wide text-white">NÚMERO DE PEDIDOS</p>

            <div className="rounded-2xl border-4 border-yellow-400 bg-gradient-to-b from-violet-600 to-indigo-700 px-[clamp(2.5rem,8vw,5rem)] pb-3 pt-3 shadow-[inset_0_-6px_12px_rgba(0,0,0,.25)]">
              {/* Riel: input range invisible encima para arrastrar con mouse o dedo */}
              <div className="relative h-14">
                <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-7 -translate-y-1/2 rounded-full border-2 border-cyan-300/70 bg-indigo-950/80">
                  <div className="h-full rounded-full bg-gradient-to-b from-yellow-300 to-orange-500 transition-all duration-200" style={{ width: `${stepPct(stepIndex)}%` }} />
                  {OPTIONS.map((_, i) => stepPct(i)).map((p) => (
                    <span key={p} className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" style={{ left: `${p}%` }} />
                  ))}
                </div>

                {/* Osito rojo */}
                <div
                  className="pointer-events-none absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
                  style={{ left: `${stepPct(stepIndex)}%` }}
                >
                  <Gummy shape="osito" color="#ff3d5a" size={58} shadow={false} />
                </div>

                <input
                  type="range" min="0" max={LAST_STEP} step="1" value={stepIndex}
                  onChange={(e) => selectStep(e.target.value)}
                  aria-label="Número de pedidos"
                  aria-valuetext={`${OPTIONS[stepIndex].label} ${OPTIONS[stepIndex].sub}`}
                  className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                />
              </div>

              {/* Etiquetas clickeables, centradas bajo cada posición */}
              <div className="relative mt-1 h-12">
                {OPTIONS.map((o, i) => {
                  const active = i === stepIndex;
                  return (
                    <button
                      key={String(o.value)} type="button" onClick={() => selectStep(i)} aria-pressed={active}
                      className={`absolute top-0 z-30 -translate-x-1/2 cursor-pointer whitespace-nowrap rounded-xl px-2 text-center font-extrabold leading-tight transition-colors duration-200 ${active ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,.8)]' : 'text-violet-200 hover:text-white'}`}
                      style={{ left: `${stepPct(i)}%` }}
                    >
                      <span className="block text-[clamp(.85rem,1.8vw,1.3rem)]">
                        {o.value === 'infinite' ? <><span className="mr-1 text-2xl" aria-hidden="true">∞</span>{o.label}</> : o.label}
                      </span>
                      <span className="block text-[clamp(.7rem,1.4vw,1rem)] opacity-90">{o.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Botones inferiores */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => onBack?.(draft)}
              className={`${arcade} border-white/80 bg-gradient-to-b from-orange-400 to-red-600 px-7 py-2.5 text-[clamp(1.1rem,2.2vw,1.7rem)] text-white shadow-[0_6px_0_#8a1c1c] hover:brightness-110`}
              style={{ textShadow: '0 2px 0 #8a1c1c' }}
            >⬅ VOLVER</button>
            <button
              onClick={() => onStart(draft)}
              className={`${arcade} border-white/80 bg-gradient-to-b from-green-300 via-green-500 to-green-600 px-8 py-2.5 text-[clamp(1.1rem,2.2vw,1.7rem)] text-white shadow-[0_6px_0_#157a34] hover:brightness-110`}
              style={{ textShadow: '0 2px 0 #157a34' }}
            >¡INICIAR TURNO! ▶</button>
          </div>
        </section>

        {/* Ingeniera a la derecha del panel */}
        <img
          src="/assets/ingeniera_guia.png" alt=""
          className="pointer-events-none hidden h-[min(60vh,32rem)] w-auto shrink-0 select-none self-end drop-shadow-[0_8px_12px_rgba(0,0,0,.5)] lg:block"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
    </div>
  );
}

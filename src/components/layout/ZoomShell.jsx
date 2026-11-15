import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../context/GameContext';
import OrderTicketMini from './OrderTicketMini';
import HelperCharacter from '../HelperCharacter';

/* Plantilla maestra de la vista ampliada (mismas clases gl-zoom* que la Estación de Hidratación):
   footer con título + botón de acercar, y overlay a pantalla completa con
   máquina (izquierda), panel de cristal (derecha) y botón verde de salida. */

export const INK = '#1b1e4b';
export const mmss = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

/* Reloj digital de 7 segmentos ("MM:SS") */
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
function Digit({ d, x }) {
  const w = 30, h = 54, t = 7, on = SEG[d] ?? '';
  const seg = (k, sx, sy, sw, sh) => <rect key={k} x={x + sx} y={sy} width={sw} height={sh} rx={t / 2} fill={on.includes(k) ? '#fff' : 'rgba(255,255,255,.07)'} />;
  return (
    <>
      {seg('a', 4, 0, w - 8, t)}{seg('g', 4, h / 2 - t / 2, w - 8, t)}{seg('d', 4, h - t, w - 8, t)}
      {seg('f', 0, 4, t, h / 2 - 6)}{seg('b', w - t, 4, t, h / 2 - 6)}
      {seg('e', 0, h / 2 + 2, t, h / 2 - 6)}{seg('c', w - t, h / 2 + 2, t, h / 2 - 6)}
    </>
  );
}
export function SegDisplay({ text }) {
  return (
    <svg viewBox="0 0 170 56" className="gl-zoom__digits" role="img" aria-label={text}>
      <Digit d={text[0]} x={2} /><Digit d={text[1]} x={38} />
      <circle cx="82" cy="19" r="4" fill="#fff" /><circle cx="82" cy="37" r="4" fill="#fff" />
      <Digit d={text[3]} x={98} /><Digit d={text[4]} x={134} />
    </svg>
  );
}

/* Tubería gris con bandas (decoración de las máquinas) */
export function Pipe({ d, bands = [] }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={INK} strokeWidth="46" />
      <path d={d} stroke="#9aa3c2" strokeWidth="34" />
      <path d={d} stroke="#fff" strokeWidth="6" opacity=".35" transform="translate(-7 -7)" />
      {bands.map(([x, y, vertical]) => (
        <rect key={x + '-' + y} x={vertical ? x - 26 : x - 8} y={vertical ? y - 8 : y - 26} width={vertical ? 52 : 16} height={vertical ? 16 : 52} rx="5" fill="#7a84ad" stroke={INK} strokeWidth="3.5" />
      ))}
    </g>
  );
}

/* ───────── Guía contextual: ¿ya se completó la acción de la estación? ¿hay que resaltar? ─────────
   Tutorial (orderCount === 1): el resaltado está siempre activo.
   Turnos reales (3, 5, infinito): apagado, salvo que pasen 8 s sin acciones en la estación (salvavidas). */
const IDLE_MS = 8000;
export function useStationGuide() {
  const { activeTray, config } = useGame();
  const isTutorial = config?.orderCount === 1;
  const station = activeTray.station;
  const stepDone = ({
    1: activeTray.hasLumps !== null,
    2: Boolean(activeTray.base && activeTray.pigment),
    3: activeTray.mixLevel >= 100,
    4: activeTray.temperature > 20,
    5: Boolean(activeTray.shape),
    6: Boolean(activeTray.finalTexture),
  })[station] ?? false;

  // "Acción" = pulsar un botón habilitado; cada una (o cambiar de estación) reinicia la cuenta de 8 s
  const [idle, setIdle] = useState(false);
  const [activity, setActivity] = useState(0);
  useEffect(() => {
    const onDown = (e) => { if (e.target.closest?.('button:not(:disabled)')) setActivity((n) => n + 1); };
    window.addEventListener('pointerdown', onDown, true);
    return () => window.removeEventListener('pointerdown', onDown, true);
  }, []);
  useEffect(() => {
    setIdle(false);
    const id = setTimeout(() => setIdle(true), IDLE_MS);
    return () => clearTimeout(id);
  }, [station, activity]);

  return { isTutorial, stepDone, hint: isTutorial || idle };
}

/* Fotografía de la ventana del fondo según la estación (1 a 7) */
const STATION_WINDOWS = { 1: '/assets/ventana-1.jpg', 2: '/assets/ventana-2.jpg', 3: '/assets/ventana-3.jpg', 4: '/assets/ventana-4.jpg', 5: '/assets/ventana-5.jpg', 6: '/assets/ventana-6.jpg', 7: '/assets/ventana-7.jpg' };

/* Diálogos del tutorial por estación: [pendiente, completada] */
const TUTORIAL_TEXT = {
  1: ['Espolvorea la gelatina sin sabor en agua fría y espera a que esponje.', "¡Gelatina hidratada! Pulsa 'Confirmar y alejar cámara'."],
  2: ['Elige el endulzante y el pigmento natural que pide la orden arriba.', "¡Ingredientes listos! Pulsa 'Confirmar y alejar cámara'."],
  3: ["Presiona 'Agitar' hasta llevar la homogeneidad al 100%.", '¡Mezcla 100% homogénea! Confirma y aleja la cámara.'],
  4: ['Calienta dentro del rango marcado por las flechitas sin pasarte del límite del pigmento.', '¡Temperatura perfecta! Confirma y aleja la cámara.'],
  5: ['Selecciona el molde exacto del pedido y vierte la mezcla.', '¡Moldes llenos! Confirma y aleja la cámara.'],
  6: ['Enfría hasta la zona marcada por las flechitas para solidificar las gomitas.', '¡Gomitas firmes y desmoldadas! Sal para ir a Control de Calidad.'],
};
export const tutorialText = (n, done) => TUTORIAL_TEXT[n]?.[done ? 1 : 0];

export default function ZoomShell({ badge, num, title, isZoomedIn, onOpen, onConfirm, machine, machineClass = '', helper = null, done = false, children }) {
  const { isTutorial, stepDone, hint } = useStationGuide();
  const tut = isTutorial ? tutorialText(parseInt(num, 10), done) : null;
  const windowSrc = STATION_WINDOWS[parseInt(num, 10)] || '/assets/fondo-nanegal.jpg';

  // Con la vista abierta, los atajos de teclado de la cinta no deben actuar
  useEffect(() => {
    if (!isZoomedIn) return undefined;
    const block = (e) => { if (e.key.startsWith('Arrow')) e.stopPropagation(); };
    window.addEventListener('keydown', block, true);
    return () => window.removeEventListener('keydown', block, true);
  }, [isZoomedIn]);

  const zoomView = isZoomedIn && (
    <div className="gl-zoom" role="dialog" aria-modal="true" aria-label={title}>
      <div className="gl-zoom__scene" aria-hidden="true">
        <div
          className="gl-zoom__window"
          style={{
            // capas (de arriba a abajo): reflejos del vidrio, fotografía y cielo de respaldo si la imagen no carga
            backgroundImage: `linear-gradient(115deg, rgba(255,255,255,.24) 0 14%, transparent 14% 27%, rgba(255,255,255,.13) 27% 33%, transparent 33%), url(${windowSrc}), linear-gradient(#9fdcff, #d6f1ff)`,
            backgroundSize: '100% 100%, cover, 100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="gl-zoom__floor" />
        <div className="gl-zoom__belt" />
      </div>

      <div className="gl-zoom__stage">
        <div className={`gl-zoom__machine ${machineClass}`}>{machine}</div>

        <div className="gl-zoom__side">
          <div className="gl-zoom__glass">
            <OrderTicketMini />
            <h2 className="gl-zoom__ptitle">{title}</h2>
            {children}
          </div>
        </div>
      </div>

      {/* Pie oscuro: ayudante a la izquierda/centro, botón verde a la derecha */}
      <div className="gl-zoom__footer flex w-full items-center justify-between px-8">
        <div className="flex min-w-0 flex-1 justify-center">{tut ? <HelperCharacter key={String(done)} text={tut} /> : helper}</div>
        <div className="gl-zoom__exit">
          <button onClick={onConfirm} className="gl-btn gl-btn--xl">
            <span className="gl-zoom__tick">✔</span>
            <span>CONFIRMAR Y<br />ALEJAR CÁMARA</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="gl-panel">
      <div className="gl-panel__head">
        <span className="gl-panel__num" style={{ '--n1': badge[0], '--n2': badge[1] }}>{num}</span>
        <h2 className="gl-panel__title">{title}</h2>
      </div>
      <div className="gl-panel__body">
        <div className="gl-section" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={onOpen}
            className={`gl-btn gl-btn--gold gl-btn--xl ${!isZoomedIn && !stepDone && hint ? '!ring-4 ring-amber-300 !animate-pulse !shadow-[0_0_20px_#fde047]' : ''}`}
          >OPERAR ESTACIÓN</button>
        </div>
      </div>
      {zoomView && createPortal(zoomView, document.querySelector('.gl-app') ?? document.body)}
    </div>
  );
}

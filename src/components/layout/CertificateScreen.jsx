import { useEffect, useId } from 'react';
import { sfx } from '../../utils/soundEngine';
import Gummy from '../entities/Gummy';

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&display=swap';
const SERIF = "'Cormorant Garamond', 'Georgia', 'Times New Roman', serif";
const TITLE = "'Cinzel', 'Georgia', 'Times New Roman', serif";

const CSS = `
@import url('${FONT_URL}');
@keyframes cert-sign { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes cert-shine { 0% { transform: translateX(-120%) skewX(-20deg); } 100% { transform: translateX(260%) skewX(-20deg); } }
.cert-sign { stroke-dasharray: 1; stroke-dashoffset: 1; animation: cert-sign 2.2s ease-out forwards; }
.cert-shine { animation: cert-shine 3.2s ease-in-out 1.2s 1; }
@media print {
  body * { visibility: hidden !important; }
  .cert-print, .cert-print * { visibility: visible !important; }
  .cert-print { position: fixed !important; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 92vw !important; }
  .cert-shine { display: none; }
}
`;

const GOLD_TEXT = {
  backgroundImage: 'linear-gradient(180deg,#e9c55a 0%,#b9861f 48%,#8a5f12 52%,#d9ad3f 100%)',
  WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent',
};
const WINE_TEXT = {
  backgroundImage: 'linear-gradient(180deg,#b01f4a 0%,#7a1230 60%,#5a0b22 100%)',
  WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent',
};

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const longDate = (d = new Date()) => `${d.getDate()} de ${MESES[d.getMonth()][0].toUpperCase()}${MESES[d.getMonth()].slice(1)} de ${d.getFullYear()}`;

/** Sello dorado "ORIGEN SOSTENIBLE Y TRAZABILIDAD · ECUADOR" */
function GoldSeal({ className, style }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <defs>
        <radialGradient id={`g${uid}`} cx=".35" cy=".3" r=".85"><stop offset="0" stopColor="#fff0a8" /><stop offset=".45" stopColor="#e2b63e" /><stop offset="1" stopColor="#9a6a12" /></radialGradient>
        <path id={`p${uid}`} d="M50 50 m-33 0 a33 33 0 1 1 66 0 a33 33 0 1 1 -66 0" />
      </defs>
      {Array.from({ length: 28 }).map((_, i) => {
        const a = (i / 28) * Math.PI * 2;
        return <circle key={i} cx={50 + Math.cos(a) * 45.5} cy={50 + Math.sin(a) * 45.5} r="4.6" fill={`url(#g${uid})`} />;
      })}
      <circle cx="50" cy="50" r="45" fill={`url(#g${uid})`} stroke="#8a5f12" strokeWidth="1" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#7a520e" strokeWidth=".8" />
      <circle cx="50" cy="50" r="26" fill="none" stroke="#7a520e" strokeWidth=".8" />
      <text fontFamily={TITLE} fontWeight="800" fontSize="6.4" fill="#5e3f08" letterSpacing=".4">
        <textPath href={`#p${uid}`} startOffset="0">ORIGEN SOSTENIBLE Y TRAZABILIDAD · ECUADOR ·</textPath>
      </text>
      {/* hoja + vaina de cacao */}
      <path d="M50 66 C36 60 34 42 50 32 C66 42 64 60 50 66Z" fill="#8c5a10" opacity=".85" />
      <path d="M50 64 V36 M50 56 L41 48 M50 52 L59 44 M50 46 L43 40" stroke="#f3d98a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <text x="50" y="76" textAnchor="middle" fontFamily={TITLE} fontWeight="800" fontSize="6" fill="#5e3f08">ECUADOR</text>
    </svg>
  );
}

/** Sello de lacre rojo */
function WaxSeal({ className, style }) {
  const uid = useId().replace(/:/g, '');
  const pts = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const r = 44 + (i % 2 ? 3.2 : -1) + Math.sin(i * 1.7) * 2.4;
    return `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <defs><radialGradient id={`w${uid}`} cx=".35" cy=".3" r=".9"><stop offset="0" stopColor="#f0605a" /><stop offset=".5" stopColor="#b3162a" /><stop offset="1" stopColor="#6e0a18" /></radialGradient></defs>
      <polygon points={pts} fill={`url(#w${uid})`} stroke="#5a0814" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#7e0e1e" strokeWidth="2.4" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#ff8a82" strokeWidth=".6" opacity=".6" transform="translate(-.8 -.8)" />
      <text x="50" y="59" textAnchor="middle" fontFamily={TITLE} fontWeight="800" fontSize="26" fill="#7e0e1e" stroke="#ff8a82" strokeWidth=".4" paintOrder="stroke">GL</text>
    </svg>
  );
}

/** Firma "autógrafa" que se dibuja sola */
const Signature = ({ d, delay }) => (
  <svg viewBox="0 0 120 40" className="block w-full" style={{ height: '5.2cqw' }} aria-hidden="true">
    <path d={d} pathLength="1" className="cert-sign" style={{ animationDelay: delay }} fill="none" stroke="#1d2a63" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Certificado de Excelencia Agroindustrial.
 * Props: results (resultados del turno), score, onExit (volver al inicio).
 */
export default function CertificateScreen({ results = [], score = 0, onExit }) {
  useEffect(() => { sfx.fanfare(); }, []);
  const approved = results.filter((r) => r.status === 'approved');
  const lots = approved.map((r) => r.id).join(', ');

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 overflow-auto bg-black/75 px-3 py-4 backdrop-blur-sm" role="dialog" aria-label="Certificado de Excelencia Agroindustrial">
      <style>{CSS}</style>

      <p className="m-0 rounded-full border-2 border-yellow-300 bg-indigo-950/90 px-5 py-1.5 text-center text-sm font-extrabold tracking-wide text-yellow-300 shadow-lg sm:text-base">
        🏆 ¡TURNO PERFECTO! {approved.length}/{results.length} pedidos aprobados · {score} PTS
      </p>

      {/* ───────── Marco de madera ───────── */}
      <div className="cert-print animate-fade-in-up relative" style={{ width: 'min(52rem, 94vw, calc(74vh * 1.3))', aspectRatio: '1.3 / 1', containerType: 'inline-size' }}>
        <div
          className="absolute inset-0"
          style={{
            borderRadius: '1.2cqw',
            background: 'repeating-linear-gradient(92deg, rgba(0,0,0,.09) 0 2px, rgba(255,255,255,.035) 2px 6px), linear-gradient(135deg,#8a5430 0%,#54301a 42%,#6e3f20 68%,#3b1e0f 100%)',
            boxShadow: '0 2.4cqw 5cqw rgba(0,0,0,.65), inset 0 0 0 .25cqw #2a1408, inset .6cqw .6cqw 1.1cqw rgba(255,214,160,.28), inset -.7cqw -.7cqw 1.3cqw rgba(0,0,0,.55)',
          }}
        />
        {/* filete dorado interior */}
        <div className="absolute" style={{ inset: '4.2cqw', border: '.45cqw solid #d9ad3f', boxShadow: 'inset 0 0 .9cqw rgba(0,0,0,.55), 0 0 0 .2cqw #7a520e' }} />

        {/* ───────── Pergamino ───────── */}
        <div
          className="absolute overflow-hidden"
          style={{
            inset: '4.9cqw',
            background: 'radial-gradient(ellipse at 50% 40%, #fffaf0 0%, #f8ecd0 55%, #ecd9a8 100%)',
            boxShadow: 'inset 0 0 4cqw rgba(125,85,20,.38)',
            fontFamily: SERIF,
          }}
        >
          {/* doble borde elegante */}
          <div className="absolute" style={{ inset: '1.4cqw', border: '.35cqw solid #b8862b' }} />
          <div className="absolute" style={{ inset: '2.1cqw', border: '.12cqw solid #b8862b' }} />

          {/* brillo */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-white/30 cert-shine" />

          {/* Título */}
          <div className="absolute inset-x-0 text-center" style={{ top: '3.8cqw', fontFamily: TITLE, fontWeight: 800 }}>
            <div style={{ fontSize: '4.3cqw', letterSpacing: '.05em', lineHeight: 1.1, ...GOLD_TEXT }}>CERTIFICADO DE EXCELENCIA</div>
            <div style={{ fontSize: '5.3cqw', letterSpacing: '.08em', lineHeight: 1.1, ...WINE_TEXT }}>AGROINDUSTRIAL</div>
          </div>

          {/* Logo GUMMY LAB (izquierda) */}
          <div className="absolute flex flex-col items-center" style={{ left: '5.4cqw', top: '19cqw', width: '13cqw' }}>
            <div style={{ width: '9cqw' }}><Gummy shape="osito" color="#ff5fa2" size={90} shadow={false} style={{ width: '100%', height: 'auto' }} /></div>
            <div className="text-center font-extrabold leading-none" style={{ fontFamily: 'var(--gl-font)', color: '#4b2fa0', fontSize: '2.7cqw', marginTop: '.4cqw' }}>
              Gummy<br />Lab
            </div>
          </div>

          {/* Texto central */}
          <div className="absolute text-center" style={{ left: '19cqw', right: '19cqw', top: '18cqw', color: '#3a2a12', fontSize: '2.2cqw', lineHeight: 1.32, fontWeight: 500 }}>
            <p className="m-0">Por cuanto se certifica que la línea de producción</p>
            {lots && <p className="m-0" style={{ fontWeight: 700, fontStyle: 'italic' }}>“Lotes {lots}”</p>}
            <p className="m-0">
              ha cumplido satisfactoriamente con todos los estándares internacionales y locales de calidad, higiene y manejo sostenible de subproductos agroindustriales.
            </p>
            <p className="m-0" style={{ marginTop: '1.1cqw' }}>
              Otorgado a: <strong style={{ letterSpacing: '.02em' }}>GUMMY LAB - PLANTA QUITO, ECUADOR</strong>
            </p>
            <p className="m-0" style={{ marginTop: '1.6cqw', fontSize: '2cqw' }}>
              En testimonio de lo cual, se firma y sella este documento el día {longDate()}.
            </p>
          </div>

          {/* Sellos */}
          <GoldSeal className="absolute" style={{ right: '4.6cqw', top: '17cqw', width: '14cqw', filter: 'drop-shadow(0 .5cqw .6cqw rgba(60,35,5,.45))' }} />
          <WaxSeal className="absolute" style={{ right: '13cqw', bottom: '8.2cqw', width: '9cqw', filter: 'drop-shadow(0 .5cqw .6cqw rgba(60,10,10,.5))' }} />

          {/* Firmas */}
          <div className="absolute flex justify-between" style={{ left: '9cqw', right: '9cqw', bottom: '3.4cqw' }}>
            {[
              { name: 'Directora de Certificaciones Agroindustriales', d: 'M4 30 C9 8 15 6 14 22 C13 36 24 10 30 14 C36 18 27 33 38 21 C46 12 52 27 62 18 C70 11 74 25 84 17 L112 13', delay: '.4s' },
              { name: 'Gerente de Calidad - Gummy Lab', d: 'M6 24 C14 32 18 6 25 11 C31 16 22 35 34 24 C44 14 46 31 57 22 C65 15 71 21 79 27 C87 33 93 11 113 18', delay: '2.4s' },
            ].map((s) => (
              <div key={s.name} className="text-center" style={{ width: '32cqw' }}>
                <Signature d={s.d} delay={s.delay} />
                <div style={{ borderTop: '.15cqw solid #6b4a14' }} />
                <div style={{ fontSize: '1.3cqw', color: '#4a3512', fontWeight: 700, marginTop: '.3cqw' }}>{s.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───────── Botones fuera del marco ───────── */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => window.print()}
          className="rounded-full border-4 border-white/80 bg-gradient-to-b from-sky-300 to-blue-600 px-6 py-2 text-base font-extrabold tracking-wide text-white shadow-[0_5px_0_#1e3a8a] transition-transform hover:brightness-110 active:translate-y-1 sm:text-lg"
        >
          ⬇ Descargar Certificado (PDF)
        </button>
        <button
          onClick={onExit}
          className="rounded-full border-4 border-white/80 bg-gradient-to-b from-yellow-300 to-orange-500 px-6 py-2 text-base font-extrabold tracking-wide text-indigo-950 shadow-[0_5px_0_#b45309] transition-transform hover:brightness-110 active:translate-y-1 sm:text-lg"
        >
          ⌂ Volver al Inicio
        </button>
      </div>
    </div>
  );
}

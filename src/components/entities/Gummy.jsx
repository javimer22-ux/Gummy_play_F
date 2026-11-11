import { useId } from 'react';

/* ───────── Utilidades de color (solo visuales) ───────── */
const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
const parse = (hex) => {
  if (typeof hex !== 'string' || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};

export const WATER = '#8fd3ff';
/** 'transparent' (agua) u otros valores no hex → tinte de agua */
export const visibleColor = (c) => (parse(c) ? c : WATER);
/** Mezcla hacia blanco (amt>0) o negro (amt<0). */
export const shade = (hex, amt) => {
  const rgb = parse(hex) || parse(WATER);
  const target = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  return `rgb(${rgb.map((v) => clamp(v + (target - v) * p)).join(',')})`;
};

/* ───────── Geometría de cada molde (viewBox -6 -6 112 116) ───────── */
const STAR = (() => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 36 : 18;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(64 + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
})();

/** Cuerpo de la gomita (se pinta 2 veces: contorno + relleno). */
function ShapeBody({ shape, fill, stroke, sw }) {
  const p = { fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' };
  if (shape === 'estrella') return <polygon points={STAR} {...p} />;
  if (shape === 'osito') {
    return (
      <g {...p}>
        <circle cx="27" cy="26" r="10" />
        <circle cx="73" cy="26" r="10" />
        <circle cx="50" cy="42" r="24" />
        <circle cx="23" cy="70" r="9" />
        <circle cx="77" cy="70" r="9" />
        <ellipse cx="50" cy="75" rx="23" ry="19" />
        <circle cx="35" cy="91" r="9" />
        <circle cx="65" cy="91" r="9" />
      </g>
    );
  }
  return <rect x="12" y="22" width="76" height="74" rx="24" {...p} />;
}

/* ───────── GOMITA gelatinosa ───────── */
export default function Gummy({
  shape = 'cuadrado', color, size = 64, wobble = false, shadow = true, sparkle = false, className = '', ...rest
}) {
  const uid = useId().replace(/:/g, '');
  const base = visibleColor(color);
  const dark = shade(base, -0.45);
  return (
    <svg
      viewBox="-6 -6 112 116" width={size} height={(size * 116) / 112}
      className={`${wobble ? 'gl-jelly ' : ''}${className}`} aria-hidden="true" {...rest}
    >
      <defs>
        <radialGradient id={`gg${uid}`} cx=".3" cy=".22" r="1">
          <stop offset="0" stopColor={shade(base, 0.55)} />
          <stop offset=".45" stopColor={base} />
          <stop offset="1" stopColor={shade(base, -0.32)} />
        </radialGradient>
      </defs>
      {shadow && <ellipse cx="50" cy="100" rx="34" ry="5" fill="#2a1a55" opacity=".22" />}

      {/* contorno oscuro + relleno degradado = efecto gel translúcido */}
      <ShapeBody shape={shape} fill={dark} stroke={dark} sw="7" />
      <ShapeBody shape={shape} fill={`url(#gg${uid})`} stroke={`url(#gg${uid})`} sw="3" />

      {/* luz de borde inferior (luz que atraviesa el gel) */}
      <g opacity=".35" style={{ mixBlendMode: 'screen' }}>
        {shape === 'estrella' && <ellipse cx="50" cy="84" rx="14" ry="4" fill={shade(base, 0.7)} />}
        {shape === 'osito' && <ellipse cx="50" cy="84" rx="14" ry="4" fill={shade(base, 0.7)} />}
        {(shape === 'cuadrado' || !shape) && <rect x="26" y="84" width="48" height="5" rx="2.5" fill={shade(base, 0.7)} />}
      </g>

      {/* detalles de cada figura + brillos especulares */}
      {shape === 'osito' ? (
        <g>
          <circle cx="27" cy="26" r="5" fill={shade(base, 0.45)} opacity=".6" />
          <circle cx="73" cy="26" r="5" fill={shade(base, 0.45)} opacity=".6" />
          <ellipse cx="50" cy="76" rx="12" ry="10" fill={shade(base, 0.5)} opacity=".35" />
          <ellipse cx="50" cy="50" rx="10" ry="7.5" fill={shade(base, 0.6)} opacity=".85" />
          <ellipse cx="50" cy="46.5" rx="3.6" ry="2.6" fill={shade(base, -0.65)} />
          <circle cx="41" cy="38" r="3" fill={shade(base, -0.7)} />
          <circle cx="59" cy="38" r="3" fill={shade(base, -0.7)} />
          <circle cx="42" cy="37" r="1" fill="#fff" />
          <circle cx="60" cy="37" r="1" fill="#fff" />
          <path d="M34 27 Q40 20 50 20" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity=".85" />
          <ellipse cx="36" cy="64" rx="3" ry="6" fill="#fff" opacity=".6" transform="rotate(18 36 64)" />
        </g>
      ) : shape === 'estrella' ? (
        <g>
          <ellipse cx="41" cy="48" rx="9" ry="4.2" fill="#fff" opacity=".85" transform="rotate(-38 41 48)" />
          <circle cx="54" cy="36" r="2.4" fill="#fff" opacity=".9" />
        </g>
      ) : (
        <g>
          <path d="M24 38 Q24 30 33 30 H50" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".85" />
          <circle cx="62" cy="30" r="2.6" fill="#fff" opacity=".9" />
          <path d="M76 52 V66" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".35" />
        </g>
      )}

      {sparkle && (
        <g fill="#fff">
          <path className="gl-twinkle" d="M88 20 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
          <path className="gl-twinkle" style={{ animationDelay: '.5s' }} d="M6 44 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" />
        </g>
      )}
    </svg>
  );
}

/* ───────── MOLDE (bandeja de silicón con cavidad) ───────── */
export function GummyMold({ shape = 'cuadrado', size = 64, className = '' }) {
  return (
    <svg viewBox="-6 -6 112 116" width={size} height={(size * 116) / 112} className={className} aria-hidden="true">
      <rect x="-2" y="8" width="104" height="92" rx="24" fill="#b9c3ff" stroke="#7f8be0" strokeWidth="3" />
      <rect x="2" y="12" width="96" height="30" rx="16" fill="#fff" opacity=".35" />
      <g transform="translate(9 8) scale(.82)">
        <ShapeBody shape={shape} fill="#6f7bd0" stroke="#6f7bd0" sw="7" />
        <g transform="translate(0 3)">
          <ShapeBody shape={shape} fill="#8a96e6" stroke="#8a96e6" sw="3" />
        </g>
      </g>
    </svg>
  );
}

import { useId } from 'react';
import Gummy, { shade, visibleColor } from './Gummy';
import { STATION } from '../../constants/stations';

/** Bandeja física sobre la cinta: bol de vidrio con líquido → molde con gomita. */
export default function Tray({ tray, color }) {
  const uid = useId().replace(/:/g, '');
  const c = visibleColor(color);
  const frac = (tray.base ? 0.5 : 0) + (tray.gellingAgent ? 0.5 : 0);
  const lumps = tray.hasLumps === true;
  const hasShape = Boolean(tray.shape) && tray.station >= STATION.MOLDING;
  const hot = tray.temperature > 30 && tray.station >= STATION.HEATING;
  const burnt = tray.temperature > 80;
  const topY = hasShape ? 14 : 44;

  return (
    <svg viewBox="0 0 140 120" className="gl-tray__svg" aria-hidden="true">
      <ellipse cx="70" cy="108" rx="62" ry="9" fill="#2a1a55" opacity=".25" />
      <ellipse cx="70" cy="103" rx="60" ry="10" fill="url(#gl-metal)" stroke="#8f96bd" strokeWidth="2" />

      {hasShape ? (
        <g>
          <rect x="14" y="76" width="112" height="26" rx="13" fill="#d3d9ff" stroke="#8f9bdf" strokeWidth="3" />
          <rect x="22" y="80" width="96" height="6" rx="3" fill="#fff" opacity=".6" />
          <g className="gl-jelly">
            <Gummy shape={tray.shape} color={color} size={66} x="37" y="18" shadow={false} sparkle={tray.station >= STATION.QUALITY} />
          </g>
        </g>
      ) : (
        <g>
          <defs>
            <clipPath id={`bw${uid}`}><path d="M21 58H119Q119 100 70 100T21 58Z" /></clipPath>
          </defs>
          <path d="M21 58H119Q119 100 70 100T21 58Z" fill="#eef2ff" stroke="#b9c3ff" strokeWidth="2.5" />
          <g clipPath={`url(#bw${uid})`}>
            <g style={{ transform: `translateY(${(1 - frac) * 42}px)`, transition: 'transform .7s ease' }}>
              <rect x="20" y="60" width="100" height="44" style={{ fill: c, transition: 'fill .6s' }} />
              <ellipse cx="70" cy="60" rx="50" ry="6" style={{ fill: shade(c, 0.35), transition: 'fill .6s' }} />
            </g>
            {lumps && !hasShape && [[48, 78, 6], [66, 88, 4.5], [88, 80, 7], [102, 90, 4]].map(([x, y, r]) => (
              <circle key={x} cx={x} cy={y} r={r} fill="#fff3c9" stroke="#e0b45a" strokeWidth="1.5" />
            ))}
            {frac > 0 && (
              <>
                <circle className="gl-bubble" cx="50" cy="90" r="3" fill="#fff" opacity=".7" />
                <circle className="gl-bubble" style={{ animationDelay: '.8s' }} cx="82" cy="92" r="2.2" fill="#fff" opacity=".7" />
              </>
            )}
          </g>
          <ellipse cx="70" cy="58" rx="50" ry="6.5" fill="none" stroke="#fff" strokeWidth="3" opacity=".9" />
          <path d="M28 66q2 18 14 24" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".75" />
        </g>
      )}

      {/* vapor si la mezcla sigue caliente */}
      {hot && [48, 70, 92].map((x, i) => (
        <path key={x} className="gl-steam" style={{ animationDelay: `${i * 0.45}s` }}
          d={`M${x} ${topY} q-5 -7 0 -13 t0 -13`} stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
      ))}
      {/* humo si se quemó */}
      {burnt && [58, 80, 70].map((x, i) => (
        <circle key={x} className="gl-puff" style={{ animationDelay: `${i * 0.35}s` }} cx={x} cy={topY - 6} r="7" fill="#7a7a8c" />
      ))}
    </svg>
  );
}

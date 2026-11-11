/* Fondo de la fábrica: pared lila, ventanales con colinas, tuberías y banderines. */
const WINDOWS = [90, 330, 570, 810];
const BUNTING = ['#ff6fb5', '#ffc12e', '#5b8cff', '#34c759', '#ff8a2a', '#b995ff'];

export default function FactoryBackdrop() {
  return (
    <svg className="gl-scene__bg" viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="gl-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7b0ff" /><stop offset="1" stopColor="#f0d6ff" />
        </linearGradient>
        <linearGradient id="gl-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd6ff" /><stop offset="1" stopColor="#e4f7ff" />
        </linearGradient>
        <linearGradient id="gl-pipe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe27a" /><stop offset=".5" stopColor="#ffb020" /><stop offset="1" stopColor="#d9840e" />
        </linearGradient>
        <linearGradient id="gl-pipeP" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9a6ff" /><stop offset=".5" stopColor="#8b5cf6" /><stop offset="1" stopColor="#5b2fc0" />
        </linearGradient>
        <radialGradient id="gl-glow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" stopOpacity=".7" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1000" height="520" fill="url(#gl-wall)" />
      {/* franjas de pared */}
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={i * 90} y="0" width="45" height="520" fill="#fff" opacity=".07" />
      ))}
      <ellipse cx="500" cy="150" rx="520" ry="160" fill="url(#gl-glow)" />

      {/* ventanales con arco */}
      {WINDOWS.map((x, i) => (
        <g key={x}>
          <path d={`M${x} 250V120Q${x} 56 ${x + 50} 56T${x + 100} 120V250Z`} fill="#8a63e8" />
          <path d={`M${x + 8} 244V122Q${x + 8} 66 ${x + 50} 66T${x + 92} 122V244Z`} fill="url(#gl-sky)" />
          <path d={`M${x + 8} 244V200Q${x + 40} 168 ${x + 92} 196V244Z`} fill={i % 2 ? '#9be08a' : '#7ed67a'} />
          <path d={`M${x + 8} 244V220Q${x + 60} 196 ${x + 92} 222V244Z`} fill="#6cc96a" />
          <ellipse cx={x + 34 + (i % 2) * 20} cy="108" rx="18" ry="7" fill="#fff" opacity=".9" />
          <ellipse cx={x + 46 + (i % 2) * 20} cy="102" rx="12" ry="6" fill="#fff" opacity=".9" />
          <path d={`M${x + 50} 56V250M${x + 8} 150H${x + 92}`} stroke="#8a63e8" strokeWidth="5" />
          <path d={`M${x + 16} 122Q${x + 16} 80 ${x + 34} 74`} stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".55" />
          <rect x={x - 6} y="248" width="112" height="12" rx="6" fill="#a37cf2" />
        </g>
      ))}

      {/* tuberías doradas y moradas */}
      <path d="M0 40H330Q360 40 360 70V110" stroke="url(#gl-pipe)" strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M1000 36H700Q670 36 670 66V100" stroke="url(#gl-pipeP)" strokeWidth="18" fill="none" strokeLinecap="round" />
      {[120, 240, 740, 880].map((x, i) => (
        <rect key={x} x={x - 6} y={i < 2 ? 30 : 26} width="12" height="22" rx="4" fill="#fff" opacity=".7" />
      ))}
      <circle cx="360" cy="112" r="11" fill="url(#gl-pipe)" stroke="#c97a05" strokeWidth="2" />
      <circle cx="670" cy="102" r="11" fill="url(#gl-pipeP)" stroke="#52299e" strokeWidth="2" />

      {/* banderines */}
      <path d="M0 10Q250 54 500 14T1000 10" stroke="#fff" strokeWidth="2.5" fill="none" opacity=".8" />
      {Array.from({ length: 22 }).map((_, i) => {
        const x = 20 + i * 45;
        const y = 10 + Math.sin((i / 21) * Math.PI * 2) * 1 + (i < 11 ? i * 3.6 - i * i * 0.16 : (21 - i) * 3.6 - (21 - i) * (21 - i) * 0.16);
        return <path key={i} d={`M${x - 11} ${y}L${x + 11} ${y}L${x} ${y + 24}Z`} fill={BUNTING[i % BUNTING.length]} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />;
      })}

      {/* burbujas decorativas */}
      {[[70, 330, 14], [930, 300, 18], [500, 280, 10], [200, 380, 8], [800, 360, 12]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity=".28" />
      ))}
    </svg>
  );
}

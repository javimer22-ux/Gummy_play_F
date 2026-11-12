import { shade, visibleColor } from './Gummy';
import { CheckIcon } from './Icons';

/* ───────── Contenedores ilustrados ───────── */
const Lid = ({ color, y = 14 }) => (
  <g>
    <rect x="10" y={y} width="60" height="18" rx="8" fill={color} stroke={shade(color, -0.3)} strokeWidth="2" />
    <rect x="15" y={y + 3} width="40" height="4" rx="2" fill="#fff" opacity=".5" />
  </g>
);

const Glass = ({ children, clip }) => (
  <g>
    <rect x="12" y="30" width="56" height="62" rx="14" fill="#eef2ff" stroke="#b9c3ff" strokeWidth="2.5" />
    <clipPath id={clip}><rect x="14" y="32" width="52" height="58" rx="12" /></clipPath>
    <g clipPath={`url(#${clip})`}>{children}</g>
    <rect x="17" y="38" width="5" height="40" rx="2.5" fill="#fff" opacity=".75" />
  </g>
);

const Cube = ({ x, y }) => (
  <g>
    <rect x={x} y={y} width="15" height="15" rx="3.5" fill="#fff" stroke="#cfd6f5" strokeWidth="1.5" />
    <rect x={x + 2} y={y + 2} width="7" height="3" rx="1.5" fill="#eaf0ff" />
  </g>
);

const Panela = ({ x, y }) => (
  <g>
    <ellipse cx={x} cy={y + 12} rx="15" ry="5" fill="#7c3a0a" />
    <rect x={x - 15} y={y} width="30" height="12" fill="#b45309" />
    <ellipse cx={x} cy={y} rx="15" ry="5" fill="#d97a1c" />
    <ellipse cx={x - 4} cy={y - 1} rx="6" ry="1.8" fill="#f3b062" />
  </g>
);

function Jar({ kind }) {
  if (kind === 'water') {
    return (
      <svg viewBox="0 0 80 100" width="100%" height="100%">
        <ellipse cx="40" cy="96" rx="26" ry="4" fill="#2a1a55" opacity=".18" />
        <rect x="29" y="3" width="22" height="12" rx="4" fill="#3b82f6" stroke="#1e56c8" strokeWidth="2" />
        <path d="M31 14h18v8q16 6 16 22v38q0 12-12 12H27q-12 0-12-12V44q0-16 16-22z" fill="#e4f6ff" stroke="#8fd0ff" strokeWidth="2.5" />
        <path d="M17 58h46v24q0 10-12 10H29q-12 0-12-10z" fill="#4db5ff" />
        <path d="M17 58q11-6 23 0t23 0v4q-11 6-23 0t-23 0z" fill="#8fd8ff" />
        <path d="M40 66c4 5 6 8 6 11a6 6 0 01-12 0c0-3 2-6 6-11z" fill="#fff" opacity=".9" />
        <rect x="21" y="36" width="5" height="36" rx="2.5" fill="#fff" opacity=".8" />
      </svg>
    );
  }
  const cfg = {
    sugar: { lid: '#5b8cff', body: <><Cube x="20" y="62" /><Cube x="38" y="66" /><Cube x="29" y="48" /><Cube x="46" y="50" /></> },
    panela: { lid: '#c98b5a', body: <><Panela x="30" y="70" /><Panela x="50" y="76" /><Panela x="38" y="55" /></> },
    gel: {
      lid: '#ff6fb5',
      body: (
        <>
          <path d="M16 90V66q0-16 24-20t24 20v24z" fill="#ff8fc7" />
          <path d="M16 66q0-16 24-20t24 20q-24-8-48 0z" fill="#ffc2e2" />
          <ellipse cx="30" cy="62" rx="6" ry="3" fill="#fff" opacity=".8" transform="rotate(-20 30 62)" />
        </>
      ),
    },
  }[kind];
  return (
    <svg viewBox="0 0 80 100" width="100%" height="100%">
      <ellipse cx="40" cy="96" rx="30" ry="4" fill="#2a1a55" opacity=".18" />
      <Glass clip={`gl-jar-${kind}`}>{cfg.body}</Glass>
      <Lid color={cfg.lid} />
    </svg>
  );
}

const BADGES = {
  limon: (
    <g>
      <ellipse cx="40" cy="66" rx="13" ry="10.5" fill="#f2c80f" stroke="#fff" strokeWidth="1.5" />
      <ellipse cx="40" cy="66" rx="10" ry="7.8" fill="#fff27a" />
      <path d="M40 58.5v15M30.5 66h19M33.5 60.5l13 11M46.5 60.5l-13 11" stroke="#fffbd0" strokeWidth="1.5" />
      <path d="M26.5 66l-3 0M53.5 66l3 0" stroke="#f2c80f" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  mandarina: (
    <g>
      <path d="M40 55q-1-4 4-6q1 4-4 6z" fill="#22c55e" stroke="#fff" strokeWidth="1" />
      <ellipse cx="40" cy="67" rx="12.5" ry="10.5" fill="#ff8a1f" stroke="#fff" strokeWidth="1.5" />
      <ellipse cx="40" cy="67" rx="9.5" ry="7.8" fill="#ffc46b" />
      <path d="M40 59.5v15M31 67h18M33.8 61.6l12.4 10.8M46.2 61.6L33.8 72.4" stroke="#fff0cf" strokeWidth="1.5" />
    </g>
  ),
  pitahaya: (
    <g>
      <path d="M40 52l-3-5M40 52l3-5M33 55l-5-3M47 55l5-3" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="66" r="11" fill="#ff2f92" stroke="#fff" strokeWidth="1.5" />
      <circle cx="40" cy="66" r="7.5" fill="#fff" />
      {[[37, 63], [43, 63], [40, 67], [36, 69], [44, 69]].map(([x, y]) => <circle key={x + '' + y} cx={x} cy={y} r="1" fill="#222" />)}
    </g>
  ),
  cafe: (
    <g transform="rotate(-25 40 66)">
      <ellipse cx="40" cy="66" rx="9" ry="12" fill="#6b3a1a" stroke="#fff" strokeWidth="1.5" />
      <path d="M40 55q-5 6 0 11t0 11" stroke="#e8c79b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  ),
  citrico: (
    <g>
      <circle cx="40" cy="66" r="11.5" fill="#ff9d1c" stroke="#fff" strokeWidth="1.5" />
      <circle cx="40" cy="66" r="9" fill="#ffd45e" />
      <path d="M40 57v18M31 66h18M33.6 59.6l12.8 12.8M46.4 59.6L33.6 72.4" stroke="#fff3c4" strokeWidth="1.6" />
    </g>
  ),
};

function Bottle({ color, badge }) {
  const c = visibleColor(color);
  return (
    <svg viewBox="0 0 80 100" width="100%" height="100%">
      <ellipse cx="40" cy="96" rx="28" ry="4" fill="#2a1a55" opacity=".18" />
      <rect x="31" y="3" width="18" height="13" rx="4" fill="#d9a066" stroke="#a06a2f" strokeWidth="2" />
      <path d="M32 15h16v18q22 8 22 36 0 25-30 25T10 69q0-28 22-36z" fill={c} stroke={shade(c, -0.35)} strokeWidth="2.5" />
      <path d="M10 70q0 25 30 25t30-25q-8 12-30 12T10 70z" fill={shade(c, -0.3)} opacity=".6" />
      <ellipse cx="40" cy="66" rx="17" ry="16" fill="#fff" opacity=".92" />
      {BADGES[badge]}
      <path d="M19 52q-5 9-2 20" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".8" />
      <circle cx="28" cy="42" r="2.2" fill="#fff" opacity=".8" />
    </svg>
  );
}

/** Ilustración según id del ingrediente (con respaldo por color). */
export function IngredientArt({ id, color, size = 60 }) {
  let art;
  switch (id) {
    case 'b1': art = <Jar kind="water" />; break;
    case 'b2': art = <Jar kind="panela" />; break;
    case 'b3': art = <Jar kind="sugar" />; break;
    case 'g1': art = <Jar kind="gel" />; break;
    case 'p1': art = <Bottle color={color} badge="pitahaya" />; break;
    case 'p2': art = <Bottle color={color} badge="cafe" />; break;
    case 'p3': art = <Bottle color={color} badge="limon" />; break;
    case 'p4': art = <Bottle color={color} badge="citrico" />; break;
    case 'p5': art = <Bottle color={color} badge="mandarina" />; break;
    default: art = <Bottle color={color} />; break;
  }
  return <span style={{ width: size * 0.8, height: size, display: 'inline-block' }}>{art}</span>;
}

/** Tarjeta de ingrediente reutilizable (botón con frasco ilustrado). */
export default function IngredientCard({ item, selected, onClick, disabled, sub, artSize = 60 }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      className={`gl-item ${selected ? 'is-selected' : ''}`}
    >
      <span className="gl-item__art"><IngredientArt id={item.id} color={item.color} size={artSize} /></span>
      <span className="gl-item__name">{item.name}</span>
      {sub && <span className="gl-item__sub">{sub}</span>}
      {selected && <span className="gl-item__tick"><CheckIcon size={13} /></span>}
    </button>
  );
}

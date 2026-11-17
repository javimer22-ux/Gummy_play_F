import { useState } from 'react';

export default function RotateHint() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="gl-rotate-hint" role="status">
      <span>📱 Coloca el teléfono en horizontal para una mejor experiencia</span>
      <button onClick={() => setOpen(false)} aria-label="Cerrar aviso">✕</button>
    </div>
  );
}

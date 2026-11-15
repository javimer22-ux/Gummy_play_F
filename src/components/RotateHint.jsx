import { useState } from 'react';

export default function RotateHint() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="gl-rotate-hint" role="status">
      <span>📱 Gira el teléfono a horizontal para ver mejor la fábrica</span>
      <button onClick={() => setOpen(false)} aria-label="Cerrar aviso">✕</button>
    </div>
  );
}

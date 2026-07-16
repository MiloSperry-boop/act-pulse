interface ProgressRingProps {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  color = 'var(--accent)',
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  const offset = c * (1 - clamped);
  return (
    <div
      style={{ position: 'relative', width: size, height: size }}
      role="img"
      aria-label={`${label ?? 'Progress'}: ${Math.round(clamped * 100)} percent`}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 400ms var(--ease)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {label && (
          <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            {label}
          </span>
        )}
        {sublabel && (
          <span className="faint text-xs" style={{ marginTop: 2 }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

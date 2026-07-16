import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  accent = false,
  tight = false,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  tight?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`card ${accent ? 'card--accent' : ''} ${tight ? 'card--tight' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Chip({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'warn' | 'danger' | 'success';
}) {
  const cls = variant === 'default' ? 'chip' : `chip chip--${variant}`;
  return <span className={cls}>{children}</span>;
}

export function Bar({ value }: { value: number }) {
  return (
    <div className="bar" role="presentation">
      <span style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="row-between" style={{ marginBottom: 'var(--sp-2)' }}>
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 className="title">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
}: {
  icon?: ReactNode;
  title: string;
  message?: string;
}) {
  return (
    <div
      className="stack"
      style={{
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--sp-8) var(--sp-4)',
        color: 'var(--text-muted)',
      }}
    >
      {icon}
      <h3 className="title">{title}</h3>
      {message && <p className="muted">{message}</p>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="toggle"
      onClick={() => onChange(!checked)}
    />
  );
}

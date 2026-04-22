'use client'

interface TopBarProps {
  clientName?: string | null
}

export function TopBar({ clientName }: TopBarProps) {
  const initials = clientName
    ? clientName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <div
      style={{
        height: 56,
        borderBottom: '1px solid #e8e4dc',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px',
        gap: 12,
        flexShrink: 0,
      }}
    >
      <a
        href="/brand-scan"
        style={{
          background: '#b7e94c',
          color: '#111',
          fontSize: 13,
          fontWeight: 600,
          padding: '7px 16px',
          borderRadius: 8,
          textDecoration: 'none',
          display: 'inline-block',
          letterSpacing: '-0.01em',
        }}
      >
        Brand Scan
      </a>
      <div
        title={clientName ?? undefined}
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: '#f0fce0',
          color: '#3d6b00',
          fontSize: 12,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(183,233,76,0.4)',
          flexShrink: 0,
          cursor: 'default',
          userSelect: 'none',
        }}
      >
        {initials}
      </div>
    </div>
  )
}

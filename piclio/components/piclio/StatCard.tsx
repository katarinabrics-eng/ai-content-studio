interface StatCardProps {
  value: number | string
  label: string
  accent?: boolean
  sublabel?: string
}

export function StatCard({ value, label, accent = false, sublabel }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="text-3xl font-bold" style={{ color: accent ? '#b7e94c' : '#1a1225' }}>
        {value}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
      {sublabel && <div className="text-xs text-gray-400 mt-0.5">{sublabel}</div>}
    </div>
  )
}

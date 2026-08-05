import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function AttendanceTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#1A1A1A80' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#1A1A1A80' }} axisLine={false} tickLine={false} width={30} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
        />
        <Area type="monotone" dataKey="present" stroke="#FF6B00" strokeWidth={2.5} fill="url(#attendanceFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

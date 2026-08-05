import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export default function FeeCollectionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#1A1A1A80' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#1A1A1A80' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="paid" name="Collected" fill="#FF6B00" radius={[6, 6, 0, 0]} />
        <Bar dataKey="pending" name="Pending" fill="#FFD3B0" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

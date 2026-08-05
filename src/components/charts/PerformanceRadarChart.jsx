import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

export default function PerformanceRadarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="#00000012" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#1A1A1A80' }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#1A1A1A50' }} />
        <Radar name="Score" dataKey="score" stroke="#FF6B00" fill="#FF6B00" fillOpacity={0.35} strokeWidth={2} />
        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

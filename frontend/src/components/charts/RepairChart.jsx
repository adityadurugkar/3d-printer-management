import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444']
const RADIAN = Math.PI / 180

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

export default function RepairChart({ data = [] }) {
  return (
    <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 shadow-sm">
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Overview</h3>
      <h2 className="text-base font-bold text-foreground mb-5">Repairs by Status</h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground/50 text-sm">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label={renderCustomizedLabel} labelLine={false}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--card))',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

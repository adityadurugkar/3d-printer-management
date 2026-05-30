import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

const COLORS = ['hsl(262, 83%, 58%)', 'hsl(199, 89%, 48%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)']

export default function PrintersByTypeChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Models</h3>
        <h2 className="text-lg font-bold mb-4">Printers by Model</h2>
        <div className="flex items-center justify-center h-[260px] text-muted-foreground/60">No data available</div>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Models</h3>
      <h2 className="text-lg font-bold mb-4">Printers by Model</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="_id" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={120} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

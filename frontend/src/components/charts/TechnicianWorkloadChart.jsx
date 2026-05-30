import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const COLORS = ['hsl(262, 83%, 58%)', 'hsl(199, 89%, 48%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)']

export default function TechnicianWorkloadChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Workload</h3>
        <h2 className="text-lg font-bold mb-4">Technician Workload</h2>
        <div className="flex items-center justify-center h-[260px] text-muted-foreground/60">No data available</div>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Workload</h3>
      <h2 className="text-lg font-bold mb-4">Technician Workload</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barSize={36} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

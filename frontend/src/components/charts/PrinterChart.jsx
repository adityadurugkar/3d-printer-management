import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function PrinterChart({ data = [] }) {
  return (
    <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 shadow-sm">
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Analytics</h3>
      <h2 className="text-base font-bold text-foreground mb-5">Printers by Brand</h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground/50 text-sm">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
            <XAxis dataKey="_id" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--card))',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

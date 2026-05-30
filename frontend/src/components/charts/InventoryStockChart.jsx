import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

const getBarColor = (qty) => {
  if (qty <= 2) return '#EF4444'
  if (qty <= 5) return '#F59E0B'
  return 'hsl(var(--primary))'
}

export default function InventoryStockChart({ data = [] }) {
  return (
    <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 shadow-sm">
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Stock</h3>
      <h2 className="text-base font-bold text-foreground mb-5">Inventory Stock Levels</h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[260px] text-muted-foreground/50 text-sm">No inventory data</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical" barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} opacity={0.5} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="partName" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={100} />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--card))',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar dataKey="quantity" radius={[0, 6, 6, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={getBarColor(entry.quantity)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

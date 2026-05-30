import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

const getBarColor = (qty) => {
  if (qty <= 2) return '#EF4444'
  if (qty <= 5) return '#F59E0B'
  return 'hsl(var(--primary))'
}

export default function InventoryStockChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Stock</h3>
        <h2 className="text-lg font-bold mb-4">Inventory Stock Levels</h2>
        <div className="flex items-center justify-center h-[260px] text-muted-foreground/60">No inventory data</div>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Stock</h3>
      <h2 className="text-lg font-bold mb-4">Inventory Stock Levels</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="partName" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={100} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
          <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getBarColor(entry.quantity)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

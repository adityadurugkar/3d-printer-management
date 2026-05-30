import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function fillMissingMonths(data = []) {
  const now = new Date()
  const result = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const found = data.find(item => item._id.year === year && item._id.month === month)
    result.push({
      name: `${MONTHS[month - 1]} ${year}`,
      repairs: found ? found.count : 0,
    })
  }
  return result
}

export default function MonthlyRepairsChart({ data = [] }) {
  const chartData = fillMissingMonths(data)

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 shadow-sm">
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Trends</h3>
      <h2 className="text-base font-bold text-foreground mb-5">Monthly Repairs</h2>
      {chartData.every(d => d.repairs === 0) ? (
        <div className="flex items-center justify-center h-[260px] text-muted-foreground/50 text-sm">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={30} />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--card))',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Area type="monotone" dataKey="repairs" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#monthlyGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ProductivityChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { date: 'Пн', productivity: 78 },
    { date: 'Вт', productivity: 85 },
    { date: 'Ср', productivity: 92 },
    { date: 'Чт', productivity: 88 },
    { date: 'Пт', productivity: 95 },
    { date: 'Сб', productivity: 90 },
    { date: 'Вс', productivity: 84 },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
            formatter={(val) => [`${val}%`, 'Продуктивность']}
          />
          <Area type="monotone" dataKey="productivity" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorProd)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

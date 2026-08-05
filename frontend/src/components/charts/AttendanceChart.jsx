import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function AttendanceChart({ attended = 18, late = 2, absent = 1 }) {
  const data = [
    { name: 'Присутствие', value: attended, color: '#10b981' },
    { name: 'Опоздание', value: late, color: '#f59e0b' },
    { name: 'Пропуск', value: absent, color: '#ef4444' },
  ];

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
          <Legend formatter={(value) => <span className="text-slate-300 text-sm font-medium">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

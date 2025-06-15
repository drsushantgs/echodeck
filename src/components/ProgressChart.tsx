'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ChartEntry {
  date: string;
  percent: number;
}

export default function ProgressChart({ data }: { data: ChartEntry[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="text-md font-semibold mb-2">📈 Your Progress</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#555" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#555" />
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Line type="monotone" dataKey="percent" stroke="#14B8A6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
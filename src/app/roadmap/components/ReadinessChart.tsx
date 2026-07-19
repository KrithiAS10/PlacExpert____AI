"use client";

import dynamic from "next/dynamic";

const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(m => m.Area), { ssr: false });
const Line = dynamic(() => import("recharts").then(m => m.Line), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });

export function ReadinessChart({ score = 3.2 }: { score?: number }) {
  const chartData = [
    { day: "Day 1", actual: score, projected: score },
    { day: "Day 14", actual: score + 1.2 > 10 ? 10 : score + 1.2, projected: score + 1.5 },
    { day: "Day 30", projected: score + 2.8 > 10 ? 10 : score + 2.8 },
    { day: "Day 45", projected: score + 4.0 > 10 ? 10 : score + 4.0 },
  ];

  return (
    <div className="h-[120px] w-full min-h-[120px]">
      <ResponsiveContainer width="99%" height={120}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#06b6d4' }}
          />
          <Area 
            type="monotone" 
            dataKey="actual" 
            stroke="#06b6d4" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorActual)" 
          />
          <Line 
            type="monotone" 
            dataKey="projected" 
            stroke="#3b82f6" 
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

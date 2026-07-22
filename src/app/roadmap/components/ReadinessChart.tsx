"use client";

import dynamic from "next/dynamic";

const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(m => m.Area), { ssr: false });
const Line = dynamic(() => import("recharts").then(m => m.Line), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });

interface AnalyticsDataPoint {
  id?: string;
  userId?: string;
  date: Date | string;
  metric: string;
  value: number;
}

interface ReadinessChartProps {
  score?: number;
  analytics?: AnalyticsDataPoint[];
}

export function ReadinessChart({ score = 3.2, analytics = [] }: ReadinessChartProps) {
  // Filter for "Readiness" metrics and sort by date ascending
  const readinessPoints = analytics
    .filter(pt => pt.metric === "Readiness")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let chartData: { day: string; actual?: number; projected: number }[] = [];

  if (readinessPoints.length <= 1) {
    const startScore = readinessPoints[0]?.value ?? score;
    chartData = [
      { day: "Day 1", actual: startScore, projected: startScore },
      { day: "Day 15", projected: Math.min(10, startScore + 1.5) },
      { day: "Day 30", projected: Math.min(10, startScore + 3.0) },
      { day: "Day 45", projected: Math.min(10, startScore + 4.5) },
    ];
  } else {
    const startScore = readinessPoints[0].value;
    const totalPoints = readinessPoints.length;

    chartData = readinessPoints.map((pt, index) => {
      // Calculate a projected score that linearly scales up to 10
      const progressRatio = index / Math.max(1, totalPoints - 1);
      const projectedValue = startScore + progressRatio * (10.0 - startScore);

      // Clean date representation for X-axis
      const dateObj = new Date(pt.date);
      const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      return {
        day: formattedDate,
        actual: Number(pt.value.toFixed(1)),
        projected: Number(projectedValue.toFixed(1)),
      };
    });
  }

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

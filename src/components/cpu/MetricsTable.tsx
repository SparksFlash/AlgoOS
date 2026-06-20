'use client';

import { motion } from 'framer-motion';
import { SchedulingResult } from '@/lib/algorithms/cpu-scheduling';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MetricsTableProps {
  result: SchedulingResult;
}

export default function MetricsTable({ result }: MetricsTableProps) {
  const chartData = result.metrics.map((m) => ({
    name: m.id,
    'Waiting Time': m.waitingTime,
    'Turnaround Time': m.turnaroundTime,
    'Response Time': m.responseTime,
    fill: m.color,
  }));

  return (
    <div className="space-y-4">
      {/* Metrics Table */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Process Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['PID', 'AT', 'BT', 'CT', 'TAT', 'WT', 'RT'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-white/40 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.metrics.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/2"
                >
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                      <span className="font-mono text-white/80 text-xs font-bold">{m.id}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-white/60 text-xs">{m.arrivalTime}</td>
                  <td className="py-2.5 px-3 font-mono text-white/60 text-xs">{m.burstTime}</td>
                  <td className="py-2.5 px-3 font-mono text-white/80 text-xs">{m.completionTime}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                      {m.turnaroundTime}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">
                      {m.waitingTime}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                      {m.responseTime}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Averages */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
          {[
            { label: 'Avg Waiting', value: result.avgWaiting.toFixed(2), color: 'text-amber-300', bg: 'bg-amber-500/10' },
            { label: 'Avg Turnaround', value: result.avgTurnaround.toFixed(2), color: 'text-indigo-300', bg: 'bg-indigo-500/10' },
            { label: 'CPU Utilization', value: `${result.cpuUtilization.toFixed(1)}%`, color: 'text-emerald-300', bg: 'bg-emerald-500/10' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-lg p-3 text-center`}>
              <p className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Visual Comparison</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={2} barCategoryGap="30%">
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0' }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Bar dataKey="Waiting Time" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Turnaround Time" fill="#6366f1" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Response Time" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

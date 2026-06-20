'use client';

import { useCPUStore } from '@/stores/cpu-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ProcessInputTable() {
  const { processes, addProcess, removeProcess, updateProcess } = useCPUStore();
  const [at, setAt] = useState('');
  const [bt, setBt] = useState('');
  const [pri, setPri] = useState('');

  const handleAdd = () => {
    const arrival = parseInt(at) || 0;
    const burst = parseInt(bt) || 1;
    const priority = parseInt(pri) || 1;
    if (burst < 1) return;
    addProcess({ arrivalTime: arrival, burstTime: burst, priority });
    setAt(''); setBt(''); setPri('');
  };

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Process Table</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2 px-2 text-white/40 font-medium text-xs">PID</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium text-xs">Arrival</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium text-xs">Burst</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium text-xs">Priority</th>
              <th className="py-2 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: p.color }} />
                    <span className="font-mono text-white/80 text-xs font-bold">{p.id}</span>
                  </div>
                </td>
                <td className="py-2 px-2">
                  <Input
                    type="number" min={0}
                    value={p.arrivalTime}
                    onChange={(e) => updateProcess(p.id, { arrivalTime: parseInt(e.target.value) || 0 })}
                    className="h-7 w-16 text-xs bg-white/5 border-white/10 text-white"
                  />
                </td>
                <td className="py-2 px-2">
                  <Input
                    type="number" min={1}
                    value={p.burstTime}
                    onChange={(e) => updateProcess(p.id, { burstTime: parseInt(e.target.value) || 1 })}
                    className="h-7 w-16 text-xs bg-white/5 border-white/10 text-white"
                  />
                </td>
                <td className="py-2 px-2">
                  <Input
                    type="number" min={1}
                    value={p.priority}
                    onChange={(e) => updateProcess(p.id, { priority: parseInt(e.target.value) || 1 })}
                    className="h-7 w-16 text-xs bg-white/5 border-white/10 text-white"
                  />
                </td>
                <td className="py-2 px-2">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => removeProcess(p.id)}
                    className="h-7 w-7 p-0 text-white/30 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add row */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
        <Input
          placeholder="AT" type="number" min={0} value={at}
          onChange={(e) => setAt(e.target.value)}
          className="h-8 w-16 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/20"
        />
        <Input
          placeholder="BT" type="number" min={1} value={bt}
          onChange={(e) => setBt(e.target.value)}
          className="h-8 w-16 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/20"
        />
        <Input
          placeholder="P" type="number" min={1} value={pri}
          onChange={(e) => setPri(e.target.value)}
          className="h-8 w-16 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/20"
        />
        <Button
          size="sm" onClick={handleAdd}
          className="h-8 px-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/20"
          disabled={processes.length >= 8}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add
        </Button>
      </div>
      <p className="text-[10px] text-white/25 mt-2">AT=Arrival Time, BT=Burst Time, P=Priority (lower = higher priority)</p>
    </div>
  );
}
